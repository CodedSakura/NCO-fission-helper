import React from 'react';

import "./Style/App.scss"
import {getReactorFromHellrageConfig} from "./Utils/parsers/HellragePlanner";
import {Config} from "./Utils/Config";

import sampleC from "./Utils/parsers/ZAHEB-248_23_x_23_x_23.json";
import FissionReactor from "./Components/FissionReactor";
import {SFRGrid} from "./Utils/Grids/SFRGrid";
import BurgerMenu from "./Components/BurgerMenu";
import {dataMap} from "./Utils/dataMap";
import DarkenedBackground from "./Components/DarkenedBackground";
import {overlayClosedEvent, overlayCloseInvokeEvent, overlayOpenInvokeEvent} from "./Utils/events";
import {getAsset} from "./Utils/utils";


interface State {
  reactor: SFRGrid|undefined
  overlay: boolean
}

class App extends React.Component<{}, State> {
  state: State = {
    reactor: undefined,
    overlay: false
  }

  componentDidMount() {
    fetch("./nuclearcraft_default.cfg").then(r => r.text()).then(t => {
      const cfg = new Config(t, "0.0.1");
      console.log(cfg);
      const r = getReactorFromHellrageConfig(sampleC, cfg);
      this.setState({reactor: r});
    });

    document.addEventListener(overlayOpenInvokeEvent, this.openOverlay);
    document.addEventListener(overlayCloseInvokeEvent, this.closeOverlay);
  }

  openOverlay = () => {
    this.setState({overlay: true});
  };
  closeOverlay = () => {
    document.dispatchEvent(new Event(overlayClosedEvent));
    this.setState({overlay: false});
  };

  render() {
    return <>
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
            <button>Import</button>
            <button>Export</button>
          </div>
          <div>
            <div className="flex__cols flex--even">
              Scale:
              <div className="scale_select">
                <button>-</button>
                <input type="text" value={2} readOnly tabIndex={-1}/>
                <button>+</button>
              </div>
            </div>
            <div className="flex__cols flex--even">
              <button>Display options</button>
            </div>
          </div>
          <div className="dim_select">
            <div>
              <input type="number"/>
              &times;
              <input type="number"/>
              &times;
              <input type="number"/>
            </div>
            <div>
              <button>Reset</button>
            </div>
            <div>
              <button>Manage symmetries</button>
            </div>
          </div>
          <div className="block_picker">
            {
              dataMap["0.0.1"].fission.components.sink.map((v: string) =>
                <img key={v} src={getAsset(`/fission/sink/${v}.png`)} alt={v} className={"crisp"}/>)
            }
          </div>
          <div className="stats">stats</div>
        </div>
        <div className="grid_container">
          <div className="navigation">
            <button className="navigation--active">Solid Fusion Reactors</button>
            <button>Molten Salt Reactors [WIP]</button>
            <button>Turbines [WIP]</button>
            <button>Linear Accelerators [WIP]</button>
          </div>
          <div className="navigation">
            <button className="navigation--active">Unnamed Reactor</button>
            <button>+</button>
          </div>
          <div className="grid_base">
            {this.state.reactor ? <FissionReactor reactor={this.state.reactor}/> : undefined}
          </div>
        </div>
      </div>
      <DarkenedBackground enabled={this.state.overlay} onClick={this.closeOverlay}/>
    </>;
  }
}

export default App;
