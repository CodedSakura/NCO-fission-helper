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
  shortTimeout: 150,
}

enum MenuState {
  Closed, Undecided, ClickOpen, HoldOpen,
}

export interface MenuChoice {
  name: string
  fn: (e?: MouseEvent) => any
  disabled?: boolean
}

interface RadialMenuProps {
  choices: MenuChoice[]
  config?: Partial<Config>
  children: JSX.Element
}

interface RadialMenuState {
  menuState: MenuState
  menuPosition: [number, number]
  mouseAngle: number|null
  mouseDist2: number
}

class RadialMenu extends Component<RadialMenuProps, RadialMenuState> {
  state: RadialMenuState = {
    menuState: MenuState.Closed,
    menuPosition: [0, 0],
    mouseAngle: null,
    mouseDist2: -1
  }
  mouse2down = false;
  originalEvt: MouseEvent|undefined;
  wrapper: HTMLDivElement|null = null;

  componentWillUnmount() {
    if (this.props.children instanceof Element)
      this.props.children.removeEventListener("contextmenu", this.menuListener);
  }

  menuListener = (e: Event) => ((e: MouseEvent) => {
    e.preventDefault();
    this.originalEvt = e;
    this.mouse2down = true;
    this.setState({menuState: MenuState.Undecided, menuPosition: [e.pageX, e.pageY]});
    document.addEventListener("mousemove", this.mouseMoveListener);
    document.addEventListener("mouseup", this.mouseUpListener);
    this.mouseMoveListener(e);
    setTimeout(() => {
      this.setState({menuState: this.mouse2down ? MenuState.HoldOpen : MenuState.ClickOpen});
    }, {...DefaultConfig, ...this.props.config}.shortTimeout);
  })(e as MouseEvent);

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

  mouseUpListener = (e: MouseEvent) => {
    if (e.button === 2) {
      this.mouse2down = false;
    }
    switch (this.state.menuState) {
      case MenuState.Undecided:
        return;
      case MenuState.ClickOpen:
        // TODO
        break;
      case MenuState.HoldOpen:
        if (e.button === 2 && this.state.mouseAngle !== null) {
          let choice = this.props.choices[this.state.mouseAngle / this.props.choices.length << 0];
          if (!choice.disabled) choice.fn();
        }
        this.setState({menuState: MenuState.Closed, mouseAngle: null});
        document.removeEventListener("mousemove", this.mouseMoveListener);
        document.removeEventListener("mouseup", this.mouseUpListener);
        break;
    }
  }

  render() {
    const {choices} = this.props;
    const {menuPosition, menuState, mouseAngle} = this.state;
    const {indicatorRadius: ir, entryRadius: tr, indicatorAngle: ia} = {...DefaultConfig, ...this.props.config};
    return <div ref={ref => {
      this.wrapper = ref;
      if (ref) ref.addEventListener("contextmenu", this.menuListener);
    }}>
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
            const sel = mouseAngle === null ? -1 : (mouseAngle + Math.PI/length) * length / (2 * Math.PI) << 0;
            return <span key={i} style={{top: `${-oy}px`, left: `${ox}px`}}
                         className={classMap("__menu_radial-select", sel === i && "__menu_radial-selection", v.disabled && "__menu_radial-active")}>{v.name}</span>
          })}
        </div>
      }
    </div>
  }
}

export default RadialMenu;