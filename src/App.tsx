import React from 'react';

import "./Style/App.scss"
import {getReactorFromHellrageConfig} from "./Utils/parsers/HellragePlanner";
import sampleA from "./Utils/parsers/OXHEU-235_5_x_5_x_5 (1).json";
import {Config} from "./Utils/Config";
import {FissionReactorGrid} from "./Utils/Grids/FissionReactorGrid";


class App extends React.Component {
  render() {
    return <>
      Hello React!
      {/*<Grid2D data={[[[]]]}/>*/}
    </>;
  }
}

fetch("./nuclearcraft_default.cfg").then(r => r.text()).then(t => {
  const cfg = new Config(t, "0.0.1");
  console.log(FissionReactorGrid.import(getReactorFromHellrageConfig(sampleA, cfg).export().data, cfg, "0.0.1"));
  // console.log(getReactorFromHellrageConfig(sampleB, cfg));
/*
  const r1 = new FissionReactorGrid(cfg);
  r1.setSize({width: 4, depth: 4, height: 1});
  r1.setCell([0, 0, 0], cfg.fuels.find(v => v.name === "LECf-249-ZA")!);
  r1.setCell([3, 0, 0], cfg.fuels.find(v => v.name === "HEN-236-ZA")!);
  r1.setCell([0, 0, 3], cfg.fuels.find(v => v.name === "HEN-236-ZA")!);
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
  r1.prime([3, 0, 0], "ra_be");
  r1.prime([0, 0, 3], "po_be");
  r1.unPrime([3, 0, 0]);
  r1.prime([0, 0, 3], "ra_be");
  console.log(r1);
  console.log(r1.validate());

  const r2 = new FissionReactorGrid(cfg);
  r2.setSize({width: 5, depth: 5, height: 4});
  r2.setCell([1, 1, 1], cfg.fuels.find(v => v.name === "LECf-249-ZA")!);
  r2.setCell([1, 1, 3], cfg.fuels.find(v => v.name === "LECf-249-ZA")!);
  r2.setCell([3, 1, 1], cfg.fuels.find(v => v.name === "LECf-249-ZA")!);
  r2.setCell([3, 1, 3], cfg.fuels.find(v => v.name === "LECf-249-ZA")!);
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
  console.log(r2.validate());
  */
});


export default App;
