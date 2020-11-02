import {Dimensions, Position} from "../types";

export enum GridType {
  SFR, MSR, Turbine
}

export interface PickerData {
  filepath: string
  tile: string
  type: string
}

export abstract class GenericGrid {
  abstract name: string;

  abstract pickerFiles: PickerData[];
  abstract pickerSelection(n: number): any;
  abstract changeTile(pos: Position, n: number, symmetries: any): any;

  abstract getStats(): string[];
  abstract getCellStats(pos: Position): string[];
  abstract setData(name: string, data: string): any;

  abstract reset(dims: Dimensions): any;
}