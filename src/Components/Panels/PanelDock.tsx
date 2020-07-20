import React, {Component} from 'react';
import {IPanelProps, IPanelState, limits, PanelDockLocation, PanelPosition} from "./definitions";
import PanelWrapper from "./PanelWrapper";
import {classMap} from "../../Utils/utils";

interface Props {
  panels: IPanelProps[]
  defaultWidth?: number
  location: PanelDockLocation
}

const defaultProps: Required<Props> = {
  panels: [],
  defaultWidth: 400,
  location: PanelDockLocation.None
}

interface State {
  panelMap: IPanelState[]
  panelRatios: number[]
  width: number
}

const defaultPanelState: IPanelState = {state: PanelPosition.Docked, minimised: false, position: {x: 0, y: 0}, size: {w: 0, h: 0}};

class PanelDock extends Component<Props, State> {
  state: State = {
    panelMap: [],
    panelRatios: [],
    width: 400
  }
  dockRef: HTMLDivElement|null = null;

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
    if (this.props.panels !== prevProps.panels) this.updateMap();
  }

  componentDidMount() {
    this.generateMap();
    window.addEventListener("resize", this.onResize);
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.onResize);
  }

  onResize = () => this.forceUpdate();

  generateMap = () => {
    console.log("generate");
    if (!this.dockRef) throw new Error("didn't know was possible");
    let map: IPanelState[] = [];
    let ratios: number[] = [];
    const bcr = this.dockRef.getBoundingClientRect();
    for (let i = 0, c = this.props.panels.length; i < c; i++) {
      map.push({...defaultPanelState, size: {w: this.state.width, h: (bcr.height - c+1) / c}});
      ratios.push(1);
    }
    this.setState({panelMap: map, panelRatios: ratios});
  };

  updateMap = () => {
    this.generateMap();
  };


  getAvailableHeight = () => {
    if (!this.dockRef) return 0;
    return this.dockRef.getBoundingClientRect().height - 19 * this.state.panelMap.filter(v => v.state === PanelPosition.Docked && v.minimised).length;
    // return this.dockRef.getBoundingClientRect().height;// - 19 * this.state.panelMap.filter(v => v.state === PanelPosition.Docked && v.minimised).length;
  };
  getUnitSize = () => {
    const {panelRatios} = this.state;
    return this.getAvailableHeight() / panelRatios.reduce((a, b) => a + Math.max(0, b), 0) - 1;
  };


  onMinimise = (k: number) => () => {
    const {panelMap, panelRatios} = this.state;
    panelMap[k].minimised = !panelMap[k].minimised;
    const minimised = panelRatios.map(v => Math.sign(v));
    if (k === panelRatios.length - 1) {
      if (k !== 0) panelRatios[minimised.lastIndexOf(+1, k-1)] += panelRatios[k];
    } else panelRatios[minimised.indexOf(+1, k+1)] += panelRatios[k]
    panelRatios[k] *= -1;
    this.setState({panelMap: panelMap, panelRatios: panelRatios});
  };

  onClose = (k: number) => () => {
    console.log(`close ${k}`);
    this.updateMap();
  };

  //<editor-fold desc="Dock resize">
  onDockResizeDown = (_: React.MouseEvent) => {
    if (!this.dockRef) throw new Error("?!!???!? 00");
    const {location} = {...defaultProps, ...this.props};
    if (location === PanelDockLocation.None) return;
    window.addEventListener("mousemove", this.onDockResizeMove);
    window.addEventListener("mouseup", this.onDockResizeUp);
    this.dockRef.style.userSelect = "none";
    document.body.style.cursor = "ew-resize";
  };
  onDockResizeMove = (e: MouseEvent) => {
    const {location} = {...defaultProps, ...this.props};
    if (location === PanelDockLocation.None) throw new Error("How?????????");
    let w: number;
    if (location === PanelDockLocation.Left) w = e.pageX;
    else w = window.innerWidth - e.pageX;
    this.setState({width: limits.w(w)});
  };
  onDockResizeUp = (_: MouseEvent) => {
    if (!this.dockRef) throw new Error("?!!???!? 01");
    window.removeEventListener("mousemove", this.onDockResizeMove);
    window.removeEventListener("mouseup", this.onDockResizeUp);
    this.dockRef.style.removeProperty("user-select");
    document.body.style.removeProperty("cursor");
  };
  //</editor-fold>

  //<editor-fold desc="Docked panel resize">
  dockedPanelActive = -1;
  onDockedPanelResizeDown = (k: number) => (_: React.MouseEvent) => {
    if (!this.dockRef) throw new Error("?!!???!? 10");
    this.dockedPanelActive = k;
    window.addEventListener("mousemove", this.onDockedPanelResizeMove);
    window.addEventListener("mouseup", this.onDockedPanelResizeUp);
    this.dockRef.style.userSelect = "none";
    document.body.style.cursor = "ns-resize";
  };
  onDockedPanelResizeMove = (e: MouseEvent) => {
    const unitSize = this.getUnitSize();
    const {panelRatios} = this.state;
    const preRatio = panelRatios.slice(0, this.dockedPanelActive).reduce((a, b) => a + b, 0);
    const sum = panelRatios[this.dockedPanelActive] + panelRatios[this.dockedPanelActive+1];
    let h = limits.h(e.pageY - unitSize * preRatio, sum * unitSize, panelRatios.length) / unitSize;
    panelRatios[this.dockedPanelActive] = h;
    panelRatios[this.dockedPanelActive+1] = sum - h;
    this.setState({panelRatios: panelRatios});
    // this.setState({width: limits.w(w)});
  };
  onDockedPanelResizeUp = (_: MouseEvent) => {
    if (!this.dockRef) throw new Error("?!!???!? 11");
    this.dockedPanelActive = -1;
    window.removeEventListener("mousemove", this.onDockedPanelResizeMove);
    window.removeEventListener("mouseup", this.onDockedPanelResizeUp);
    this.dockRef.style.removeProperty("user-select");
    document.body.style.removeProperty("cursor");
  };
  //</editor-fold>


  render() {
    const {panelMap, width, panelRatios} = this.state;
    const {panels, location} = {...defaultProps, ...this.props};
    const unitSize = this.getUnitSize();
    return <div className={classMap("panel__dock", location === PanelDockLocation.Right && "panel__dock--right", location === PanelDockLocation.Left && "panel__dock--left")}
                style={{width: width, flexBasis: width}}>
      {location === PanelDockLocation.Right ? <div className="panel__dock__resize-handle" onMouseDown={this.onDockResizeDown}/> : null}
      <div className="panel__container" ref={r => this.dockRef = r}>
        {panelMap.length ? panels.map((v, k, {length}) => {
          const state = panelMap[k];
          if (state.state === PanelPosition.Docked)
            return [
              <PanelWrapper key={k} panelProps={v} panelState={{...state, size: {w: width, h: unitSize * panelRatios[k]}}}
                            onMinimise={this.onMinimise(k)} onClose={this.onClose(k)}/>,
              k < length-1 ? <div key={length + k} className="panel--docked__resize-handle" onMouseDown={this.onDockedPanelResizeDown(k)}/> : null
            ];
          return <PanelWrapper key={k} panelProps={v} panelState={state}
                                  onMinimise={this.onMinimise(k)} onClose={this.onClose(k)}/>
          }
        ) : null}
      </div>
      {location === PanelDockLocation.Left ? <div className="panel__dock__resize-handle" onMouseDown={this.onDockResizeDown}/> : null}
    </div>
  }
}

export default PanelDock;