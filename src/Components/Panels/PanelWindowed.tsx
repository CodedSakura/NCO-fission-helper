import React from "react";
import ReactDOM from "react-dom";
import {IPanelProps} from "./definitions";

interface Props {
  panelData: IPanelProps
  saveState?: boolean
  minimise?(): any
}

export default class PanelWindowed extends React.Component<Props> {
  window: Window|null;

  constructor(props: Props) {
    super(props);
    const {panelData: data, minimise = () => {}} = props;
    this.window = window.open("", data.name, "toolbar=no,location=no,menubar=no,resizable=yes,width=400,height=400");
    if (this.window) {
      this.window.document.title = data.name;
      this.window.addEventListener("beforeunload", () => minimise());
      Array.from(document.styleSheets).map(v => v.ownerNode).filter(v => v).forEach(v => this.window?.document.head.append(v!.cloneNode(true)));
    }
  }

  componentWillUnmount() {
    this.window?.close();
  }


  render() {
    const {panelData: data} = this.props;
    if (!this.window) return null;
    return ReactDOM.createPortal(
      <div className="panel panel--windowed">
        <div className="panel__header">{data.header || data.name}</div>
        {data.data}
      </div>,
      this.window.document.body
    );
  }
}