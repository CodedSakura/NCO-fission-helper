import React, {Component} from "react";
import {
  classDict,
  IPanelProps,
  IPanelPropsRequired,
  Location4,
  location8List,
  location8To4Map,
  PanelDockLocation,
  PanelMode,
  PanelState,
  sizeInverseMap,
} from "./definitions";
import {classMap} from "../../Utils/utils";
import PanelDock from "./PanelDock";
import PanelFloating from "./PanelFloating";
import PanelWindowed from "./PanelWindowed";


export interface PanelControllerProps {
  leftTop?: IPanelProps[]
  leftBottom?: IPanelProps[]
  rightTop?: IPanelProps[]
  rightBottom?: IPanelProps[]
  bottomLeft?: IPanelProps[]
  bottomRight?: IPanelProps[]
  topLeft?: IPanelProps[]
  topRight?: IPanelProps[]

  saveLoad?: boolean // true

  prepend?: React.ReactNode
  append?: React.ReactNode
}

interface State {
  sizes:      {[x in Location4]: number}
  positions:  {[x in Location4]: [IPanelPropsRequired[], IPanelPropsRequired[]]}
  open: Set<string>
}

export default class PanelController extends Component<PanelControllerProps, State>{
  state: State = {
    sizes:      {top: 200,      bottom: 200,      left: 200,      right: 200},
    positions:  {top: [[], []], bottom: [[], []], left: [[], []], right: [[], []]},
    open: new Set(),
  }

  constructor(props: PanelControllerProps) {
    super(props);
    const usedNames: Set<string> = new Set();
    location8List.forEach(loc8 => {
      const panels = this.props[loc8];
      if (!panels) return;

      const [loc, side] = location8To4Map[loc8];

      let dockedFound = false;
      panels.forEach(panel => {
        if (usedNames.has(panel.name)) throw new Error(`Duplicate panel name "${panel.name}"!`);
        usedNames.add(panel.name);

        if (panel.state === PanelState.Open) {
          if (panel.mode === PanelMode.Docked || !panel.mode) {
            if (dockedFound) throw new Error(`Cannot have multiple Docked and Open panels in the same location!`);
          } else dockedFound = true;
          this.state.open.add(panel.name);
        }
      });

      this.state.positions[loc][side] = panels.map(p => ({
        movable: true,
        mode: PanelMode.Docked,
        state: PanelState.Closed,
        ...p
      }));
    });
  }


  getOpenDocked = (list: IPanelProps[]): IPanelProps|undefined => {
    const matches = list.filter(panel => panel.mode === PanelMode.Docked && this.state.open.has(panel.name));
    if (matches.length > 1) throw new Error("How? (multiple open docked panels)");
    return matches[0];
  }
  hasOpenDockedInLoc4 = (loc4: Location4): boolean => {
    return [0, 1].some(pos => this.getOpenDocked(this.state.positions[loc4][pos]))
  }

  updateSize = (loc: Location4) => (size: number) => {
    const {sizes} = this.state, inverse = sizeInverseMap[loc];
    if (["top", "bottom"].includes(loc)) {
      sizes[loc] = Math.max(50, Math.min(size, window.innerHeight - 200
        - (!this.hasOpenDockedInLoc4(inverse) ? 0 : sizes[inverse])));
    } else {
      sizes[loc] = Math.max(50, Math.min(size, window.innerWidth - 200
        - (!this.hasOpenDockedInLoc4(inverse) ? 0 : sizes[inverse])));
    }
    this.setState({sizes: sizes});
  }

  setOpen = (loc: Location4, side: 0|1, name: string) => {
    this.setState(s => {
      const curr = s.open;

      if (s.positions[loc][side]?.find(v => v.name === name)?.mode === PanelMode.Docked) {
        const prevOpen = this.getOpenDocked(s.positions[loc][side])?.name;
        if (prevOpen !== name) curr.delete(prevOpen || "");
      }

      curr.has(name) ? curr.delete(name) : curr.add(name);
      return {open: new Set<string>(curr)};
    }, () => this.updateSize(sizeInverseMap[loc])(this.state.sizes[sizeInverseMap[loc]]));
  }

