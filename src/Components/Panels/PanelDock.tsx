import React, {Component} from 'react';
import {IPanelProps, localStorageDockRatioPrefix, PanelDockLocation} from "./definitions";
import {classMap} from "../../Utils/utils";

interface Props {
  panels: [IPanelProps|null|undefined, IPanelProps|null|undefined]
  // open: [boolean, boolean]
  location: PanelDockLocation
  saveLoad?: boolean // true
  updateSize(size: number): any
  size: number
  minimise?: [() => any, () => any]
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
  state: State;
  dockRef: HTMLDivElement | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      ratio: this.loadRatio(props.location)
    }
  }


  saveRatio(loc: PanelDockLocation) {
    localStorage.setItem(localStorageDockRatioPrefix + loc, JSON.stringify({
      ratio: this.state.ratio
    }));
  }
  loadRatio(loc: PanelDockLocation): number {
    const ratioString = localStorage.getItem(localStorageDockRatioPrefix + loc);
    if (ratioString) {
      const ratio = JSON.parse(ratioString);
      return ratio.ratio;
    }
    return .5;
  }

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
    e.stopPropagation();
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
    this.saveRatio(this.props.location);
  };
  //</editor-fold>

  genPanel = (n: number, ratio: number) => {
    const {panels, minimise = [undefined, undefined]} = this.props;
    return <div className="panel" style={{flexGrow: ratio}}>
      <div className="panel__header">
        {panels[n]?.header || panels[n]?.name}
        <div className="panel__header__spacer"/>
        {(panels[n]?.headerButtons || []).length > 0 ? <>
          {panels[n]?.headerButtons?.map((v, i) =>
            <div key={i} className="panel__header__btn">{v.icon}</div>)}
          <div className="panel__header__separator"/>
        </> : null}
        <div className="panel__header__btn">S</div>
        <div className="panel__header__btn" onClick={minimise[n]}>M</div>
      </div>
      {panels[n]?.data}
    </div>;
  };

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
          {this.genPanel(0, ratio)}
          <div className="panel__resize-handle" onMouseDown={this.onPanelRatioDown}/>
          {this.genPanel(1, 1-ratio)}
        </> : <>
          {open[0] ? this.genPanel(0, 1) : null}
          {open[1] ? this.genPanel(1, 1) : null}
        </>}
      </div>
      {dockMaps.resize[location][1] ? <div className="panel__dock__resize-handle" onMouseDown={this.onDockResizeDown}/> : null}
    </div>
  }
}

export default PanelDock;
