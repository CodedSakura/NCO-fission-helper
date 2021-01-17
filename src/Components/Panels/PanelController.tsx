import React, {Component} from "react";
import {IPanelProps, PanelDockLocation} from "./definitions";
import {PanelDock} from "./index";
import {classMap} from "../../Utils/utils";

export interface PanelControllerProps {
  leftTop?: IPanelProps[]
  leftBottom?: IPanelProps[]
  rightTop?: IPanelProps[]
  rightBottom?: IPanelProps[]
  bottomLeft?: IPanelProps[]
  bottomRight?: IPanelProps[]
  topLeft?: IPanelProps[]
  topRight?: IPanelProps[]

  hiddenPanels?: IPanelProps[]

  id: string
  saveLoad?: boolean // true
}
interface State {
  sizes: {
    top: number, bottom: number,
    left: number, right: number
  }
  open: {
    top: [number, number], bottom: [number, number],
    left: [number, number], right: [number, number],
  }
}

type Location4 = "top"|"bottom"|"left"|"right";
type Location8 = "leftTop"|"leftBottom"|"rightTop"|"rightBottom"|"bottomLeft"|"bottomRight"|"topLeft"|"topRight";

const location8To4Map: {[x in Location8]: [Location4, 0|1]} = {
  topLeft:    ["top",    0], topRight:    ["top",    1],
  bottomLeft: ["bottom", 0], bottomRight: ["bottom", 1],
  leftTop:    ["left",   0], leftBottom:  ["left",   1],
  rightTop:   ["right",  0], rightBottom: ["right",  1],
};
const location4To8Map: {[x in Location4]: [Location8, Location8]} = {
  top: ["topLeft", "topRight"], bottom: ["bottomLeft", "bottomRight"],
  left: ["leftTop", "leftBottom"], right: ["rightTop", "rightBottom"],
}


const sizeInverseMap: {[x: string]: Location4} = {top: "bottom", bottom: "top", left: "right", right: "left"};

export default class PanelController extends Component<PanelControllerProps, State>{
  state: State = {
    sizes: {
      top: 200, bottom: 200, left: 200, right: 200
    },
    open: {
      top: [-1, -1], bottom: [-1, -1], left: [-1, -1], right: [-1, -1]
    }
  }

  constructor(props: PanelControllerProps) {
    super(props);
    const {id, children, saveLoad, hiddenPanels, ...panels} = this.props;
    Object.keys(panels).forEach(_k => {
      const k = _k as Location8;
      if (!panels[k]!.some(v => v.defaultOpen)) return;
      const [loc, side] = location8To4Map[k];
      this.state.open[loc][side] = panels[k]!.findIndex(v => v.defaultOpen);
    });
  }


  updateSize = (loc: Location4) => (size: number) => {
    const {sizes} = this.state;
    if (["top", "bottom"].includes(loc)) { // TODO: ignore collapsed panels
      sizes[loc] = Math.max(50, Math.min(size, window.innerHeight - sizes[sizeInverseMap[loc]] - 200));
    } else {
      sizes[loc] = Math.max(50, Math.min(size, window.innerWidth - sizes[sizeInverseMap[loc]] - 200));
    }
    this.setState({sizes: sizes});
  }

  setOpen = (loc: Location4, side: 0|1, index: number) => {
    this.setState(s => {
      const curr = s.open[loc];
      curr[side] = curr[side] === index ? -1 : index;
      return {open: {...s.open, [loc]: [...curr]}};
    });
  }

  getMenu = (loc: Location4) => {
    const [a = [], b = []] = location4To8Map[loc].map(v => this.props[v]);
    const [aActive, bActive] = this.state.open[loc];
    return <div className={classMap("panel__menu", ["left", "right"].includes(loc) && "panel__menu--vertical")}>
      {a.map((v, k) => <span key={k} onClick={() => this.setOpen(loc, 0, k)} className={classMap("panel__menu__item", k === aActive && "panel__menu__item--active")}>{v.name}</span>)}
      <div className="panel__menu__separator"/>
      {b.map((v, k) => <span key={k} onClick={() => this.setOpen(loc, 1, k)} className={classMap("panel__menu__item", k === bActive && "panel__menu__item--active")}>{v.name}</span>)}
    </div>;
  }

  render() {
    const {id, children, saveLoad = true, ...panels} = this.props;
    const {topLeft = [], topRight = [], bottomLeft = [], bottomRight = [], leftTop = [], leftBottom = [], rightTop = [], rightBottom = []} = {...panels};
    const {sizes, open} = this.state;
    return <div className="panel__controller">
      {this.getMenu("top")}
      <div className="panel__menu__container">
        {this.getMenu("left")}
        <div className="panel__menu__sub-container">
          <PanelDock location={PanelDockLocation.Top} panels={[topLeft[open.top[0]], topRight[open.top[1]]]} id={`${id}-Top`}
                     size={sizes.top} updateSize={this.updateSize("top")} open={[open.top[0] >= 0, open.top[1] >= 0]} saveLoad={saveLoad}/>
          <div className="panel__controller__container">
            <PanelDock location={PanelDockLocation.Left} panels={[leftTop[open.left[0]], leftBottom[open.left[1]]]} id={`${id}-Left`}
                       size={sizes.left} updateSize={this.updateSize("left")} open={[open.left[0] >= 0, open.left[1] >= 0]} saveLoad={saveLoad}/>
            <div className="panel__controller__body">{children}</div>
            <PanelDock location={PanelDockLocation.Right} panels={[rightTop[open.right[0]], rightBottom[open.right[1]]]} id={`${id}-Right`}
                       size={sizes.right} updateSize={this.updateSize("right")} open={[open.right[0] >= 0, open.right[1] >= 0]} saveLoad={saveLoad}/>
          </div>
          <PanelDock location={PanelDockLocation.Bottom} panels={[bottomLeft[open.bottom[0]], bottomRight[open.bottom[1]]]} id={`${id}-Bottom`}
                     size={sizes.bottom} updateSize={this.updateSize("bottom")} open={[open.bottom[0] >= 0, open.bottom[1] >= 0]} saveLoad={saveLoad}/>
        </div>
        {this.getMenu("right")}
      </div>
      {this.getMenu("bottom")}
    </div>
  }
}