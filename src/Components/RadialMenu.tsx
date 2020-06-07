import React, {Component} from 'react';

import {classMap} from "../Utils/utils";

import "../Style/RadialMenu.scss";

export interface Config {
  entryRadius: number
  indicatorRadius: number
  indicatorAngle: number // rad
  shortTimeout: number // ms
}

export const DefaultConfig: Config = {
  entryRadius: 100,
  indicatorRadius: 30,
  indicatorAngle: Math.PI/2,
  shortTimeout: 200,
}

const calcSelection = (angle: number, count: number) => ((angle + Math.PI/count) % (Math.PI*2)) * count / (2 * Math.PI) << 0

enum MenuState {
  Closed, Undecided, ClickOpen, HoldOpen,
}

interface MenuFunctional {
  name: string
  fn: (e?: MouseEvent) => any
  disabled?: boolean
}
interface MenuNested {
  name: string
  choices: MenuChoice[]
}

export type MenuChoice = MenuNested|MenuFunctional;

interface RadialMenuProps {
  choices: MenuChoice[]
  config?: Partial<Config>
}

interface RadialMenuState {
  menuState: MenuState
  menuPosition: [number, number]
  mouseAngle: number|null
  mouseDist2: number
  nested: number[]
}

class RadialMenu extends Component<RadialMenuProps, RadialMenuState> {
  state: RadialMenuState = {
    menuState: MenuState.Closed,
    menuPosition: [0, 0],
    mouseAngle: null,
    mouseDist2: -1,
    nested: []
  }
  mouseDownTime: number = -1;
  originalEvt: MouseEvent|undefined;
  wrapper: HTMLDivElement|null = null;

  componentWillUnmount() {
    if (this.wrapper)
      this.wrapper.removeEventListener("contextmenu", this.menuListener);
  }

  menuListener = (e: MouseEvent) => {
    e.preventDefault();
    this.originalEvt = e;
    this.setState({menuState: MenuState.Undecided, menuPosition: [e.pageX, e.pageY], nested: [], mouseAngle: null});
    document.addEventListener("mousemove", this.mouseMoveListener);
    document.addEventListener("mouseup", this.mouseUpListener);
    this.mouseMoveListener(e);
    this.mouseDownTime = Date.now();
  }

  mouseMoveListener = (e: MouseEvent) => {
    const [x, y] = this.state.menuPosition;
    const rx = e.x - x, ry = e.y - y;
    const dist2 = rx**2 + ry**2
    const outside = dist2 > {...DefaultConfig, ...this.props.config}.indicatorRadius ** 2;
    const angle = outside ?
      (Math.atan2(ry, rx) + 5*Math.PI/2) % (Math.PI*2) :
      null;
    this.setState({mouseAngle: angle, mouseDist2: dist2});
  }

  globalMenuListener = () => {
    this.setState({menuState: MenuState.Closed});
    document.removeEventListener("contextmenu", this.globalMenuListener);
    document.removeEventListener("mousemove", this.mouseMoveListener);
    document.removeEventListener("mouseup", this.mouseUpListener);
  }

  mouseUpListener = (e: MouseEvent) => {
    const {menuState, mouseAngle, nested} = this.state;
    let {choices, config} = this.props;
    nested.forEach(v => {
      if ("choices" in choices[v])
        choices = (choices[v] as MenuNested).choices;
    });
    switch (menuState) {
      case MenuState.Undecided:
        if (Date.now() - this.mouseDownTime <= {...DefaultConfig, ...config}.shortTimeout && !mouseAngle) {
          document.addEventListener("contextmenu", this.globalMenuListener);
          this.setState({menuState: MenuState.ClickOpen});
          return;
        }
        // fallthrough
      case MenuState.HoldOpen:
        if (e.button !== 2) break;
        // fallthrough
      case MenuState.ClickOpen:
        if (e.button === 0)
          document.removeEventListener("contextmenu", this.globalMenuListener);
        else if (e.button !== 2) break;
        if (mouseAngle !== null) {
          const sel = calcSelection(mouseAngle, choices.length)
          const choice = choices[sel];
          if ("fn" in choice && !choice.disabled) choice.fn();
          else {
            this.setState(s => ({nested: [...s.nested, sel], menuState: MenuState.ClickOpen}));
            document.addEventListener("contextmenu", this.globalMenuListener);
            return;
          }
        }
    }
    this.setState({menuState: MenuState.Closed});
    document.removeEventListener("mousemove", this.mouseMoveListener);
    document.removeEventListener("mouseup", this.mouseUpListener);
  }

  render() {
    let {choices} = this.props;
    const {menuPosition, menuState, mouseAngle, nested} = this.state;
    nested.forEach(v => {
      if ("choices" in choices[v])
        choices = (choices[v] as MenuNested).choices;
    });
    const {indicatorRadius: ir, entryRadius: tr, indicatorAngle: ia} = {...DefaultConfig, ...this.props.config};
    return <div ref={ref => {
      this.wrapper = ref;
      if (ref) ref.addEventListener("contextmenu", this.menuListener);
    }} style={{display: "contents"}}>
      {this.props.children}
      {menuState === MenuState.Closed ? null :
        <div className="__menu_radial" style={{top: menuPosition[1], left: menuPosition[0]}}>
          <svg viewBox={`${-ir - 5} ${-ir - 5} ${ir * 2 + 10} ${ir * 2 + 10}`} width={ir * 2}
               style={{transform: "translate(-50%, -50%)"}} className="__menu_radial-indicator">
            <g fill="none">
              <path d={`M${ir} 0A${ir} ${ir} 0 1 0 ${-ir} 0A${ir} ${ir} 0 1 0 ${ir} 0`} className="__menu_radial-indicator-bg"/>
              {mouseAngle !== null ?
                <path transform={`rotate(${(mouseAngle - ia/2 - Math.PI/2) / Math.PI * 180})`} className="__menu_radial-indicator-fg"
                      d={`M${ir} 0A${ir} ${ir} 0 0 1 ${Math.cos(ia) * ir} ${Math.sin(ia) * ir}`}/> :
                undefined
              }
            </g>
          </svg>
          {choices.map((v, i, {length}) => {
            const ox = Math.sin(2 * Math.PI / length * i) * tr, oy = Math.cos(2 * Math.PI / length * i) * tr;
            const sel = mouseAngle === null ? -1 : calcSelection(mouseAngle, length);
            return <span key={i} style={{top: `${-oy}px`, left: `${ox}px`}}
                         className={classMap("__menu_radial-select", sel === i && "__menu_radial-selection",
                           "disabled" in v && v.disabled && "__menu_radial-active", "choices" in v && "__menu_radial-nested")}>{v.name}</span>
          })}
        </div>
      }
    </div>
  }
}

export default RadialMenu;