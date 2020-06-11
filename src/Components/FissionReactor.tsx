import React, {Component} from 'react';
import {FissionReactorGrid} from "../Utils/Grids/FissionReactorGrid";

interface Props {
  reactor: FissionReactorGrid
}

class FissionReactor extends Component<Props> {

  render() {
    console.log("render");
    return <div/>
  }
}

export default FissionReactor;