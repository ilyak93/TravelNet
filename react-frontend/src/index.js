import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import './style.scss'

import {Provider} from 'react-redux'
import {createStore, compose, combineReducers, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
import {reducer as notificationsReducer} from 'reapop'


// store
const enhancers = []
const devToolsExtension = window.devToolsExtension

if (typeof devToolsExtension === 'function') {
  enhancers.push(devToolsExtension())
}
const createStoreWithMiddleware = compose(applyMiddleware(thunk), ...enhancers)(createStore)
const store = createStoreWithMiddleware(combineReducers({
  notifications: notificationsReducer()
}), {})

const styleLink = document.createElement("link");
styleLink.rel = "stylesheet";
styleLink.href = "https://cdn.jsdelivr.net/npm/semantic-ui/dist/semantic.min.css";
document.head.appendChild(styleLink);

// render
ReactDOM.render(
  <Provider store={store}>
      <App/>
  </Provider>
  ,
  document.getElementById('root')
)


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
