

import React, {Component} from 'react';
import NotificationsSystem from 'reapop';
import theme from 'reapop-theme-wybo';


import {createStore, compose, applyMiddleware, combineReducers} from 'redux';
import thunk from 'redux-thunk';
import {reducer as notificationsReducer} from 'reapop';

// store
const createStoreWithMiddleware = compose(
  applyMiddleware(thunk)
)(createStore);
const store = createStoreWithMiddleware(combineReducers({
  // reducer must be mounted as `notifications` !
  notifications: notificationsReducer()
  // your reducers here
}), {});

class ATopLevelComponent extends Component {
  render() {
    return (
      <div style={
        {
          zIndex: "2",
          position: "absolute",
          backgroundColor: "#a6a6a6",
          borderStyle: "solid",
          clear: "both"
          //marginTop: "100px",
          //marginLeft: "50px",
          //marginBottom: "100px"
        }
      }
 >
        <NotificationsSystem theme={theme}/>
      </div>
    );
  }
}

export default ATopLevelComponent