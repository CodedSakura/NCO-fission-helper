import React, {Component} from 'react';
import {classMap} from "../../Utils/utils";
import {ICommonPanelProps, PanelPosMode} from "./definitions";

interface Props extends ICommonPanelProps {
}

class PanelGeneric extends Component<Props> {
  onOptions = () => {
  };

  render() {
    const {onClose, onMinimise, panelProps, panelState} = this.props;
    switch (panelState.state) {
      case PanelPosMode.Docked:
      case PanelPosMode.Floating:
        return <div className={classMap("panel", panelState.minimised && "panel--minimised")}
                    style={{width: panelState.size.w, height: panelState.minimised ? undefined : panelState.size.h}}>
          <div className="panel__toolbar">
            <span className="panel__toolbar__name">{panelProps.name}</span>
            <span className="panel__toolbar__handle"/>
            <span className="panel__toolbar__options" onClick={this.onOptions}>@</span>
            <span className="panel__toolbar__minimize" onClick={onMinimise}>_</span>
            <span className="panel__toolbar__close" onClick={onClose}>&times;</span>
          </div>
          <div className={classMap("panel__body", panelState.state === PanelPosMode.Floating && "panel--resizable")}>
            {panelProps.data}
          </div>
        </div>
      case PanelPosMode.Windowed:
        return <div className="panel__body">{panelProps.data}</div>
      default:
        throw new Error(`${panelState.state} is not a valid panel state`);
    }
  }
}

export default PanelGeneric;