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
  mouseOffset: [number, number]
}

const cfg = {
  tr: 100,
  ir: 30,
  ia: Math.PI/2,
}

class RadialMenu extends Component<Props, State> {
  state: State = {
    menuOpen: false,
    menuPosition: {x: -1, y: -1},
    menuSelection: -1,
    mouseOffset: [0, 0],
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
    const {length} = this.props.choices;
    const outside = rx**2 + ry**2 > cfg.ir**2;
    const newV = outside ?
      ((Math.atan2(ry, rx) + 5*Math.PI/2 + Math.PI/length) % (Math.PI*2)) / (2*Math.PI) * length << 0 :
      -1;
    this.setState({menuSelection: newV, mouseOffset: outside ? [rx, ry] : [0, 0]});
  }

  render() {
    const {choices} = this.props;
    const {menuOpen, menuPosition, menuSelection, mouseOffset} = this.state;
    if (!menuOpen) return null;
    return <div className="__menu_radial" style={{top: menuPosition.y, left: menuPosition.x}}>
      <svg viewBox={`${-cfg.ir-5} ${-cfg.ir-5} ${cfg.ir*2+10} ${cfg.ir*2+10}`} width={cfg.ir*2} style={{transform: "translate(-50%, -50%)"}} className="__menu_radial-indicator">
        <g fill="none" transform={`rotate(${(Math.atan2(mouseOffset[1], mouseOffset[0]) - cfg.ia/2)/Math.PI*180})`}>
          <path d={`M${cfg.ir} 0A${cfg.ir} ${cfg.ir} 0 1 0 ${-cfg.ir} 0A${cfg.ir} ${cfg.ir} 0 1 0 ${cfg.ir} 0`} stroke="green"/>
          {mouseOffset.every(v => v === 0) ? undefined :
            <path d={`M${cfg.ir} 0A${cfg.ir} ${cfg.ir} 0 0 1 ${Math.cos(cfg.ia) * cfg.ir} ${Math.sin(cfg.ia) * cfg.ir}`} stroke="blue"/>
          }
        </g>
      </svg>
      {choices.map((v, i, {length}) => {
        return <span className={classMap("__menu_radial-select", menuSelection === i && "__menu_radial-active")} key={i}
                     style={{transform: `translate(-50%, -50%) translate(${Math.sin(2*Math.PI/length*i)*cfg.tr}px, ${-Math.cos(2*Math.PI/length*i)*cfg.tr}px)`}}>{v.name}</span>
      })}
    </div>
  }
}

export default RadialMenu;