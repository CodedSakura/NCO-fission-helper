import React, {Component} from 'react';
import {overlayClosedEvent, overlayCloseInvokeEvent, overlayOpenInvokeEvent} from "../Utils/events";
import "../Style/Modal.scss";
import {classMap} from "../Utils/utils";

interface Props {
  shown: boolean
  onClose(): any
  className?: string
}

class Modal extends Component<Props> {
  componentDidMount() {
    document.addEventListener(overlayClosedEvent, this.props.onClose);
  }
  componentWillUnmount() {
    document.removeEventListener(overlayClosedEvent, this.props.onClose);
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any) {
    if (this.props.shown !== prevProps.shown) {
      document.dispatchEvent(new Event(this.props.shown ? overlayOpenInvokeEvent : overlayCloseInvokeEvent));
    }
  }

  render() {
    if (!this.props.shown) return null;
    return <div className="modal">
      <div className={classMap("modal__cont", this.props.className)}>
        {this.props.children}
      </div>
    </div>
  }
}

export default Modal;