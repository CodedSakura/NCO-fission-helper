import React, {Component} from 'react';
import {overlayOpenInvokeEvent} from "../Utils/events";

class BurgerMenu extends Component {
  render() {
    return <div>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 9" width="32" height="32" className="burger_menu" onClick={this.openMenu}>
        <rect x="1" y="1" width="7" height="1"/>
        <rect x="1" y="4" width="7" height="1"/>
        <rect x="1" y="7" width="7" height="1"/>
      </svg>
    </div>
  }

  openMenu = () => {
    document.dispatchEvent(new Event(overlayOpenInvokeEvent));
  };
}

export default BurgerMenu;