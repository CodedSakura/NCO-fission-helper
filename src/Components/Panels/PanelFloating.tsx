import React from "react";
import {IPanelProps, localStoragePanelPrefix} from "./definitions";

interface Props {
  panelData: IPanelProps
  saveLoad?: boolean
  minimise?(): any
}

interface Pos {
  x: number
  y: number
  width: number
  height: number
}

interface State extends Pos {
}

let lX = 0, lY = 0;
const incr = 25, defaultSize = 160, minSize = 40;

const cursorMap: {[x: string]: string} = {
  "n": "ns", "s": "ns",
  "e": "ew", "w": "ew",
  "ne": "nesw", "sw": "nesw",
  "nw": "nwse", "se": "nwse",
}

export default class PanelFloating extends React.Component<Props, State> {
  state: State;
  activeResize: string[]|undefined;
  mouseOffset = [0, 0];

  constructor(props: Props) {
    super(props);
    this.state = {...this.loadLoc(props.panelData.name)};
    window.addEventListener("beforeunload", () => this.saveLoc(props.panelData.name));
  }


  loadLoc(name: string): Pos {
    const locString = localStorage.getItem(localStoragePanelPrefix + name);
    if (locString) {
      const loc = JSON.parse(locString);
      return {
        x: loc.left,
        y: loc.top,
        width: loc.width,
        height: loc.height,
      }
    } else {
      lX += incr; lY += incr;
      return {
        x: lX % (window.innerWidth - defaultSize),
        y: lY % (window.innerHeight - defaultSize),
        width: defaultSize,
        height: defaultSize,
      }
    }
  }
  saveLoc(name: string) {
    localStorage.setItem(localStoragePanelPrefix + name, JSON.stringify({
        left: this.state.x,
        top: this.state.y,
        width: this.state.width,
        height: this.state.height,
    }));
  }

  componentWillUnmount() {
    this.saveLoc(this.props.panelData.name);
  }


  //<editor-fold desc="Resize">
  onResizeDown = (dir: string[]) => (e: React.MouseEvent) => {
    if (e.buttons !== 1) return;
    this.activeResize = dir;
    window.addEventListener("mousemove", this.onResizeMove);
    window.addEventListener("mouseup", this.onResizeUp);
    document.body.style.setProperty("cursor", `${cursorMap[dir.join("")]}-resize`);
  }
  onResizeMove = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (e.buttons !== 1) {
      this.onResizeUp(e);
      return;
    }
    const {...pos} = this.state;
    for (const d of this.activeResize || []) {
      switch (d) {
        case "n":
          const pageY = Math.max(0, Math.min(e.pageY, pos.y + pos.height - minSize));
          pos.height = pos.y + pos.height - pageY;
          pos.y = pageY;
          break;
        case "s":
          pos.height = Math.max(minSize + pos.y, Math.min(e.pageY, window.innerHeight - 2)) - pos.y;
          break;
        case "e":
          pos.width = Math.max(minSize + pos.x, Math.min(e.pageX, window.innerWidth - 2)) - pos.x;
          break;
        case "w":
          const pageX = Math.max(0, Math.min(e.pageX, pos.x + pos.width - minSize));
          pos.width = pos.x + pos.width - pageX;
          pos.x = pageX;
          break;
      }
    }
    this.setState(pos);
  }
  onResizeUp = (_: MouseEvent) => {
    delete this.activeResize;
    window.removeEventListener("mousemove", this.onResizeMove);
    window.removeEventListener("mouseup", this.onResizeUp);
    document.body.style.removeProperty("cursor");
  }
  //</editor-fold>

  //<editor-fold desc="Move">
  onMoveDown = (e: React.MouseEvent) => {
    if (e.buttons !== 1) return;
    const {x, y} = this.state;
    this.mouseOffset = [e.pageX - x, e.pageY - y];
    window.addEventListener("mousemove", this.onMoveMove);
    window.addEventListener("mouseup", this.onMoveUp);
    document.body.style.setProperty("cursor", "move");
  }
  onMoveMove = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (e.buttons !== 1) {
      this.onMoveUp(e);
      return;
    }
    this.setState(({width, height}) => ({
      x: Math.max(0, Math.min(e.pageX - this.mouseOffset[0], window.innerWidth - width - 2)),
      y: Math.max(0, Math.min(e.pageY - this.mouseOffset[1], window.innerHeight - height - 2)),
    }));
  }
  onMoveUp = (_: MouseEvent) => {
    window.removeEventListener("mousemove", this.onMoveMove);
    window.removeEventListener("mouseup", this.onMoveUp);
    document.body.style.removeProperty("cursor");
  }
  //</editor-fold>

  render() {
    const {panelData: data} = this.props;
    const {x, y, width: w, height: h} = this.state;
    const resizes = [["n"], ["s"], ["e"], ["w"], ["n", "e"], ["n", "w"], ["s", "e"], ["s", "w"]]
      .map(v => <div key={v.join()} onMouseDown={this.onResizeDown(v)}
                     className={"panel__resize " + [...v, ...(v.length > 1 ? ["corner"] : [])].map(d => `panel__resize--${d}`).join(" ")}/>);
    return <div className="panel--floating__resize-box" style={{top: y, left: x}}>
      {resizes}
      <div className="panel panel--floating" style={{width: w, height: h}}>
        <div className="panel__header" onMouseDown={this.onMoveDown}>{data.header || data.name}</div>
        {x}; {y}; {w}; {h};
        {data.data}
      </div>
    </div>;
  }
}
