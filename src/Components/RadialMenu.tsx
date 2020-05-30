import React, {Component} from 'react';

import "../Style/RadialMenu.scss";
import {classMap} from "../Utils/utils";

interface Props {
  choices: {name: string, fn: () => any}[]
}

interface State {
  menuOpen: boolean
  menuPosition: {x: number, y: number}
  menuSelection: number
}

const cfg = {
  ir: 50,
  or: 100
}

class RadialMenu extends Component<Props, State> {
  state: State = {
    menuOpen: false,
    menuPosition: {x: -1, y: -1},
    menuSelection: -1,
  }

  componentDidMount() {
    document.addEventListener("contextmenu", this.menuListener);
  }
  componentWillUnmount() {
    document.removeEventListener("contextmenu", this.menuListener);
  }

  mouseUpListener = (e: MouseEvent) => {
    if (e.button === 2 && this.state.menuSelection >= 0)
      this.props.choices[this.state.menuSelection].fn();
    this.setState({menuOpen: false, menuSelection: -1});
    document.removeEventListener("mousemove", this.mouseMoveListener);
    document.removeEventListener("mouseup", this.mouseUpListener);
  }

  menuListener = (e: MouseEvent) => {
    e.preventDefault();
    this.setState({menuOpen: true, menuPosition: {x: e.x, y: e.y}, menuSelection: -1});
    document.addEventListener("mousemove", this.mouseMoveListener);
    document.addEventListener("mouseup", this.mouseUpListener);
  }

  mouseMoveListener = (e: MouseEvent) => {
    const {y, x} = this.state.menuPosition;
    const rx = e.x - x, ry = e.y - y;
    const newV = rx**2 + ry**2 > cfg.ir**2 ?
      ((Math.atan2(ry, rx) + 5*Math.PI/2) % (Math.PI*2)) / (2*Math.PI) * this.props.choices.length << 0 :
      -1;
    if (this.state.menuSelection !== newV)
      this.setState({menuSelection: newV})
  }

  render() {
    const {choices} = this.props;
    const {menuOpen, menuPosition, menuSelection} = this.state;
    if (!menuOpen) return null;
    const itemCount = choices.length;
    const s = {s: {rad: 2*Math.PI/itemCount, deg: 360/itemCount}, o: {x: Math.sin(2*Math.PI/itemCount), y: Math.cos(2*Math.PI/itemCount)}};
    return <svg viewBox="-200 -200 400 400" width={400} className="__menu_radial" style={{top: menuPosition.y, left: menuPosition.x}}>
      {choices.map((v, i) => {
        return <g transform={`rotate(${s.s.deg*i})`} key={i}>
          <path d={`M0 -${cfg.ir}A${cfg.ir} ${cfg.ir} 0 0 1 ${cfg.ir*s.o.x} ${-cfg.ir*s.o.y}L${cfg.or*s.o.x} ${-cfg.or*s.o.y}A${cfg.or} ${cfg.or} 0 0 0 0 -${cfg.or}`}
                className={classMap("__menu_radial-select", menuSelection === i && "__menu_radial-active")}/>
          <text x={(cfg.ir+cfg.or)/2*Math.sin(Math.PI/itemCount)} y={-(cfg.ir+cfg.or)/2*Math.cos(Math.PI/itemCount)}
                textAnchor="middle" dominantBaseline="middle">{v.name}</text>
        </g>
      })}
    </svg>
  }
}

export default RadialMenu;