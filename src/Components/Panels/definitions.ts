import {ReactChild} from "react";

export enum PanelDockLocation {
  None, Left, Right
}

export enum PanelPosMode {
  Docked, Floating, Window
}

export const limits = {
  w: (v: number): number => Math.max(180, Math.min(v, .4 * window.innerWidth)),
  h: (v: number): number => Math.max(120, v),
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