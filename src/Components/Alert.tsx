import React, {Component} from 'react';
import {classMap} from "../Utils/utils";
import "../Style/Alert.scss";

export enum AlertType {
  Error = "error", Warning = "warning", Success = "success"
}
const defaultAlertLength = 2000;
const animationLength = 500;

export interface IAlert {
  type: AlertType,
  message: string
}

interface Props {
  type: AlertType
  length?: number // ms
  onDeath(): any
}

//

interface State {
  exiting: boolean
}

class Alert extends Component<Props, State> {
  state: State = {exiting: false};
  timeout: NodeJS.Timeout|undefined;
  dead = false;

  componentDidMount() {
    this.timeout = setTimeout(
      () => this.setState({exiting: true}, () =>
        this.timeout = setTimeout(this.props.onDeath, animationLength)),
      this.props.length || defaultAlertLength
    );
  }
  componentWillUnmount() {
    if (this.timeout) clearTimeout(this.timeout);
  }

  render() {
    return <div className={classMap(`alert alert__${this.props.type}`, this.state.exiting && "alert--exit")}>
      {this.props.children}
    </div>
  }
}

export default Alert;
