import React, { Component } from 'react'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css";
import Alert from "reactstrap/es/Alert";
import axios from "axios";
import {EditPost} from "./Post";
import jwt_decode from "jwt-decode";

const default_pic_src = "http://127.0.0.1:5000/static/pictures/default.jpg";

export const register = newUser => {
  return axios
    .post('http://127.0.0.1:5000/user/new', {
      username: newUser.username,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      gender: newUser.gender,
      birth_date: newUser.birth_date,
      email: newUser.email,
      password: newUser.password
    })
    .then(response => {
        return response.data
    })
}


const validEmailRegex =
  RegExp(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i);

const validateForm = (errors) => {
  let valid = true;
  Object.values(errors).forEach(
    (val) => val.length > 0 && (valid = false)
  );
  return valid;
};

class Register extends Component {
  constructor() {
    super();
    this.state = {
      username: '',
      first_name: '',
      last_name: '',
      gender: '',
      birth_date: new Date(),
      email: '',
      password: '',
        current_user: 0,
        post_id:0,
        title:'',
        date_posted:'',
        start_d:new Date(),
        end_d:new Date,
        country:'',
        city:'',
        latitude:0,
        longitude:0,
        description:'',
        user_id:0,
        comment:'',
        current_loc_marker:[],
        zoom:5,
        file:null,
        previmg:default_pic_src,
        postfile:null,
        postprevimg:default_pic_src,
      errors: {
          username: 'username cant be empty',
          email: 'email cant be empty',
          password: 'password cant be empty',
          first_name: 'first name cant be empty',
          last_name: 'last name cant be empty',
          gender: 'choose gender',

      },
        post_errors:{
            title:'cant empty',
            dates:''
        },
        first_submit:false,
      user_taken: 0,
      email_taken: 0,
      invalid: 0,
        title_changed:0,
        gender_changed:0,
        with_post:false

    }

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
      this.onChangeImg = this.onChangeImg.bind(this);
      this.onChangeImgPost = this.onChangeImgPost.bind(this);
      this.uploadImg = this.uploadImg.bind(this);
      this.createFirstPost=this.createFirstPost.bind(this)
      this.onClick=this.onClick.bind(this);
  }

  handleChange = date => {
    this.setState({
      birth_date: date
    });
  };
  onChange(e) {
      //  e.preventDefault()
        let errors = this.state.errors;
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        const name = e.target.name;

        this.setState({ [name]:value });

        switch (name) {
            case 'username':
                this.setState({user_taken: 0});
                errors.username =
                  value.length < 1 || value.length > 20
                    ? 'Username is not valid!'
                    : '';
                break;
            case 'gender':
                errors.gender='';
                this.setState({gender_changed:1});
                break;
            case 'email':
                this.setState({email_taken: 0});
                errors.email =
                  validEmailRegex.test(value)  && value.length <= 120
                    ? ''
                    : 'Email is not valid!';
                break;
              case 'password':
                errors.password =
                  value.length < 1 || value.length > 60
                    ? 'Password is not valid!'
                    : '';
                break;
                case 'first_name':
                errors.first_name =
                  value.length > 20
                    ? 'First name is too long'
                    : '';
                break;
                case 'last_name':
                errors.last_name =
                  value.length > 20
                    ? 'Last name is too long'
                    : '';
                break;
            case 'title':

                //this.setState({post_errors.title:})
                this.state.post_errors.title = value > 30 || value < 1
                    ? 'title not valid'
                    : ''
              default:
                break;
        }
        this.setState({errors, [name]: value});
  }
  onSubmit(e,start,end) {
    e.preventDefault();

    this.setState({first_submit:true});
    this.setState({invalid: 0});
    this.setState({user_taken: 0});
    this.setState({email_taken: 0});


    let newUser = {
      username: this.state.username,
      first_name: this.state.first_name,
      last_name: this.state.last_name,
      gender: this.state.gender,
      birth_date: this.state.birth_date,
      email: this.state.email,
      password: this.state.password
    }

    this.state.post_errors.dates = start > end ? "start must be after end" : "";

     if (validateForm(this.state.errors) && (!this.state.with_post || validateForm(this.state.post_errors))) {
         console.log("passed")
         register(newUser).then(res => {
             if (res === 'Created') {
                      axios.post('http://127.0.0.1:5000/login', {
                                email: newUser.email,
                                password: newUser.password}).then(
                                    response => {
                                            localStorage.setItem('usertoken', response.data);
                                           // this.setState({current_user:})

                                             if(this.state.file){this.uploadImg(0)}
                                             if(!this.state.with_post) {this.props.history.push('/')}
                                             else{
                                                 this.createFirstPost(start,end);
                                                 return response.data
                                          }
             }
                                    )
                                          .catch(err => {

                                            console.log(err);
                                            return 'error'
                                          });

                 }

             if (res == 'Username Taken'){
                 this.setState({user_taken: 1});
                 this.setState({invalid: 1});
             }
             if (res == 'Email Taken'){
                 this.setState({email_taken: 1});
                 this.setState({invalid: 1});
             }
         })
     }
     else{
         this.setState({invalid: 1});
     }
  }
  uploadImg(post_id){
      let img = post_id == 0 ? this.state.file :this.state.postfile;
      console.log("img upload fot post"+ post_id)
      const token = localStorage.usertoken;
      const decoded = jwt_decode(token);

      console.log("post id is:"+post_id);
      axios.defaults.withCredentials = true;
      if(post_id == 0)
      axios
        .post("http://127.0.0.1:5000/image/profile", img,{headers:{'content-type': 'image/png'}})
        .then(res =>
            {return res.data.image_file;}
            ).catch(err=>{console.log(err)})
      else{

      axios
        .post("http://127.0.0.1:5000/image/post/"+post_id, img,{headers:{'content-type': 'image/png'}})
        .then(res =>
            {return res.data.image_file;}
            ).catch(err=>{console.log(err)})

      }
  }

