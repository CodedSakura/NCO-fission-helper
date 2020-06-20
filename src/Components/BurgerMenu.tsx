import React, {Component} from 'react';
import {overlayOpenInvokeEvent} from "../Utils/events";

import "../Style/BugerMenu.scss";

class BurgerMenu extends Component {
  render() {
    return <div>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -5 18 18" width="36" height="36" className="burger_menu" onClick={this.openMenu}>
        <rect y="2" width="50%" height="1"/>
        <rect y="4.5" width="50%" height="1"/>
        <rect y="7" width="50%" height="1"/>
      </svg>
    </div>
  }

  openMenu = () => {
    document.dispatchEvent(new Event(overlayOpenInvokeEvent));
  };
}

export default BurgerMenu;