  close = (name: string) => {
    this.setState(s => {
      const curr = s.open;
      s.open.delete(name);
      return {open: new Set<string>(curr)};
    });
  }

  getMenu = (loc: Location4) => {
    const {positions, open} = this.state;
    const [a = [], b = []] = [0, 1].map(v => positions[loc][v]?.filter(v => v.state !== PanelState.Hidden));
    const {menu} = classDict;
    return <div className={classMap(menu.c, ["left", "right"].includes(loc) && menu.vertical)}>
      {a.map(({name: n}) => <span key={n} onClick={() => this.setOpen(loc, 0, n)}
                             // draggable onDragStart={() => console.log(`drag ${n}`)} onDragOver={() => console.log(`over ${n}`)} onDrop={() => console.log(`drop ${n}`)}
                             //         onDragEnter={() => console.log(`drag enter ${n}`)} onDragExit={() => console.log(`drag exit ${n}`)} onDragLeave={() => console.log(`drag leave ${n}`)}
                             //         onDragEnd={() => console.log(`drag end ${n}`)} // onDrag={() => console.log(`on drag? ${n}`)}
                             className={classMap(menu.item.c, open.has(n) && menu.item.active)}>{n}</span>)}
      <div className="panel__menu__separator"/>
      {b.map(({name: n}) => <span key={n} onClick={() => this.setOpen(loc, 1, n)} //draggable onDragStart={() => console.log(`drag ${v.name}`)}
                                  className={classMap(menu.item.c, open.has(n) && menu.item.active)}>{n}</span>)}
    </div>;
  }

  render() {
    const {children, saveLoad = true, prepend, append} = this.props;
    const {sizes, positions, open} = this.state;
    type partialDockProps = { panels: [IPanelProps | undefined, IPanelProps | undefined], minimise: [() => any, () => any] };
    const shorthand = (loc: Location4): partialDockProps =>
      ((a, b): partialDockProps => ({
        panels: [a, b],
        minimise: [a ? () => this.setOpen(loc, 0, a.name) : () => {}, b ? () => this.setOpen(loc, 0, b.name) : () => {}]
      }))(this.getOpenDocked(positions[loc][0]), this.getOpenDocked(positions[loc][1]));
    return <>
      {Object.values(positions).flat().flat().filter(v => open.has(v.name) && v.mode === PanelMode.Floating).map(v =>
        <PanelFloating key={v.name} panelData={v} minimise={() => this.close(v.name)}/>)}
      {Object.values(positions).flat().flat().filter(v => open.has(v.name) && v.mode === PanelMode.Windowed).map(v =>
        <PanelWindowed key={v.name} panelData={v} minimise={() => this.close(v.name)}/>)}
      <div className="panel__controller">
        {prepend}
        {this.getMenu("top")}
        <div className="panel__menu__container">
          {this.getMenu("left")}
          <div className="panel__menu__sub-container">
            <PanelDock location={PanelDockLocation.Top} {...shorthand("top")}
                       size={sizes.top} updateSize={this.updateSize("top")} saveLoad={saveLoad}/>
            <div className="panel__controller__container">
              <PanelDock location={PanelDockLocation.Left} {...shorthand("left")}
                         size={sizes.left} updateSize={this.updateSize("left")} saveLoad={saveLoad}/>
              <div className="panel__controller__body">{children}</div>
              <PanelDock location={PanelDockLocation.Right} {...shorthand("right")}
                         size={sizes.right} updateSize={this.updateSize("right")} saveLoad={saveLoad}/>
            </div>
            <PanelDock location={PanelDockLocation.Bottom} {...shorthand("bottom")}
                       size={sizes.bottom} updateSize={this.updateSize("bottom")} saveLoad={saveLoad}/>
          </div>
          {this.getMenu("right")}
        </div>
        {this.getMenu("bottom")}
        {append}
      </div>
    </>;
  }
}
