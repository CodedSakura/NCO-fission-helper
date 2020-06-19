import React from 'react';

import "./Style/App.scss"
import {getReactorFromHellrageConfig} from "./Utils/parsers/HellragePlanner";
import {Config} from "./Utils/Config";

import sampleC from "./Utils/parsers/ZAHEB-248_23_x_23_x_23.json";
import FissionReactor from "./Components/FissionReactor";
import {FissionReactorGrid} from "./Utils/Grids/FissionReactorGrid";
import BurgerMenu from "./Components/BurgerMenu";
import {dataMap} from "./Utils/dataMap";
import DarkenedBackground from "./Components/DarkenedBackground";
import {overlayClosedEvent, overlayCloseInvokeEvent, overlayOpenInvokeEvent} from "./Utils/events";


interface State {
  reactor: FissionReactorGrid|undefined
  overlay: boolean
}

class App extends React.Component<{}, State> {
  state: State = {
    reactor: undefined,
    overlay: true
  }

  componentDidMount() {
    fetch("./nuclearcraft_default.cfg").then(r => r.text()).then(t => {
      const cfg = new Config(t, "0.0.1");
      const r = getReactorFromHellrageConfig(sampleC, cfg);
      // console.log(JSON.stringify(r.export()));
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
            <BurgerMenu/>
            NAME
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
              <a href="/">Manage symmetries</a>
            </div>
          </div>
          <div className="block_picker">
            {
              dataMap["0.0.1"].fission.components.sink.map((v: string) =>
                <img key={v} src={require(`./Asstets/fission/sinks/${v}.png`)} alt={v}/>)
            }
          </div>
          <div className="stats">stats</div>
        </div>
        <div className="grid_container">
          <div className="navigation">
            <a href="/" className="navigation--active">option a1</a>
            <a href="/">option a2</a>
          </div>
          <div className="navigation">
            <a href="/">option b1</a>
            <a href="/" className="navigation--active">option b2</a>
            <a href="/">option b3</a>
          </div>
          <div className="grid_base">
            this is the reactor container
            {this.state.reactor ? <FissionReactor reactor={this.state.reactor}/> : undefined}
          </div>
        </div>
      </div>
      <DarkenedBackground enabled={this.state.overlay} onClick={this.closeOverlay}/>
    </>;
  }
}

export default App;
