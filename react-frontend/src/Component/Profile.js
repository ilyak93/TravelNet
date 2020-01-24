import React, { Component } from 'react';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'
import ToggleButton from 'react-bootstrap/ToggleButton'
import { Nav, NavItem, NavLink,ButtonGroup } from 'reactstrap';
import axios from "axios";
import {About} from "./About";
import {Users} from "./Users";
import {Post} from "./Post";

import Button from "react-bootstrap/Button";
import jwt_decode from "jwt-decode";
import Badge from "react-bootstrap/Badge";

export class Profile extends Component{
    state={
        username: '',
        email: '',
        image_file: '',
        postsFlag: 0,
        aboutFlag:0,
        followingFlag:0,
        followersFlag:0,
        isFollowing: false,
        isFollowingMe: false,
        current_user:0,
        followers_amount:0,
        followed_amount:0
    }
    showPosts(e) {
        e.preventDefault()
        this.setState({
                postsFlag: 1,
                aboutFlag: 0,
                 followingFlag:0,
                followersFlag:0
            })
    }

    showAbout(){
        this.setState({postsFlag: 0,
        aboutFlag:1,
          followingFlag:0,
                followersFlag:0})
    }

    showFollowing(){
        this.setState({postsFlag: 0,
        aboutFlag:0,
          followingFlag:1,
                followersFlag:0})
    }

    showFollowers(){
        this.setState({postsFlag: 0,
        aboutFlag:0,
          followingFlag:0,
                followersFlag:1})
    }
    componentDidMount() {
         const token = localStorage.usertoken;
          if (token) {
              const decoded = jwt_decode(token);
              this.setState({
                  current_user: decoded.identity.id
              },()=>{console.log('user load')});
          }//TODO: maybe everything in callback
        axios.defaults.withCredentials = true;
        axios.get('http://127.0.0.1:5000/users/' + this.props.match.params.id).then((response) => {
                this.setState({
                   username: response.data.username,
                    image_file: response.data.image_file,
                  email: response.data.email,
                    followers_amount: response.data.followers,
                    followed_amount: response.data.followed,
                })
            }).catch(err => {
                console.log(err)
            });
        axios.defaults.withCredentials = true;
         axios.get('http://127.0.0.1:5000/is_following/' + this.props.match.params.id).then((response) => {
             const res = ( response.data == 'True') ? true : false;
                this.setState({
                   isFollowing: res
                })
            }).catch(err => {
                console.log(err)
            });

         axios.defaults.withCredentials = true;
         axios.get('http://127.0.0.1:5000/is_following_me/' + this.props.match.params.id).then((response) => {
             const res = ( response.data == 'True') ? true : false;
                this.setState({
                   isFollowingMe: res
                })
            }).catch(err => {
                console.log(err)
            });

  }
   componentDidUpdate (prevProps) {
       if (prevProps.location.pathname !== this.props.location.pathname) {
           this.componentDidMount();
       }
   }

   followUser(){
         axios.defaults.withCredentials = true;
         axios.post('http://127.0.0.1:5000/follow/' + this.props.match.params.id).then((response) => {
                this.setState({
                   isFollowing: true
                })
             this.componentDidMount();
            }).catch(err => {
                console.log(err)
            });
   }

    unfollowUser(){
         axios.defaults.withCredentials = true;
         axios.delete('http://127.0.0.1:5000/follow/' + this.props.match.params.id).then((response) => {
                this.setState({
                   isFollowing: false
                })
             this.componentDidMount();
            }).catch(err => {
                console.log(err)
            });
   }

