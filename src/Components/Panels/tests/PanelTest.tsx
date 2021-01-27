import React from 'react';
import PanelDock, {PanelMode, PanelState} from "..";

export default function PanelTest() {
  return <PanelDock prepend={"text"} leftTop={[
    {data: <div>Data [000]</div>, name: "Panel [000]"},
    {data: <div>Data [001]</div>, name: "Panel [001]"},
    {data: <div>Data [002]</div>, name: "Panel [002]"},
    {data: <div>Data [003]</div>, name: "Panel [003]", state: PanelState.Open, header: "003", headerButtons: [{icon: "L"}]},
    {data: <div>Data [004]</div>, name: "Panel [004]", state: PanelState.Open, mode: PanelMode.Windowed},
    {data: <div>Data [005]</div>, name: "Long Panel [005]"},
    {data: <div>Data [006]</div>, name: "Panel [006]"},]} leftBottom={[
    {data: <div>Data [010]</div>, name: "Panel [010]"},
    {data: <div>Data [011]</div>, name: "Panel [011]"},
    {data: <div>Data [012]</div>, name: "Panel [012]", state: PanelState.Open},
    {data: <div>Data [013]</div>, name: "Panel [013]"},
    {data: <div>Data [014]</div>, name: "Panel [014]", state: PanelState.Open, mode: PanelMode.Floating},
    {data: <div>Data [015]</div>, name: "Panel [015]"},
    {data: <div>Data [016]</div>, name: "Panel [016]", state: PanelState.Hidden},
    {data: <div>Data [017]</div>, name: "Panel [017]"},]} rightBottom={[
    {data: <div style={{height: "4000px"}}>Data [110]</div>, name: "Panel [110]"},
    {data: <div>Data [111]</div>, name: "Panel [111]"},
    {data: <div>Data [112]</div>, name: "Panel [112]"},
    {data: <div>Data [113]</div>, name: "Panel [113]"},]} bottomLeft={[
    {data: <div>Data [300]</div>, name: "Panel [300]"},
    {data: <div>Data [301]</div>, name: "Panel [301]"},
    {data: <div>Data [302]</div>, name: "Panel [302]"},]} bottomRight={[
    {data: <div>Data [310]</div>, name: "Panel [310]"},
    {data: <div>Data [311]</div>, name: "Panel [311]"},]} topLeft={[
    {data: <div>Data [400]</div>, name: "Panel [400]", state: PanelState.Open},]}>BODY</PanelDock>;
}
