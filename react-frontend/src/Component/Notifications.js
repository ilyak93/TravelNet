import React, { Component } from 'react'
import { Notification } from 'react-activity-feed';
import 'react-activity-feed/dist/index.css';
import pic from "../travel.jpeg"
import axios from "axios";
import ReactPaginate from "react-paginate";
import jwt_decode from "jwt-decode";
import Table from "react-bootstrap/Table";
import AmazingComponent from "./AmazingComponent";
import ATopLevelComponent from "./ATopLevelComponent";

import { Feed } from 'semantic-ui-react'


const notification = {

}

const FeedExampleBasic = () => (
  <Feed>
    <Feed.Event>
      <Feed.Label image='https://react.semantic-ui.com/images/avatar/small/helen.jpg' />
      <Feed.Content>
        <Feed.Summary>
          <a>link to user</a> edited his/her <a>link to post</a>
          <Feed.Date>time of modification</Feed.Date>
        </Feed.Summary>
        <Feed.Extra images>
          <a>
            <img src='https://react.semantic-ui.comhttps://react.semantic-ui.com/images/wireframe/image.png' />
          </a>
        </Feed.Extra>
        <Feed.Meta>
          <button>V</button>
          <button>Delete</button>
        </Feed.Meta>
      </Feed.Content>
    </Feed.Event>
  </Feed>
)

const date_sort = (a,b) =>{
    return new Date(b.date_posted)-new Date(a.date_posted)
}


const get_notifications = () =>{
        axios.defaults.withCredentials = true;
    return axios.get('http://127.0.0.1:5000/notifications').then(response => {

            return response.data.all_notifications;
        });
    };

const delete_notification = (notification_id) =>{
        axios.defaults.withCredentials = true;
    return axios.delete('http://127.0.0.1:5000/notifications/'+notification_id).then( deleted => {
       return deleted;
    });
};

class Notifications extends Component {
    state= {
        current_user:0,
        all_notifications: [],
        read_notifications: [],
        unread_notifications: [],
        show_option: null,
        current_page:1
    }

    handleDeleteClick = (event) => {
         let notification_id = event.target.id;
         delete_notification(notification_id).then(response => {
             let deleted = response.data;

             if(deleted === {}){
                 alert("Delete Failed");
             } else {
                 alert("Succesfully deleted");
             }
             const all_notification_after_delete = this.state.all_notifications.filter(
                 notification => notification["notification_id"] !== deleted["notification_id"]);
             this.setState({all_notifications: all_notification_after_delete});

         });

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
            this.setState({current_page: 1});
            const decoded = jwt_decode(token);
            axios.defaults.withCredentials = true;

            this.setState({
                    current_user: decoded.identity.id
                }, () => {
                    get_notifications().then(all_notifications_got => {
                        this.state.all_notifications = all_notifications_got;
                        this.setState({});
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
        let notifications_to_show = [];
        /*
        if(this.state.show_option === 'read'){
              notifications_to_show = this.state.all_notifications.filter(notf => notf['showed'] === "true");
        } else if(this.state.show_option === 'unread'){
           notifications_to_show = this.state.all_notifications.filter(notf => notf['showed'] === "false");
        } else if(this.state.show_option === 'all') {
          notifications_to_show =  this.state.all_notifications;
        }
        */
        notifications_to_show = this.state.all_notifications;
        let x = notifications_to_show.map(notification => {
            return (<Feed.Event
                                style={{
                                    borderStyle: "groove",
                                    borderWidth: "7px",
                                    borderColor: "coral",
                                    marginTop: "50px",
                                    backgroundColor: "white"
                                }}>
                <Feed.Label  href={"/users/"+notification["user_id"]} image={"http://127.0.0.1:5000/static/pictures/"+notification["image_file"]}/>
                <Feed.Content>
                    <Feed.Summary>
                        {
                            notification["author_gender"].localeCompare("Male") === 0 ? notification["author_first_name"]+" "+notification["author_last_name"]+
                                " has edited his post" : notification["author_first_name"]+" "+notification["author_last_name"]+
                                " has edited her post"
                        }
                        <Feed.Date>{notification["time"]}</Feed.Date>
                    </Feed.Summary>
                    <Feed.Extra images>
                        <a href={"/posts/"+notification["post_id"]}>
                            <img src={"http://127.0.0.1:5000/static/pictures/"+notification["post_image_file"]}/>
                        </a>
                    </Feed.Extra>
                    <Feed.Meta>
                        <button id = {notification["notification_id"]} style={{marginLeft:"400px"}} onClick={this.handleDeleteClick}>Delete</button>
                    </Feed.Meta>
                </Feed.Content>
            </Feed.Event>);
        })
        if (localStorage.usertoken) {
            return (<div>
                <Table className="table col-md-6 mx-auto">
                    <Feed>
                        {x}
                    </Feed>
                </Table>
                <div>
                    <ReactPaginate
                        breakLabel={'...'}
                        breakClassName={'break-me'}
                        pageCount={Math.ceil(this.state.all_notifications.length / 5)}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={2}
                        onPageChange={this.handlePageClick}
                        containerClassName={'pagination'}
                        subContainerClassName={'pages pagination'}
                        disabledClassName={'disabled'}
                        activeClassName={'active'}
                        forcePage={this.state.current_page - 1}
                    />
                </div>
            </div>)
        }
        return <div/>
    }
}

export default Notifications