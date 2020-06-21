import React, {Component} from 'react';
import {overlayClosedEvent, overlayOpenInvokeEvent} from "../Utils/events";

import "../Style/BugerMenu.scss";
import {classMap} from "../Utils/utils";

interface State {
  open: boolean
}

class BurgerMenu extends Component {
  state: State = {
    open: false
  }

  componentDidMount() {
    document.addEventListener(overlayClosedEvent, this.closeMenu);
  }


  render() {
    return <div>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -5 18 18" width="36" height="36" className="burger_menu__icon" onClick={this.openMenu}>
        <rect y="2" width="50%" height="1"/>
        <rect y="4.5" width="50%" height="1"/>
        <rect y="7" width="50%" height="1"/>
      </svg>
      <div className={classMap("panel", this.state.open && "panel--active")}>
        {this.props.children}
      </div>
    </div>
  }

  openMenu = () => {
    document.dispatchEvent(new Event(overlayOpenInvokeEvent));
    this.setState({open: true});
  };

  closeMenu = () => {
    this.setState({open: false});
  }
}

export default BurgerMenu;