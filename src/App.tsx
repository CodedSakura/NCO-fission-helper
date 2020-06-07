import React from 'react';

import RadialMenu, {MenuChoice} from "./Components/RadialMenu";

class App extends React.Component {
  render() {
    let choices1: MenuChoice[] = [];
    let choices2: MenuChoice[] = [];
    for (let i = 0; i < 10; i++) {
      choices1.push({name: `[1] some text ${i}`, fn: () => console.log(1,i), ...(i === 1 ? {disabled: true} : {})})
    }
    for (let i = 0; i < 4; i++) {
      choices2.push({name: `[2] some text ${i}`, fn: () => console.log(2,i)})
    }
    choices1[8] = {name: "nested", choices: choices2};
    return <>
      <span>1</span>
      <RadialMenu choices={choices2}>
        2
      </RadialMenu>
      <span>3</span>
      <br/>
      Hello React!
      <RadialMenu choices={choices1}>
        <div style={{width: 400, height: 400, background: "#ffffff08"}}/>
      </RadialMenu>
    </>;
  }
}

export default App;
