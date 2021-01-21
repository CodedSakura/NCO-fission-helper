import React, {Component} from 'react';
import {IPanelProps, PanelDockLocation} from "./definitions";
import {classMap} from "../../Utils/utils";

interface Props {
  panels: [IPanelProps|null|undefined, IPanelProps|null|undefined]
  // open: [boolean, boolean]
  location: PanelDockLocation
  saveLoad?: boolean // true
  id: string
  updateSize(size: number): any
  size: number
}

interface State {
  ratio: number
}

enum Direction {
  HORIZONTAL, VERTICAL
}

const dockMaps = {
  classes: {
    [PanelDockLocation.Top]: "panel__dock--top",
    [PanelDockLocation.Bottom]: "panel__dock--bottom",
    [PanelDockLocation.Left]: "panel__dock--left",
    [PanelDockLocation.Right]: "panel__dock--right",
    [PanelDockLocation.None]: "panel__dock--none",
  },
  resize: { // start, end
    [PanelDockLocation.Top]: [false, true],
    [PanelDockLocation.Bottom]: [true, false],
    [PanelDockLocation.Left]: [false, true],
    [PanelDockLocation.Right]: [true, false],
    [PanelDockLocation.None]: [false, false],
  },
  cursor: {
    [Direction.VERTICAL]: "ns-resize",
    [Direction.HORIZONTAL]: "ew-resize",
  },
  direction: { // dock, panel
    [PanelDockLocation.Top]:    [Direction.VERTICAL, Direction.HORIZONTAL],
    [PanelDockLocation.Bottom]: [Direction.VERTICAL, Direction.HORIZONTAL],
    [PanelDockLocation.Left]:   [Direction.HORIZONTAL, Direction.VERTICAL],
    [PanelDockLocation.Right]:  [Direction.HORIZONTAL, Direction.VERTICAL]
  }
};

class PanelDock extends Component<Props, State> {
  state: State = {
    ratio: .5,
  };
  dockRef: HTMLDivElement | null = null;


  //<editor-fold desc="Dock resize">
  onDockResizeDown = (e: React.MouseEvent) => {
    if (e.buttons !== 1) return;
    const {location} = this.props;
    if (location === PanelDockLocation.None) return;
    window.addEventListener("mousemove", this.onDockResizeMove);
    window.addEventListener("mouseup", this.onDockResizeUp);
    document.body.style.setProperty("cursor", dockMaps.cursor[dockMaps.direction[location][0]]);
  };
  onDockResizeMove = (e: MouseEvent) => {
    e.preventDefault();
    if (e.buttons !== 1) {
      this.onDockResizeUp(e);
      return;
    }
    const {location} = this.props;
    switch (location) {
      case PanelDockLocation.Top:
        this.props.updateSize(e.pageY);
        break;
      case PanelDockLocation.Left:
        this.props.updateSize(e.pageX);
        break;
      case PanelDockLocation.Right:
        this.props.updateSize(window.innerWidth - e.pageX);
        break;
      case PanelDockLocation.Bottom:
        this.props.updateSize(window.innerHeight - e.pageY);
        break;
    }
  };
  onDockResizeUp = (_: MouseEvent) => {
    window.removeEventListener("mousemove", this.onDockResizeMove);
    window.removeEventListener("mouseup", this.onDockResizeUp);
    document.body.style.removeProperty("cursor");
  };
  //</editor-fold>

  //<editor-fold desc="Panel ratio change">
  onPanelRatioDown = (e: React.MouseEvent) => {
    if (e.buttons !== 1) return;
    const {location} = this.props;
    if (location === PanelDockLocation.None) return;
    window.addEventListener("mousemove", this.onPanelRatioMove);
    window.addEventListener("mouseup", this.onPanelRatioUp);
    document.body.style.setProperty("cursor", dockMaps.cursor[dockMaps.direction[location][1]]);
  };
  onPanelRatioMove = (e: MouseEvent) => {
    e.preventDefault();
    if (e.buttons !== 1) {
      this.onPanelRatioUp(e);
      return;
    }
    const {location} = this.props;
    if (location === PanelDockLocation.None) return;
    if (!this.dockRef) return;
    const rect = this.dockRef.getBoundingClientRect();
    switch (dockMaps.direction[location][1]) {
      case Direction.HORIZONTAL:
        this.setState({ratio: Math.max(.05, Math.min((e.pageX - rect.left) / rect.width, .95))})
        break;
      case Direction.VERTICAL:
        this.setState({ratio: Math.max(.05, Math.min((e.pageY - rect.top) / rect.height, .95))})
        break;
    }
  };
  onPanelRatioUp = (_: MouseEvent) => {
    window.removeEventListener("mousemove", this.onPanelRatioMove);
    window.removeEventListener("mouseup", this.onPanelRatioUp);
    document.body.style.removeProperty("cursor");
  };
  //</editor-fold>


  render() {
    const {location, size, panels} = this.props;
    const {ratio} = this.state;

    const open = panels.map(v => !!v)
    const openCount = open.filter(v => v).length;

    if (openCount === 0) return null;
    return <div className={classMap("panel__dock", dockMaps.classes[location])} style={{flexBasis: size}}>
      {dockMaps.resize[location][0] ? <div className="panel__dock__resize-handle" onMouseDown={this.onDockResizeDown}/> : null}
      <div className="panel__container" ref={r => this.dockRef = r}>
        {openCount > 1 ? <>
          <div className="panel" style={{flexGrow: ratio}}>{panels[0]!.data}</div>
          <div className="panel__resize-handle" onMouseDown={this.onPanelRatioDown}/>
          <div className="panel" style={{flexGrow: 1-ratio}}>{panels[1]!.data}</div>
        </> : <>
          {open[0] ? <div className="panel">{panels[0]!.data}</div> : null}
          {open[1] ? <div className="panel">{panels[1]!.data}</div> : null}
        </>}
      </div>
      {dockMaps.resize[location][1] ? <div className="panel__dock__resize-handle" onMouseDown={this.onDockResizeDown}/> : null}
    </div>
  }
}

export default PanelDock;
