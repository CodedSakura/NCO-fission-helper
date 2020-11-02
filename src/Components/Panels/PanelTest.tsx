import React, {Component} from 'react';
import {PanelDock, PanelDockLocation} from "./index";
import "./PanelTest.scss";

class PanelTest extends Component {
  render() {
    return <>
      <div id="body-cont">
        <PanelDock panels={[]} location={PanelDockLocation.Left}/>
        <div id="body">
          BODY
        </div>
        <PanelDock panels={[]} location={PanelDockLocation.Right}/>
      </div>
      <PanelDock panels={[]} location={PanelDockLocation.Bottom}/>
      {/*<PanelDock panels={[{data: <div>Data [00]</div>, name: "Panel [00]"}, {data: <div>Data [01]</div>, name: "Panel [01]"}, {data: <div>Data [02]</div>, name: "Panel [02]"}]} location={PanelDockLocation.Left}/>
      <div style={{flex: "1"}}>
        [<Icon name={Icons.Minimise}/><Icon name={Icons.Close}/>]<br/>
        [<Icon name={Icons.Docked}/><Icon name={Icons.Floating}/><Icon name={Icons.Windowed}/>]
      </div>
      <PanelDock panels={[
        {data: <div>Data [10]</div>, name: "Panel [10]"},
        {data: <div>Data [11]</div>, name: "Panel [11]"},
        {data: <div>Data [12]</div>, name: "Panel [12]"},
        {data: <div>Data [12]</div>, name: "Panel [13]"},
        {data: <div>Data [12]</div>, name: "Panel [14]"},
        ]} location={PanelDockLocation.Right}/>*/}
    </>
  }
}

export default PanelTest;