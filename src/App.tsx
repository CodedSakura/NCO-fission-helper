import React from 'react';

import RadialMenu, {MenuChoice} from "./Components/RadialMenu";

class App extends React.Component {
  render() {
    let choices1: MenuChoice[] = [];
    let choices2: MenuChoice[] = [];
    for (let i = 0; i < 10; i++) {
      choices1.push({name: `some text ${i}`, fn: () => console.log(1,i)})
    }
    for (let i = 0; i < 4; i++) {
      choices2.push({name: `some text ${i}`, fn: () => console.log(2,i)})
    }
    choices1[1].disabled = true;
    return <>
      <span>1</span>
      <RadialMenu choices={choices1}>
        2
      </RadialMenu>
      <span>3</span>
      <br/>
      Hello React!
      <RadialMenu choices={choices2}>
        <div style={{width: 100, height: 100, background: "#ffffff22"}}/>
      </RadialMenu>
    </>;
  }
}

export default App;