   updateMenuInfo(info){
        this.setState({
              username: info.username,
                email: info.email,
        });

   }
   delete(){
        axios.defaults.withCredentials = true;
        axios.delete('http://127.0.0.1:5000/users/' + this.props.match.params.id).then((response) => {
            if(response.data ==='Deleted'){
                console.log("deleting");
                localStorage.removeItem('usertoken')
                this.props.history.push(`/`)
            }
   }
   ).catch(err=>console.log(err))
    }
   updateMenuPic(info){
        console.log(info);
        this.setState({
              image_file: "/static/pictures/"+info.image_file,
        });
        console.log("updated pic" + info.image_file);

   }
    render(){
        return( <div><br></br><br></br>
                 <br></br><br></br>
                <div className="jumbotron mt-1 " style={{width:"50%" ,margin:"auto",backgroundColor:"rgba(100,100,100,0.6)"}}>
                    <div className="jumbotron-fluid mt-5" >
                      <div className="text-center">
                          <div className="media">
                                      <div className="media-body">
                                          {this.state.image_file.length > 0 && <img className="center" className="rounded-circle account-img"
                                               src={"http://127.0.0.1:5000" + this.state.image_file + "?" + (new Date()).toString()}
                                               height="200" width="200"
                                          />}<br/><br/>
                                          <div style={{backgroundColor:"rgba(255,255,255,1)", width:"50%",margin:"auto",border:" 2px solid coral"}}>
                                          <h1 className="account-heading" >{this.state.username}</h1>
                                          <p className="text-secondary">{this.state.email}

                                          {(this.state.current_user != this.props.match.params.id) && this.state.isFollowingMe &&
                                          <h5><Badge pill variant="secondary">Follows you</Badge></h5>}</p></div>
                                               {(this.state.current_user != this.props.match.params.id) && <Button
                                                  variant="outline-primary"
                                                  onClick={this.state.isFollowing ? this.unfollowUser.bind(this) : this.followUser.bind(this)}
                                                >
                                                  {this.state.isFollowing ? 'Unfollow' : 'Follow'}
                                                </Button> }

                                      </div>
                      </div>
                    </div>
                    </div>
                </div>



                <br></br><br></br>
                <br></br><br></br>

                <div className="nav justify-content-center ">

            {(this.state.isFollowing || this.state.current_user==this.props.match.params.id) &&
                          <Button variant="success" className="btn mr-3" onClick= {this.showAbout.bind(this)}
                          >
                                About Me
                          </Button>
                          }{" "}
                {(this.state.isFollowing || this.state.current_user==this.props.match.params.id)&&
                          <Button className="btn mr-3" onClick= {this.showFollowing.bind(this)}
                          >
                                following
                          </Button>}{"    "}
                {this.state.current_user==this.props.match.params.id &&
                <Button variant="danger" className="btn mr-3" onClick= {this.delete.bind(this)}
                          >
                                delete
                          </Button>}{"   "}
                          {(this.state.isFollowing || this.state.current_user==this.props.match.params.id) &&
                               <Button className="btn mr-3" onClick= {this.showFollowers.bind(this)}>
                                   folllowers
                               </Button>
                               }{" "}
                {this.state.current_user == this.props.match.params.id &&
                <Button className="btn mr-3" href="/post/new">new post </Button>
                }
                {this.state.current_user == this.props.match.params.id &&
                <Button variant="warning" className="btn mr-3" href="/notifications"><i className='fas fa-bell' style={{fontSize:"22px"}}>  </i> </Button>
                }

            </div>






            {this.state.aboutFlag ? <About id ={this.props.match.params.id} updateInfo={this.updateMenuInfo.bind(this)} image_file={this.state.image_file}
                    updatePic={this.updateMenuPic.bind(this)} /> : <br/>}
                {this.state.followersFlag  ? <Users id ={this.props.match.params.id} type={1} flag={this.state.isFollowing}/> : <br/>}
                {this.state.followingFlag  ? <Users id ={this.props.match.params.id} type={2} flag={this.state.isFollowing}/> : <br/>}
                {this.state.postsFlag  ? <Post id ={this.props.match.params.id} type={2} flag={this.state.isFollowing}/> : <br/>}
            </div>

        )
    }
}

export default Profile;