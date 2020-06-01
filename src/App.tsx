import React from 'react';

import RadialMenu from "./Components/RadialMenu";

import "./Style/App.scss"
import Grid2D from "./Components/Grid2D";

class App extends React.Component {
  render() {
    let choices = [];
    for (let i = 0; i < 10; i++) {
      choices.push({name: `some text ${i}`, fn: () => console.log(i)})
    }
    return <>
      <RadialMenu choices={choices} active={1}/>
      Hello React!
      <Grid2D data={[[[]]]}/>
    </>;
  }
}

export default App;
