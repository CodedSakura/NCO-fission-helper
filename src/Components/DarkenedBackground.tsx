import React, {Component} from 'react';
import {classMap, getScrollbarWidth} from "../Utils/utils";
import "../Style/DarkenedBackground.scss";

interface Props {
  enabled: boolean
  onClick?: (e: React.MouseEvent) => void
}

const darkenClass = "darken";
const darkenBody = `${darkenClass}__body`;
const darkenOverlay = `${darkenClass}__overlay`;
const darkenOverlayActive = `${darkenOverlay}--active`;

export default class DarkenedBackground extends Component<Props> {
  componentDidMount() {
    this.updateDarken();
    window.addEventListener('resize', this.resizeEvent);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeEvent);
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any) {
    this.updateDarken();
  }

  updateDarken = () => {
    if (this.props.enabled) {
      document.body.style.paddingRight = `${getScrollbarWidth()}px`;
      document.body.classList.add(darkenBody);
    } else {
      document.body.style.removeProperty("padding-right");
      document.body.classList.remove(darkenBody);
    }
  }

  resizeEvent = () => {
    this.updateDarken();
  };

  render = () => <div className={classMap(darkenOverlay, this.props.enabled && darkenOverlayActive)} onClick={this.props.onClick}/>;
}