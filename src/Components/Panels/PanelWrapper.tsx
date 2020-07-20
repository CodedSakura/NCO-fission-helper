import React, {Component} from 'react';
import {ICommonPanelProps, PanelPosition} from "./definitions";
import PanelGeneric from "./PanelGeneric";

interface Props extends ICommonPanelProps {}

interface State {
  //
}

class PanelWrapper extends Component<Props, State> {
  render() {
    if (this.props.panelState.state === PanelPosition.Window) return null;
    const {onClose, onMinimise, panelState, panelProps} = this.props;
    return <PanelGeneric panelProps={panelProps} panelState={panelState}
                         onMinimise={onMinimise} onClose={onClose}/>;
    // return <div/>
  }
}

export default PanelWrapper;