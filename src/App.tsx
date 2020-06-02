import React from 'react';

import RadialMenu, {MenuChoice} from "./Components/RadialMenu";

class App extends React.Component {
  render() {
    let choices1: MenuChoice[] = [];
    for (let i = 0; i < 10; i++) {
      choices1.push({name: `some text ${i}`, fn: () => console.log(i)})
    }
    choices1[1].disabled = true;
    return <>
      <RadialMenu choices={choices1}>
        <div style={{width: 400, height: 400}}>asd</div>
      </RadialMenu>
      Hello React!
    </>;
  }
}

export default App;
