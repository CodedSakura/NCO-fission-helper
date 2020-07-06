import React from 'react';

import "./Style/App.scss"
import {getReactorFromHellrageConfig, HellrageParserVersionError} from "./Utils/parsers/HellragePlanner";
import {Config} from "./Utils/Config";

import sampleC from "./Utils/parsers/ZALEU-235_OXHEP-239_7_x_7_x_7.json";
import FissionReactor from "./Components/Grids/FissionReactor";
import {SFRGrid} from "./Utils/Grids/SFRGrid";
import BurgerMenu from "./Components/BurgerMenu";
import {latestDM} from "./Utils/dataMap";
import DarkenedBackground from "./Components/DarkenedBackground";
import {alertInvokeEvent, overlayClosedEvent, overlayCloseInvokeEvent, overlayOpenInvokeEvent} from "./Utils/events";
import {classMap, dispatchAlert} from "./Utils/utils";
import {Dimensions} from "./Utils/types";
import Modal from "./Components/Modal";
import {GenericGrid, GridType} from "./Utils/Grids/GenericGrid";
import Alert, {AlertType, IAlert} from "./Components/Alert";

enum ModalState {
  None, Import, Export, Symmetries, Display, Stats
}

enum ImportMode {
  Override, Additive
}

enum ImportFileTypes {
  NCPF, HellrageOverhaul, HellrageUnderhaul, NRp
}


interface State {
  grids: {[x in GridType]: GenericGrid<x>[]}
  active: {type: GridType, index: number}
  overlay: boolean
  displayScale: number
  dimensions: Dimensions
  modalState: ModalState
  importFiles: FileList|null
  importFileDetails: {type: ImportFileTypes}[]|null
  importMode: ImportMode
  activeAlerts: {[x: number]: JSX.Element}
}

class App extends React.Component<{}, State> {
  state: State = {
    grids: {
      [GridType.SFR]: [], [GridType.MSR]: [], [GridType.Turbine]: []
    },
    active: {
      type: GridType.SFR,
      index: -1
    },
    overlay: false,
    displayScale: 2,
    dimensions: {width: 7, depth: 7, height: 7},
    modalState: ModalState.None,
    importFiles: null,
    importFileDetails: null,
    importMode: ImportMode.Additive,
    activeAlerts: {},
  }
  config: Config|undefined;
  alertID: number = 0;

  componentDidMount() {
    fetch("./nuclearcraft_default.cfg").then(r => r.text()).then(t => {
      this.config = new Config(t, "0.0.1");
      const r = getReactorFromHellrageConfig(sampleC, this.config);
      r.name = "Preview Reactor";
      this.addSFR(r);
    });

    document.addEventListener(overlayOpenInvokeEvent, this.openOverlay);
    document.addEventListener(overlayCloseInvokeEvent, this.closeOverlay);

    document.addEventListener(alertInvokeEvent, this.alertEvent);
  }

