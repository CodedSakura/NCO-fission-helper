import React from "react";
import ReactDOM from "react-dom";
import {IPanelProps, localStoragePanelPrefix} from "./definitions";

interface Props {
  panelData: IPanelProps
  saveLoad?: boolean
  minimise?(): any
}

export default class PanelWindowed extends React.Component<Props> {
  window: Window|null;

  constructor(props: Props) {
    super(props);
    const {panelData: data, minimise = () => { /* Empty */ }} = props;
    this.window = window.open("", data.name, "resizable,status," + this.loadLoc(data.name));
    if (this.window) {
      this.window.document.title = data.name;
      this.window.addEventListener("beforeunload", () => {
        this.saveLoc(data.name);
        minimise();
      });
      window.addEventListener("beforeunload", minimise);
      Array.from(document.styleSheets).map(v => v.ownerNode).filter(v => v).forEach(v => {
        if (v != null)
          this.window?.document.head.append(v.cloneNode(true));
      });
    }
  }

  saveLoc(name: string) {
    localStorage.setItem(localStoragePanelPrefix + name, JSON.stringify({
      width: this.window?.innerWidth, height: this.window?.innerHeight,
      top: this.window?.window.screenTop, left: this.window?.window.screenLeft
    }));
  }
  loadLoc(name: string): string {
    const locString = localStorage.getItem(localStoragePanelPrefix + name);
    if (locString) {
      const loc = JSON.parse(locString);
      return `top=${loc.top},left=${loc.left},width=${loc.width},height=${loc.height}`;
    }
    return "width=400,height=400";
  }

  componentWillUnmount() {
    const {panelData: {name}, minimise = () => { /* Empty */ }} = this.props;
    this.saveLoc(name);
    this.window?.close();
    window.removeEventListener("beforeunload", minimise);
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
