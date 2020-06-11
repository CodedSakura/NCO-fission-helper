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

// fetch("./nuclearcraft_default.cfg").then(r => r.text()).then(t => {
//   const cfg = new Config(t, "0.0.1");
//   const r = getReactorFromHellrageConfig(sampleC, cfg);
//   console.log(r);
//   console.log(r.validate());
/*  const original = getReactorFromHellrageConfig(sampleA, cfg).export().data;
  const imported = FissionReactorGrid.import(original, cfg, "0.0.1").export().data;
  console.log(imported.every((v, y) => v.every((v, z) => v.every((v, x) => v === original[y][z][x]))));
  console.log(imported);
  // console.log(getReactorFromHellrageConfig(sampleB, cfg));*/
/*  const r1 = new FissionReactorGrid(cfg);
  r1.setSize({width: 4, depth: 4, height: 1});
  r1.setCell([0, 0, 0], "LECf-249-ZA", "none");
  r1.setCell([3, 0, 0], "HEN-236-ZA", "none");
  r1.setCell([0, 0, 3], "HEN-236-ZA", "ra_be");
  r1.setTile([1, 0, 0], "shield", "boron_silver");
  r1.setTile([2, 0, 0], "moderator", "heavy_water");
  r1.setTile([0, 0, 1], "moderator", "graphite");
  r1.setTile([1, 0, 1], "sink", "gold");
  r1.setTile([2, 0, 1], "sink", "iron");
  r1.setTile([3, 0, 1], "sink", "water");
  r1.setTile([0, 0, 2], "irradiator", "irradiator");
  r1.setTile([1, 0, 2], "sink", "iron");
  r1.setTile([2, 0, 2], "sink", "iron");
  r1.setTile([1, 0, 3], "moderator", "graphite");
  r1.setTile([2, 0, 3], "moderator", "graphite");
  r1.setTile([3, 0, 3], "reflector", "beryllium_carbon");
  console.log(r1);
  console.log(r1.validate());

  const r2 = new FissionReactorGrid(cfg);
  r2.setSize({width: 5, depth: 5, height: 4});
  r2.setCell([1, 1, 1], "LECf-249-ZA", "none");
  r2.setCell([1, 1, 3], "LECf-249-ZA", "none");
  r2.setCell([3, 1, 1], "LECf-249-ZA", "none");
  r2.setCell([3, 1, 3], "LECf-249-ZA", "none");
  r2.setTile([1, 0, 3], "sink", "water");
  r2.setTile([2, 0, 3], "sink", "magnesium");

  r2.setTile([2, 1, 1], "moderator", "heavy_water");
  r2.setTile([3, 1, 2], "wall", "wall");
  r2.setTile([2, 1, 3], "moderator", "heavy_water");

  r2.setTile([1, 2, 1], "sink", "water");
  r2.setTile([2, 2, 1], "sink", "prismarine");
  r2.setTile([3, 2, 1], "sink", "water");
  r2.setTile([1, 2, 3], "sink", "water");
  r2.setTile([2, 2, 3], "sink", "prismarine");
  r2.setTile([3, 2, 3], "sink", "water");
  console.log(r2);
  console.log(r2.validate());*/
// });


export default App;
