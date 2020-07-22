import React, {Component} from 'react';
import {ICommonPanelProps, PanelPosMode} from "./definitions";
import PanelGeneric from "./PanelGeneric";

interface Props extends ICommonPanelProps {}

interface State {
  //
}

class PanelWrapper extends Component<Props, State> {
  render() {
    if (this.props.panelState.state === PanelPosMode.Window) return null;
    return <PanelGeneric {...this.props}/>;
    // return <div/>
  }
}

export default PanelWrapper;