  onChangeImg(e){
      e.preventDefault();

       if(!e.target.files){
           this.setState({file:null, previmg:default_pic_src});
     }
     else{
    this.setState({file:e.target.files[0]},()=>{
        let reader=new FileReader();
        reader.onloadend = e=>{this.setState({previmg:reader.result})};
        reader.readAsDataURL(this.state.file);
       }
    )
      }
  }
  onChangeImgPost(e){
      e.preventDefault();

       if(!e.target.files){
           this.setState({postfile:null, postprevimg:default_pic_src});
       }
       else{

    this.setState({postfile:e.target.files[0]},()=>{
        let reader=new FileReader();
        reader.onloadend = e=>{this.setState({postprevimg:reader.result})};
        reader.readAsDataURL(this.state.postfile);
       }
    )
      }
  }




  deleteUser(){
      if(this.state.current_user == 0 ){return 'error'}
      axios.defaults.withCredentials =true;
      axios.delete('http://127.0.0.1:5000/users/'+this.state.current_user).then(res=>{
          if(res.data==="Deleted"){localStorage.removeItem('usertoken'); return "Deleted"}
          else{return "error"} //TODO: CHANGES
      }
      ).catch(reason => {return "not deleted"})
  }
  createFirstPost(start,end) {
      console.log(this.state);
//jwt_decode(localStorage.usertoken).identity.id
      const token = localStorage.usertoken;
      if (token) {
          const decoded = jwt_decode(token);
          this.setState({
              current_user: decoded.identity.id
          }, () => {
              console.log('user load')
          });
      }
      else {return "error";}

    let newPost = {
         user_id:this.state.current_user,
          title:this.state.title,
          start_d:start,
          end_d:end,
            latitude:parseFloat(this.state.latitude),
            longitude:parseFloat(this.state.longitude),
            description:this.state.description,
            city:this.state.city,
            country:this.state.country,
            comment:this.state.comment
    };
      axios.defaults.withCredentials = true;
      console.log(this.state.current_user);
      console.log("user is" +jwt_decode(localStorage.usertoken).identity.id);
      console.log(this.state);
      console.log(newPost);
      return axios.post('http://127.0.0.1:5000/posts/new',newPost)
                        .then(response=>{
                            if(this.state.postfile){console.log(this.state.postfile);
                                this.uploadImg(response.data)}
//TODO:
                            this.props.history.push('/')}
                        )

                                        .catch(err => {
                                            console.log(err);
         this.setState({invalid: 1});
                                            this.deleteUser();
                                            return 'error'
                                          });
  }

