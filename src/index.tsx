import React from 'react';
import ReactDOM from 'react-dom';

import * as serviceWorker from './serviceWorker';

// import App from './App';
import PanelTest from "./Components/Panels/tests/PanelTest";

import "./Style/global.scss"

ReactDOM.render(
  <React.StrictMode>
    {/*<App />*/}
    <PanelTest/>
  </React.StrictMode>,
  document.getElementById('root')
);

serviceWorker.unregister();
