import React from 'react';

import "./Style/App.scss"
import Grid2D from "./Components/Grid2D";
import {Config} from "./Utils/Config";
// import {dataMap} from "./Utils/dataMap";


class App extends React.Component {
  render() {
    return <>
      Hello React!
      <Grid2D data={[[[]]]}/>
    </>;
  }
}

fetch("./nuclearcraft_default.cfg").then(r => r.text()).then(t => console.log(new Config(t)));

// console.log(dataMap["0.0.1"].fission.components.sink.map(v => `${v}:\t${Config.defaultSinkRules[v].map(v => `${v.requireExact ? "exactly" : "at least"} ${v.neededCount} ${v.axial ? "axial " : ""}${v.relatedComp}`).join(", ")}`).join("\n"));

export default App;
