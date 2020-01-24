import React, { Component } from 'react'
import {
    StreamApp,
    NotificationDropdown,
    FlatFeed,
    LikeButton,
    Activity,
    CommentField,
    CommentList,
    StatusUpdateForm, NotificationFeed, Notification
} from 'react-activity-feed';
import 'react-activity-feed/dist/index.css';
import pic from "../travel.jpeg"
import axios from "axios";
import ReactPaginate from "react-paginate";
import L from "leaflet";
import jwt_decode from "jwt-decode";
import Table from "react-bootstrap/Table";

const date_sort = (a,b) =>{

    return new Date(b.date_posted)-new Date(a.date_posted)
}

// const find_user = (username) => {
//     axios.defaults.withCredentials = true;
//     axios.get('http://127.0.0.1:5000/user/' + username).then(res=>{console.log("something");this.props.history.push('/profile/'+res.data.id);}).catch(err=>console.log('user no exst ' + username))
//}

class Landing extends Component {
    constructor (){
        super();
    this.state = {
        current_user:0,
        posts: [],
        current_page:1
    };
    this.find_user = this.find_user.bind(this)
}
find_user = (username) => {
        axios.defaults.withCredentials = true;
        axios.get('http://127.0.0.1:5000/user/' + username).then(res => {
            console.log("something");
            this.props.history.push('/profile/' + res.data.id);
        }).catch(err => console.log('user no exst ' + username))
    }
    get_self_posts = () =>{
        axios.defaults.withCredentials = true;
    return axios.get('http://127.0.0.1:5000/posts/user/'+ this.state.current_user).then(response => {

            return response.data.posts_array;
        }).catch(er=>{console.log(er);return []});
    };
    get_posts_of_followed_users = () => {
        axios.defaults.withCredentials = true;
    return axios
        .get('http://127.0.0.1:5000/travelpartners', {})
        .then(response => {

            return response.data.posts_array;
        }).catch(er=>{console.log(er);return []})
    }
    handlePageClick = data => {
        const new_page = (data.selected+1);
          this.setState({
                current_page: new_page
            });
    }


    componentDidMount() {
        const token = localStorage.usertoken;
          if (token) {

              this.setState({current_page:1});
              const decoded = jwt_decode(token);
              axios.defaults.withCredentials = true;
              this.setState({
                  current_user: decoded.identity.id},()=>
                        {this.get_posts_of_followed_users().then(res=>
                  {this.setState({posts:res},()=>{
                      this.get_self_posts().then(res=>{this.setState({posts:this.state.posts.concat(res)},()=>{
                          this.setState(({posts:this.state.posts.sort(date_sort)}))
                          });
                      }
                      )
                  }
                  )
                }
                )
              }
              )
          }
            }
    componentDidUpdate (prevProps) {
        if (prevProps.location.pathname !== this.props.location.pathname) {
            this.componentDidMount();
        }
    }
    render() {
        let x = this.state.posts.map(post => {
                return (

                    <Activity
                        onClickHashtag={
                            this.find_user
                        }
                        onClickUser={() => console.log('/user/' + post.user_id)}
                        activity={{

                            actor: {
                                data: {
                                    name: <a href={'/users/' + post.user_id}>{post.username}</a>,
                                    profileImage: 'http://127.0.0.1:5000' + post.image + '?' + new Date().toString(),
                                },
                            },
                            verb: 'post',
                            object: post.comment,// TODO: add tag lists
                            attachments: {
                                og: {
                                    description:
                                        <p style={{color:"red"}}><a href={"/posts/"+post.id}> {post.content}</a></p>,
                                    title:
                                        <a href={"/posts/"+post.id}>{post.title}</a>,
                                    /*url:
                                        "/posts/" + post.id,/**/
                                    images: [
                                        {
                                            image:
                                                'http://127.0.0.1:5000' +post.image_file+"?"+new Date().toString(),// TODO: add posts pics
                                        },
                                    ],
                                },
                            },
                            time: post.date_posted,
                        }}/>
                );
            }
        );
        if (localStorage.usertoken) {
            return (<div className="container">

                <div  style={{width:"500px",margin:"auto",height:"20%"}}>
                    <br/><br/><br/>
                    {x}
                    <br/><br/><br/>
                    </div>



            </div>)
        }
        return <div></div>
    }
}

export default Landing