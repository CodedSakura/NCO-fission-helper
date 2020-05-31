import React from 'react';

import RadialMenu from "./Components/RadialMenu";

import "./Style/App.scss"

class App extends React.Component {
  render() {
    let choices = [];
    for (let i = 0; i < 10; i++) {
      choices.push({name: `some text ${i}`, fn: () => console.log(i)})
    }
    return <>
      <RadialMenu choices={choices} active={1}/>
      Hello React!
    </>;
  }
}

export default App;