  importChange = ({target: {files}}: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({importFiles: files});
  };
  importAction = () => {
    if (!this.state.importFiles) return;
    if (this.state.importMode === ImportMode.Override) {
      this.setState({
        grids: {
          [GridType.SFR]: [], [GridType.MSR]: [], [GridType.Turbine]: []
        },
        active: {
          type: GridType.SFR,
          index: -1
        }
      })
    }
    Array.from(this.state.importFiles).forEach(f => {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        if (!reader.result) throw new Error(/*TODO*/);
        if (reader.result instanceof ArrayBuffer) throw new Error(/*TODO*/);
        try {
          const r = getReactorFromHellrageConfig(JSON.parse(reader.result), this.config!);
          r.name = f.name;
          this.addSFR(r);
        } catch (e) {
          if (e instanceof HellrageParserVersionError) {
            dispatchAlert(AlertType.Error, "This planner currently supports only NC Overhauled!")
          } else {
            dispatchAlert(AlertType.Error, `Failed to parse config in \`${f.name}\``);
            console.error(e, reader.result, f);
          }
        }
      });
      reader.addEventListener("error", e => {
        dispatchAlert(AlertType.Error, `Failed to read file \`${f.name}\``);
        console.error(e, f);
      });
      reader.readAsText(f);
    });
    this.setState({modalState: ModalState.None});
  };

  activeValid(): boolean {
    const {active: {index, type}, grids} = this.state;
    return index >= 0 && index < grids[type].length;
  }

  addSFR = (r: SFRGrid) => {
    console.log("add");
    this.setState(s => {
      const {grids} = s;
      return {
        grids: {...grids, [GridType.SFR]: [...grids[GridType.SFR], r]},
        active: {type: GridType.SFR, index: grids[GridType.SFR].length}
      };
    });
  };
  resetSFR = () => {
    const {grids, dimensions, active: {type, index}} = this.state;
    if (this.activeValid()) {
      grids[type][index].reset(dimensions);
    } else {
      this.addSFR(new SFRGrid(this.config!, dimensions, latestDM.version));
    }
  };

  openOverlay = () => {
    this.setState({overlay: true});
  };
  closeOverlay = () => {
    document.dispatchEvent(new Event(overlayClosedEvent));
    this.setState({overlay: false});
  };

  alertEvent = (e: Event) => {
    const d = e as CustomEvent<IAlert>;
    this.setState(s => {
      const id = this.alertID++;
      return {
        activeAlerts: {
          ...s.activeAlerts,
          [id]: <Alert key={id} type={d.detail.type} onDeath={this.alertDeath(id)}>{d.detail.message}</Alert>
        }
      };
    });
  }
  alertDeath = (id: number) => () => {
    this.setState(s => {
      delete s.activeAlerts[id];
      return s;
    })
  };

  render() {
    const {active: {index, type}, grids} = this.state;
    const activeGrid = this.activeValid() ? grids[type][index] : null;
    return <>
      <Modal shown={this.state.modalState === ModalState.Import} onClose={() => this.setState({modalState: ModalState.None})}
             className="modal__import">
        <div className="modal__head">
          Import
        </div>
        <div className="modal__body">
          Import mode<br/>
          <label>
            <input type="radio" name="import-type" checked={this.state.importMode === ImportMode.Override}
                   onChange={() => this.setState({importMode: ImportMode.Override})}/>
            Override
          </label>
          <br/>
          <label>
            <input type="radio" name="import-type" checked={this.state.importMode === ImportMode.Additive}
                   onChange={() => this.setState({importMode: ImportMode.Additive})}/>
            Additive
          </label>
        </div>
        <div className="modal__footer">
          <input type="file" id="import-file" accept="application/json,.ncpf" multiple onChange={this.importChange}/>
          <label htmlFor="import-file">{this.state.importFiles ? `${this.state.importFiles.length} file(s) selected` : "Select files..."}</label>
          {this.state.importFiles ? <><br/><button onClick={this.importAction}>Import</button></> : undefined}
        </div>
      </Modal>
      <div className="main_container">
        <div className="sidebar">
          <div className="title">
            <BurgerMenu>
              <div className="panel__link">Selection A</div>
              <div className="panel__link panel__link--active">Selection B</div>
              <div className="panel__link">Selection C</div>
              <div className="panel__separator"/>
              <div className="panel__link">Settings</div>
              <div className="panel__footer">
                Made by CodedSakura, 2020<br/>
                <a tabIndex={-1} href={`https://github.com/CodedSakura/NCO-fission-helper/commit/${process.env.REACT_APP_GIT_SHA}`}>{process.env.REACT_APP_GIT_SHA}</a> /
                {" "}<a tabIndex={-1} href="https://github.com/CodedSakura/NCO-fission-helper">{"???"}</a><br/>
              </div>
            </BurgerMenu>
            NAME
          </div>
          <div className="flex__cols flex--even">
            <button onClick={() => this.setState({modalState: ModalState.Import, importFiles: null, importFileDetails: null})}>Import</button>
            <button onClick={() => this.setState({modalState: ModalState.Export})}>Export [NYI]</button>
          </div>
          <div>
            <div className="flex__cols flex--even">
              Scale:
              <div className="scale_select">
                <button onClick={() => this.setState(v => ({displayScale: (v.displayScale - 0.5) || 0.5}))}>-</button>
                <input type="text" value={this.state.displayScale} readOnly tabIndex={-1}/>
                <button onClick={() => this.setState(v => ({displayScale: v.displayScale + 0.5}))}>+</button>
              </div>
            </div>
            <div className="flex__cols flex--even">
              <button>Display options [NYI]</button>
            </div>
          </div>
          <div className="dim_select">
            <div>
              <input type="number" min={1} value={this.state.dimensions.width}
                     onChange={({target: {value}}) => this.setState(s => ({dimensions: {...s.dimensions, width: parseInt(value)}}))}/>
              &times;
              <input type="number" min={1} value={this.state.dimensions.height}
                     onChange={({target: {value}}) => this.setState(s => ({dimensions: {...s.dimensions, height: parseInt(value)}}))}/>
              &times;
              <input type="number" min={1} value={this.state.dimensions.depth}
                     onChange={({target: {value}}) => this.setState(s => ({dimensions: {...s.dimensions, depth: parseInt(value)}}))}/>
            </div>
            <div>
              <button onClick={() => {if (window.confirm("Really reset?")) this.resetSFR()}}>Reset</button>
            </div>
            <div>
              <button>Manage symmetries [NYI]</button>
            </div>
          </div>
          <div className="block_picker">
            {
              activeGrid ? activeGrid.pickerFiles.map((v, i) =>
                <img key={i} src={v.filepath} alt={v.tile} className={"crisp"}/>) : undefined
            }
          </div>
          <div className="stats">stats [NYI]</div>
        </div>
        <div className="grid_container">
          <div className="navigation">
            <button className="navigation--active">Solid Fusion Reactors ({grids[GridType.SFR].length}) [WIP]</button>
            <button>Molten Salt Reactors ({grids[GridType.MSR].length}) [NYI]</button>
            <button>Turbines ({grids[GridType.Turbine].length}) [NYI]</button>
            <button>Linear Accelerators [NYI]</button>
          </div>
          <div className="navigation">
            {grids[type].map((v, i) =>
              <button key={i} className={classMap(i === index && "navigation--active")}
                      onClick={() => this.setState(s => ({active: {...s.active, index: i}}))}>{v.name}</button>
            )}
            <button>+ [NYI]</button>
          </div>
          <div className="grid_base">
            {activeGrid ? {
              [GridType.SFR]: <FissionReactor reactor={activeGrid as SFRGrid} scale={this.state.displayScale}/>,
              [GridType.MSR]: null,
              [GridType.Turbine]: null,
            }[type] : undefined}
          </div>
        </div>
      </div>
      <DarkenedBackground enabled={this.state.overlay} onClick={this.closeOverlay}/>
      <div className="alert__cont">
        {Object.values(this.state.activeAlerts).reverse()}
      </div>
    </>;
  }
}

export default App;
