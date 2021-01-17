import {ReactChild} from "react";

export enum PanelDockLocation {
  None, Left, Right, Bottom, Top
}

export enum PanelPosMode {
  Docked, Floating, Windowed
}

/*export const limits = {
  w: (v: number): number => Math.max(50, Math.min(v, window.innerWidth - 100)),
  h: (v: number): number => Math.max(50, Math.min(v, window.innerHeight - 100))
}*/

export interface IPanelProps {
  name: string
  data: ReactChild
  movable?: boolean // true
  defaultOpen?: boolean // false
}

export interface IPanelState {
  state: PanelPosMode
  location: PanelDockLocation
  minimised: boolean
  position: { x: number, y: number }
  size: { w: number, h: number }
}

export interface ICommonPanelProps {
  panelProps: IPanelProps
  panelState: IPanelState

  onMinimise(): any
  onClose(): any
  onPosModeSwitch(newPosMode: PanelPosMode): any
}