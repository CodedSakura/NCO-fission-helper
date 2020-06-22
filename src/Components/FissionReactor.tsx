import React, {Component} from 'react';
import {SFRGrid} from "../Utils/Grids/SFRGrid";

interface Props {
  reactor: SFRGrid
  scale: number
}

interface State {
  layer: number
}

class FissionReactor extends Component<Props, State> {
  state: State = {
    layer: 0,
  };

  render() {
    const {grid} = this.props.reactor;
    return <div className="flex__rows flex--center" style={{zoom: this.props.scale}}>
      {grid[this.state.layer].map((v, k) => <div key={k} className="flex__cols">
        {v.map((v, k) => <img key={k} src={v.tile.asset} alt={v.tile.type} className="crisp"/>)}
      </div>)}
    </div>
  }
}

export default FissionReactor;