export const ignored = 0;

/*
import React, {Component} from 'react';
import {IPanelProps, IPanelState, limits, PanelDockLocation, PanelPosMode} from "./definitions";
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
  size: number
}

const defaultPanelState: IPanelState = {state: PanelPosMode.Docked, minimised: false, position: {x: 0, y: 0}, size: {w: 0, h: 0}};

class PanelDock extends Component<Props, State> {
  state: State = {
    panelMap: [],
    size: 400
  }
  dockRef: HTMLDivElement | null = null;
  //<editor-fold desc="Docked panel resize">
  dockedPanelActive = -1;

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
    const bcr = this.dockRef.getBoundingClientRect();
    let map: IPanelState[] = [];
    for (let i = 0, c = this.props.panels.length; i < c; i++) {
      map.push({...defaultPanelState, size: {w: this.state.size, h: (bcr.height - c + 1) / c}});
    }
    this.setState({panelMap: map});
  };

  updateMap = () => {
    this.generateMap();
  };

  getUnitSize = () => {
    if (!this.dockRef) return 0;
    const {panelMap} = this.state;
    const dockedPanels = panelMap.filter(v => v.state === PanelPosMode.Docked);
    const minimisedCount = dockedPanels.filter(v => v.minimised).length;
    const availableHeight = this.dockRef.getBoundingClientRect().height - 19 * minimisedCount;
    return availableHeight / dockedPanels.filter(v => !v.minimised).reduce((a, b) => a + b.dockedRatio, 0) - 1;
  };

  onPosModeSwitch = (k: number) => (m: PanelPosMode) => {
  };

  onMinimise = (k: number) => () => {
    const {panelMap} = this.state;
    panelMap[k].minimised = !panelMap[k].minimised;
    const minimised = panelRatios.map(v => Math.sign(v));
    if (k === panelRatios.length - 1) {
      if (k !== 0) panelRatios[minimised.lastIndexOf(+1, k-1)] += panelRatios[k];
    } else panelRatios[minimised.indexOf(+1, k+1)] += panelRatios[k];
    this.setState({panelMap: panelMap});
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
    document.body.style.cursor = location === PanelDockLocation.Bottom ? "ns-resize" : "ew-resize";
  };

  onDockResizeMove = (e: MouseEvent) => {
    const {location} = {...defaultProps, ...this.props};
    if (location === PanelDockLocation.None) throw new Error("How?????????");
    switch (location) {
      case PanelDockLocation.Left:
        this.setState({size: limits.w(e.pageX)});
        break;
      case PanelDockLocation.Right:
        this.setState({size: limits.w(window.innerWidth - e.pageX)});
        break;
      case PanelDockLocation.Bottom:
        this.setState({size: limits.h(window.innerHeight - e.pageY)});
        break;
    }
  };
  //</editor-fold>

  onDockResizeUp = (_: MouseEvent) => {
    if (!this.dockRef) throw new Error("?!!???!? 01");
    window.removeEventListener("mousemove", this.onDockResizeMove);
    window.removeEventListener("mouseup", this.onDockResizeUp);
    this.dockRef.style.removeProperty("user-select");
    document.body.style.removeProperty("cursor");
  };

  onDockedPanelResizeDown = (k: number) => (_: React.MouseEvent) => {
    if (!this.dockRef) throw new Error("?!!???!? 10");
    const {panelMap} = this.state;
    this.dockedPanelActive = panelMap.filter(v => v.state === PanelPosMode.Docked).indexOf(panelMap[k]);
    window.addEventListener("mousemove", this.onDockedPanelResizeMove);
    window.addEventListener("mouseup", this.onDockedPanelResizeUp);
    this.dockRef.style.userSelect = "none";
    document.body.style.cursor = "ns-resize";
  };
  onDockedPanelResizeMove = (e: MouseEvent) => {
    const unitSize = this.getUnitSize();
    const {panelMap} = this.state;
    const dockedPanels = panelMap.filter(v => v.state === PanelPosMode.Docked);
    const preRatio = dockedPanels.slice(0, this.dockedPanelActive).reduce((a, b) => a + b.dockedRatio, 0);
    const sum = dockedPanels[this.dockedPanelActive].dockedRatio + dockedPanels[this.dockedPanelActive + 1].dockedRatio;
    let h = limits.h_d(e.pageY - unitSize * preRatio, sum * unitSize, dockedPanels.length) / unitSize;
    dockedPanels[this.dockedPanelActive].dockedRatio = h;
    dockedPanels[this.dockedPanelActive + 1].dockedRatio = sum - h;
    this.setState({panelMap: panelMap});
    this.setState({width: limits.w(w)});
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
    const {panelMap, size} = this.state;
    const {panels, location} = {...defaultProps, ...this.props};
    const unitSize = this.getUnitSize();
    return <div
      className={classMap("panel__dock", location === PanelDockLocation.Right && "panel__dock--right", location === PanelDockLocation.Left && "panel__dock--left", location === PanelDockLocation.Bottom && "panel__dock--bottom")}
      style={location === PanelDockLocation.Bottom ? {height: size, flexBasis: size} : {width: size, flexBasis: size}} data-size={width+"px"}>
      {location === PanelDockLocation.Right ? <div className="panel__dock__resize-handle" onMouseDown={this.onDockResizeDown}/> : null}
      {location === PanelDockLocation.Bottom ? <div className="panel__dock__resize-handle" onMouseDown={this.onDockResizeDown}/> : null}
      <div className="panel__container" ref={r => this.dockRef = r}>
        {panelMap.length ? panels.map((v, k, {length}) => {
            const state = panelMap[k];
            if (state.state === PanelPosMode.Docked)
              return [
                <PanelWrapper key={k} panelProps={v} panelState={{...state, size: {w: size, h: unitSize * state.dockedRatio}}}
                              onMinimise={this.onMinimise(k)} onClose={this.onClose(k)} onPosModeSwitch={this.onPosModeSwitch(k)}/>,
                k < length - 1 ? <div key={length + k} className="panel--docked__resize-handle" onMouseDown={this.onDockedPanelResizeDown(k)}/> : null
              ];
            return <PanelWrapper key={k} panelProps={v} panelState={state}
                                 onMinimise={this.onMinimise(k)} onClose={this.onClose(k)} onPosModeSwitch={this.onPosModeSwitch(k)}/>
          }
        ) : null}
      </div>
      {location === PanelDockLocation.Left ? <div className="panel__dock__resize-handle" onMouseDown={this.onDockResizeDown}/> : null}
    </div>
  }
}
*/
