import React from 'react';

import "./Style/App.scss"
import {getReactorFromHellrageConfig} from "./Utils/parsers/HellragePlanner";
import {Config} from "./Utils/Config";

import sampleC from "./Utils/parsers/[ZA]HEA-242 4 x 2 x 4.json";
import FissionReactor from "./Components/FissionReactor";
import {FissionReactorGrid} from "./Utils/Grids/FissionReactorGrid";


class App extends React.Component {
  state: {reactor: FissionReactorGrid|undefined} = {reactor: undefined}

  componentDidMount() {
    fetch("./nuclearcraft_default.cfg").then(r => r.text()).then(t => {
      const cfg = new Config(t, "0.0.1");
      const r = getReactorFromHellrageConfig(sampleC, cfg);
      this.setState({reactor: r});
    });
  }

  render() {
    return <>
      Hello React!
      {this.state.reactor ? <FissionReactor reactor={this.state.reactor}/> : undefined}
      {/*<Grid2D data={[[[]]]}/>*/}
    </>;
  }
}

export default App;
