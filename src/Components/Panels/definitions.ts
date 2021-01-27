import {ReactChild} from "react";

export type Location4 = "top"|"bottom"|"left"|"right";
export type Location8 = "leftTop"|"leftBottom"|"rightTop"|"rightBottom"|"bottomLeft"|"bottomRight"|"topLeft"|"topRight";

export const location8To4Map: {[x in Location8]: [Location4, 0|1]} = {
  topLeft:    ["top",    0], topRight:    ["top",    1],
  bottomLeft: ["bottom", 0], bottomRight: ["bottom", 1],
  leftTop:    ["left",   0], leftBottom:  ["left",   1],
  rightTop:   ["right",  0], rightBottom: ["right",  1],
};
export const location4To8Map: {[x in Location4]: [Location8, Location8]} = {
  top: ["topLeft", "topRight"], bottom: ["bottomLeft", "bottomRight"],
  left: ["leftTop", "leftBottom"], right: ["rightTop", "rightBottom"],
}

export const location8List: Location8[] = Object.keys(location8To4Map) as Location8[];
export const location4List: Location4[] = Object.keys(location4To8Map) as Location4[];

export const sizeInverseMap: {[x: string]: Location4} = {top: "bottom", bottom: "top", left: "right", right: "left"};

export const classDict = {
  menu: {
    c: "panel__menu",
    vertical: "panel__menu--vertical",
    separator: {c: "panel__menu__separator"},
    item: {
      c: "panel__menu__item",
      active: "panel__menu__item--active"
    },
  }
}


export enum PanelDockLocation {
  None, Left, Right, Bottom, Top
}

export enum PanelMode {
  Docked, Floating, Windowed
}

export enum PanelState {
  Closed, Open, Hidden
}

export interface IPanelHeaderButton {
  icon: ReactChild
  dropDownOptions?: {text: string, icon?: ReactChild, onClick?(): any}|"spacer"[] // null is spacer
}

export interface IPanelProps {
  name: string
  data: ReactChild
  movable?: boolean // true
  state?: PanelState // Closed
  mode?: PanelMode // Docked
  header?: ReactChild
  headerButtons?: IPanelHeaderButton[]
}

export interface IPanelPropsRequired extends IPanelProps {
  movable: boolean
  state: PanelState
  mode: PanelMode
}
