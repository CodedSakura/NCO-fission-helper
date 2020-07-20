import React, {Component} from 'react';
import {PanelDockLocation, PanelDock} from "./index";

class PanelTest extends Component {
  render() {
    return <div style={{display: "flex"}}>
      <PanelDock panels={[{data: <div>Data [00]</div>, name: "Panel [00]"}, {data: <div>Data [01]</div>, name: "Panel [01]"}, {data: <div>Data [02]</div>, name: "Panel [02]"}]} location={PanelDockLocation.Left}/>
      <div style={{flex: "1"}}>[content]</div>
      <PanelDock panels={[
        {data: <div>Data [10]</div>, name: "Panel [10]"},
        {data: <div>Data [11]</div>, name: "Panel [11]"},
        {data: <div>Data [12]</div>, name: "Panel [12]"},
        {data: <div>Data [12]</div>, name: "Panel [13]"},
        {data: <div>Data [12]</div>, name: "Panel [14]"},
        ]} location={PanelDockLocation.Right}/>
    </div>
  }
}

export default PanelTest;