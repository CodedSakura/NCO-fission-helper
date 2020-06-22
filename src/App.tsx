import React from 'react';

import "./Style/App.scss"
import {getReactorFromHellrageConfig} from "./Utils/parsers/HellragePlanner";
import {Config} from "./Utils/Config";

import sampleC from "./Utils/parsers/ZAHEB-248_23_x_23_x_23.json";
import FissionReactor from "./Components/FissionReactor";
import {SFRGrid} from "./Utils/Grids/SFRGrid";
import BurgerMenu from "./Components/BurgerMenu";
import {dataMap, latestDM} from "./Utils/dataMap";
import DarkenedBackground from "./Components/DarkenedBackground";
import {overlayClosedEvent, overlayCloseInvokeEvent, overlayOpenInvokeEvent} from "./Utils/events";
import {getAsset} from "./Utils/utils";
import {Dimensions} from "./Utils/types";
import Modal from "./Components/Modal";

enum ModalState {
  None, Import, Export, Symmetries, Display, Stats
}

enum ImportMode {
  Override, Additive
}


interface State {
  reactor: SFRGrid|undefined
  overlay: boolean
  displayScale: number
  dimensions: Dimensions
  modalState: ModalState
  importFiles: FileList|null
  importMode: ImportMode
}

class App extends React.Component<{}, State> {
  state: State = {
    reactor: undefined,
    overlay: false,
    displayScale: 2,
    dimensions: {width: 7, depth: 7, height: 7},
    modalState: ModalState.None,
    importFiles: null,
    importMode: ImportMode.Additive
  }
  config: Config|undefined;

  componentDidMount() {
    fetch("./nuclearcraft_default.cfg").then(r => r.text()).then(t => {
      this.config = new Config(t, "0.0.1");
      // console.log(cfg);
      const r = getReactorFromHellrageConfig(sampleC, this.config);
      this.setActiveSFR(r);
    });

    document.addEventListener(overlayOpenInvokeEvent, this.openOverlay);
    document.addEventListener(overlayCloseInvokeEvent, this.closeOverlay);
  }

  importChange = ({target: {files}}: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({importFiles: files});
  };
  importAction = () => {
    if (!this.state.importFiles) return;
    Array.from(this.state.importFiles).forEach(f => {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        console.log(reader.result);
      });
      reader.addEventListener("error", e => {
        console.error(e);
        // TODO: error handling
      })
      reader.readAsText(f);
    });
    this.setState({modalState: ModalState.None});
  };

  setActiveSFR = (r: SFRGrid) => {
    this.setState({reactor: r, dimensions: {height: r.grid.length, depth: r.grid[0].length, width: r.grid[0][0].length}});
  };
  createSFR = () => {
    const r = new SFRGrid(this.config!, this.state.dimensions, latestDM.version);
    this.setState({reactor: r});
  };

  openOverlay = () => {
    this.setState({overlay: true});
  };
  closeOverlay = () => {
    document.dispatchEvent(new Event(overlayClosedEvent));
    this.setState({overlay: false});
  };

  render() {
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
            <button onClick={() => this.setState({modalState: ModalState.Import})}>Import [NYI]</button>
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
              <button onClick={() => {if (window.confirm("Really reset?")) this.createSFR()}}>Reset</button>
            </div>
            <div>
              <button>Manage symmetries [NYI]</button>
            </div>
          </div>
          <div className="block_picker">
            {
              dataMap["0.0.1"].fission.components.sink.map((v: string) =>
                <img key={v} src={getAsset(`/fission/sink/${v}.png`)} alt={v} className={"crisp"}/>)
            }
          </div>
          <div className="stats">stats [NYI]</div>
        </div>
        <div className="grid_container">
          <div className="navigation">
            <button className="navigation--active">Solid Fusion Reactors [WIP]</button>
            <button>Molten Salt Reactors [NYI]</button>
            <button>Turbines [NYI]</button>
            <button>Linear Accelerators [NYI]</button>
          </div>
          <div className="navigation">
            <button className="navigation--active">Unnamed Reactor</button>
            <button>+ [NYI]</button>
          </div>
          <div className="grid_base">
            {this.state.reactor ? <FissionReactor reactor={this.state.reactor} scale={this.state.displayScale}/> : undefined}
          </div>
        </div>
      </div>
      <DarkenedBackground enabled={this.state.overlay} onClick={this.closeOverlay}/>
    </>;
  }
}

export default App;
