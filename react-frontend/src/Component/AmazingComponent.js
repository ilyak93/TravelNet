import React, {Component} from 'react';
import {connect} from 'react-redux';
import {notify} from 'reapop';

import PropTypes from 'prop-types'
import {removeNotifications} from 'reapop'
import {STATUS} from 'reapop'
import pic from "../notf.jpg";
import pic2 from "../clean.jpeg";
import {IconBadge} from "react-activity-feed";
import axios from "axios";
import jwt_decode from "jwt-decode";


const get_notifications = () =>{
        axios.defaults.withCredentials = true;
    return axios.get('http://127.0.0.1:5000/').then(response => {
            return response.data.all_notifications;
        });
    };

const update_notification = (notification) => {
    axios.defaults.withCredentials= true;
    return axios.post("http://127.0.0.1:5000/", notification).then(response => {
            return response.data;
        }).catch(err=>console.log(err))
}

const delete_notification = (notification) => {
    axios.defaults.withCredentials= true;
    return axios.delete("http://127.0.0.1:5000/",{data: notification}).catch(err=>console.log(err))
}

const get_user = (user_id) => {
     return axios.get('http://127.0.0.1:5000/users/' + user_id).then(res => {
         return res.data;
         }
     )
}

const get_post = (post_id) => {
     return axios.get('http://127.0.0.1:5000/post/' + post_id).then(res => {
         return res.data;
         }
     )
}



class AmazingComponent extends Component {

    static propTypes = {
    notify: PropTypes.func.isRequired,
    removeNotifications: PropTypes.func.isRequired
  };

    state = {
        all_notifications: [],
        notifications_to_show : [],
        notifications_shown: [],
        //show_option: null,
    }

  constructor(props) {
    super(props);
    this._onClick = this._onClick.bind(this);
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
                        this.setState({all_notifications: all_notifications_got})
                        this.setState({notifications_to_show: this.state.all_notifications
                                .filter(notfs => notfs['showed'] === false)})

                    }
                    )
            }
            )
        }
    }

   _onClick() {
       const {notify} = this.props
       let path = "127.0.0.1:5000"
       for (let notification of this.state.notifications_to_show) {
           if(this.state.notifications_shown.includes(notification) > 0 ) continue;
           get_post(notification["post_id"]).then(post =>
               {
               let content = notification["content"];
               get_user(post["user_id"]).then(user => {

                   let profile_pic = user["image_file"];
                    console.log(user['image_file']);
                    notify({
                        id: notification["id"],
                        title: user["first_name"] +" "+ user["last_name"],
                        message: content,
                        image: 'http://127.0.0.1:5000'+user['image_file'],
                        status: STATUS.default,
                        dismissible: false,
                        dismissAfter: 0,
                        closeButton:true,
                        /*
                        buttons: [
                            {
                                name: 'Delete notification',
                                onClick: delete_notification
                            }
                            ],
                         */
                        allowHTML: true
                    })
                    this.state.notifications_shown.push(notification);
                    update_notification(notification);
                this.setState({notifications_shown: this.state.notifications_shown});
               });
               }); //TODO: add link to post
            }
       this.setState({notifications_shown: this.state.notifications_shown});
    }

  removeNotifications = () => {
    this.props.removeNotifications()
      this.setState({notifications_shown: this.state.notifications_shown});
  }

  render() {
    const clean_button_style = {
        height: "20px",
        width: "20px"
    }

    /*
    const notf_button_style = {
        height: "25px",
        width: "25px"
    }

    <button  onClick={this._onClick}>
          <img src={pic} style={notf_button_style}/>
          </button>
      */
    return (
      <div>
          <button onClick={this._onClick}>
          <IconBadge showNumber={true} unseen={this.state.notifications_to_show.length - this.state.notifications_shown.length} hidden={false} />
          </button>
          <button onClick={this.removeNotifications}>
          <img src={pic2} style={clean_button_style}/>
        </button>
      </div>
    );
  }
}
// 2. we map dispatch to props `notify` async action creator
//    here we use a shortcut instead of passing a `mapDispathToProps` function
export default connect(null, {
  notify,
  removeNotifications
})(AmazingComponent);