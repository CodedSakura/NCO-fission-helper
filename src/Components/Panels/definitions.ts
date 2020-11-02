import {ReactChild} from "react";

export enum PanelDockLocation {
  None, Left, Right, Bottom
}

export enum PanelPosMode {
  Docked, Floating, Windowed
}

export const limits = {
  w: (v: number): number => Math.max(50, Math.min(v, window.innerWidth - 100)),
  h: (v: number): number => Math.max(50, Math.min(v, window.innerHeight - 100)),
  h_d: (v: number, m: number, c: number): number =>
        ((h: number) => Math.max(h, Math.min(v, m - h)))(Math.min(120, window.innerHeight / c - 5))
}

export interface IPanelProps {
  data: ReactChild
  movable?: boolean // true
  name: string
}

export interface IPanelState {
  state: PanelPosMode
  minimised: boolean
  position: {x: number, y: number}
  size: {w: number, h: number}
  dockedRatio: number
}

export interface ICommonPanelProps {
  panelProps: IPanelProps
  panelState: IPanelState

  onMinimise(): any
  onClose(): any
  onPosModeSwitch(newPosMode: PanelPosMode): any
}