  onClick = (e) => {
      console.log(this.state.current_loc_marker)
        this.state.current_loc_marker.pop();
      console.log(this.state.current_loc_marker)
        this.state.current_loc_marker.push(e.latlng);
      console.log(this.state.current_loc_marker)
        this.setState({current_loc_marker: this.state.current_loc_marker});
        document.getElementById('lat').value = e.latlng.lat
        document.getElementById('lng').value = e.latlng.lng
        this.setState({latitude:e.latlng.lat,longitude:e.latlng.lng})
  }
  render() {
    return (
      <div className="container">
          <div className="jumbotron mt-1 " style={{width:"90%" ,margin:"auto",backgroundColor:"rgba(100,100,100,0.6)"}}>
        <div className="row">
          <div className="col-md-6 mt-5 mx-auto">
            <form noValidate onSubmit={this.onSubmit}>
              <h1 className="h3 mb-3 font-weight-normal">Register</h1>
              <div className="form-group">
                  {this.state.invalid >0 &&  <Alert color="danger">
                  Your registration is invalid. Please try again!
                </Alert> }
                <label htmlFor="name">Username</label>
                <input
                  type="text"
                  className="form-control"
                  name="username"
                  placeholder="Enter your username"
                  value={this.state.username}
                  onChange={this.onChange}
                  noValidate
                />
                 {this.state.first_submit && this.state.errors.username.length > 0 &&
                <span className='error'>{this.state.errors.username}</span>}
                {this.state.user_taken > 0 &&
                <span className='error'>This username is taken</span>}
              </div>
              <div className="form-group">
                <label htmlFor="name">First name</label>
                <input
                  type="text"
                  className="form-control"
                  name="first_name"
                  placeholder="Enter your first name"
                  value={this.state.first_name}
                  onChange={this.onChange}
                  noValidate
                />
                {this.state.first_submit && this.state.errors.first_name.length > 0 &&
                <span className='error'>{this.state.errors.first_name}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="name">Last name</label>
                <input
                  type="text"
                  className="form-control"
                  name="last_name"
                  placeholder="Enter your last name"
                  value={this.state.last_name}
                  onChange={this.onChange}
                  noValidate
                />
                 {this.state.first_submit && this.state.errors.last_name.length > 0 &&
                <span className='error'>{this.state.errors.last_name}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="name">Gender</label><br></br>
                <input type="radio" name="gender" value="Male" onChange={this.onChange}/> Male<br></br>
                <input type="radio" name="gender" value="Female" onChange={this.onChange}/> Female<br></br>
                <input type="radio" name="gender" value="other" onChange={this.onChange}/> Other
              </div>
                 {this.state.first_submit && this.state.errors.gender.length > 0 &&
                <span className='error'>{this.state.errors.gender}</span>}
              <div className="form-group">
                  <label htmlFor="name">Birth date</label><br></br>
                <DatePicker
                 name="birth_date"
                 selected={this.state.birth_date}
                 onChange={this.handleChange}
                 dateFormat="dd/MM/yyyy"
                 maxDate={new Date()}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  placeholder="Enter email"
                  value={this.state.email}
                  onChange={this.onChange}
                  noValidate
                />
                  {this.state.first_submit && this.state.errors.email.length > 0 &&
                <span className='error'>{this.state.errors.email}</span>}
                 {this.state.email_taken > 0 &&
                <span className='error'>This email is taken</span>}
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  placeholder="Password"
                  value={this.state.password}
                  onChange={this.onChange}
                  noValidate
                />
                  {this.state.first_submit && this.state.errors.password.length > 0 &&
                <span className='error'>{this.state.errors.password}</span>}
              </div>


                <div className="form-group">
                    <label htmlFor="image_file">Profile Picture</label>
                    <br/>
                    <input
                        type="file" name="img" id="pic"
                        onChange={this.onChangeImg}
                        placeholder="Update your profile picture"
                    />
                </div>
                        <img height="200"src={this.state.previmg}  />
         { this.state.previmg!==default_pic_src && <button
                            type="button" onClick={e=>{document.getElementById("pic").value=null;this.onChangeImg(e)}}>delete picture</button>}
                <br></br><br></br><br></br><br></br>



                 <div className="form-group">
                <label htmlFor="with_post">Would you like to post your first trip?</label>
                <input
                  type="checkbox"
                  className="form-control"
                  name="with_post"
                  checked={this.state.with_post}
                  onChange={this.onChange}

                />
              </div>



                {!this.state.with_post && <div><button
                type="submit"
                className="btn btn-lg btn-primary btn-block"
              >
                Register!
                </button></div>}



            </form>
          </div>
        </div>
          {this.state.with_post &&
                <EditPost
                    title={this.state.title}
                    user_id={this.state.current_user}
                    username={this.state.username}
                    city={this.state.city}
                    country={this.state.country}
                    latitude={this.state.latitude}
                    start_d={this.state.start_d}
                    end_d={this.state.end_d}
                    longitude={this.state.longitude}
                    description={this.state.description}
                    errors={this.state.post_errors}
                    onChange={this.onChange}
                    onChangeImg={this.onChangeImgPost}
                    invalid={this.state.invalid}
                    onSubmit={this.onSubmit}
                    first_submit={this.state.first_submit}
                    previmg={this.state.postprevimg}
                    zoom={this.state.zoom}
                    onClick={this.onClick}
                    current_loc_marker={this.state.current_loc_marker}

                />}
          </div>
      </div>
    )
  }
}

export default Register