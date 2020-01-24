import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom'

import Navbar from './Component/Navbar'
import Landing from './Component/Landing'
import Login from './Component/Login'
import Register from './Component/Register'
import Profile from './Component/Profile'
import Post from './Component/Post'
import {Redirect} from "react-router-dom";
import NewPost from "./Component/NewPost";
import TravelPartners from "./Component/TravelPartners";
import Notifications from "./Component/Notifications";
import ATopLevelComponent from "./Component/ATopLevelComponent";
import pic from "./travel.jpeg";
import moment from "moment";
import Search from "./Component/Search"

function isLoggedIn() {
  if (localStorage.usertoken) {
    return true
  }
  return false
}



class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Navbar />
          <div><img src={pic} alt="Pic" height={"400px"} width={"100%"}/><br></br></div>
          <ATopLevelComponent/>
          <Route exact path="/" render={(props)=><Landing{...props}/>} />
          <div className="container">
            <Route exact path="/register" render={(props) => (
                !isLoggedIn() ? (
                    <Register {...props} />) : (<Redirect to="/profile"/> )
            )}/>
            <Route exact path="/login" render={(props) => (
                !isLoggedIn() ? (
                    <Login {...props} />) : (<Redirect to="/profile"/> )
            )}/>
             <Route exact path="/users/:id" render={(props) => (
                isLoggedIn() ? (
                    <Profile {...props}/>) : (<Redirect to="/login"/> )
            )}/>
            <Route exact path="/profile/:id" render={(props) => (
                isLoggedIn() ? (
                    <Profile {...props} />) : (<Redirect to="/login"/> )
            )}/>
            <Route exact path="/posts/:id" render={(props) => (
                isLoggedIn() ? (
                    <Post {...props} />) : (<Redirect to="/login"/> )
            )}/>
            <Route exact path="/post/new" render={(props) => (
                isLoggedIn() ? (
                    <NewPost {...props} />) : (<Redirect to="/login"/> )
            )}/>
            <Route exact path="/travelpartners" render={(props) => (
                isLoggedIn() ? (
                    <TravelPartners {...props} />) :  (<Redirect to="/login"/>)
            )}/>
             <Route exact path="/notifications" render={(props) => (
                isLoggedIn() ? (
                    <Notifications {...props} />) :  (<Redirect to="/login"/>)
            )}/>
            <Route exact path="/search/:searchfor" render={(props) => (
                isLoggedIn() ? (
                    <Search {...props}  />) : (<Redirect to="/login"/> )
            )}/>
          </div>
        </div>
      </Router>
    )
  }
}


export default App;
