import React, { Component } from 'react'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css";
import Alert from "reactstrap/es/Alert";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { Map, TileLayer, Marker, Popup } from "react-leaflet";


const default_pic_src = "http://127.0.0.1:5000/static/pictures/default_post.jpeg";
export const submitPost = newPost => {

    axios.defaults.withCredentials = true;
  return axios
    .post('http://127.0.0.1:5000/posts/new', newPost)
    .then(response => {
        return response.data
    });
}


const validateForm = (errors) => {
  let valid = true;
  Object.values(errors).forEach(
    (val) => val.length > 0 && (valid = false)
  );
  return valid;
};

const map_style = {
    height: '300px',
    width: '100%'
}

export class NewPost extends Component {
    constructor() {
    super();
    this.state = {
        current_loc_marker: [],
        zoom:2 ,
        current_user:0,
        username: '',
        title:'',
        start_d:new Date(),
        end_d:new Date(),
        country:'',
        city:'',
        latitude:0,
        longitude:0,
        description:'',
        comment:'',
        errors: {
            title: '',
            dates:'',
        },
        invalid: 0,
        title_changed:0,
        post_id:0,
        previmg:default_pic_src,
        file:null
    }

    this.onChange = this.onChange.bind(this)
      this.onChangeImg = this.onChangeImg.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
      this.uploadImg = this.uploadImg.bind(this);
  }
  componentDidMount() {

         const token = localStorage.usertoken;
          if (token) {

              const decoded = jwt_decode(token);

              this.setState({
                  current_user: decoded.identity.id
              });
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
  uploadImg(post_id){
      let img = this.state.file;
      const token = localStorage.usertoken;
      const decoded = jwt_decode(token);

      axios.defaults.withCredentials = true;
      return axios
        .post("http://127.0.0.1:5000/image/post/" + post_id, img,{headers:{'content-type': 'image/png'}})
        .then(res =>
            {return res.data.image_file;}
            ).catch(err=>{console.log(err)})
  }


  onChange(e) {
      //  e.preventDefault()
        const { name, value } = e.target;
        this.setState({ [e.target.name]: e.target.value });

        switch (name) {
            case 'title':
                this.setState({title_changed: 1});
                this.state.errors.title =
                  value.length < 1 || value.length > 20
                    ? 'Title is not valid!'
                    : '';
                break;
            case 'latitude':
                this.onClick({latlng: {lat: value, lng: this.state.longitude}});
                break;
            case 'longitude':
                this.onClick({latlng: {lat: this.state.latitude, lng: value}});
                break;
            default:
                break;
        }
        this.setState({[name]: value});
  }
  onSubmit(e) {
    e.preventDefault();
    this.setState({invalid: 0});
    this.setState({user_taken: 0});
    this.setState({email_taken: 0});
    if(!this.state.title_changed){this.state.errors.title ="title cannot be empty"}
    const newPost = {

      user_id: this.state.current_user,
      title:this.state.title,
      start_d:this.state.start_d,
      end_d:this.state.end_d,
        latitude:parseFloat(this.state.latitude),
        longitude:parseFloat(this.state.longitude),
        description:this.state.description,
        city:this.state.city,
        country:this.state.country,
        comment:this.state.comment

    };

     if (validateForm(this.state.errors)) {
         submitPost(newPost).then(res => {
                 if(this.state.file){this.uploadImg(res).then(this.props.history.push('/'))}
                 this.props.history.push('/')
         })
     }
     else{
         this.setState({invalid: 1});/**/
     }
  }

    onClick = (e) => {
        const {current_loc_marker} = this.state
        current_loc_marker.pop();
        current_loc_marker.push(e.latlng);
        this.setState({current_loc_marker});
        //document.getElementById('lat').value = e.latlng.lat
        //document.getElementById('lng').value = e.latlng.lng
        this.setState({latitude:e.latlng.lat,longitude:e.latlng.lng})
  }

  render() {
      const position = [this.state.latitude, this.state.longitude]
    return (
      <div className="container">
           <div className="jumbotron mt-1 " style={{width:"90%" ,margin:"auto",backgroundColor:"rgba(100,100,100,0.6)"}}>
        <div className="row">
          <div className="col-md-6 mt-5 mx-auto">
            <form noValidate onSubmit={this.onSubmit}>
              <h1 className="h3 mb-3 font-weight-normal">New post</h1>
              <div className="form-group">
                  {this.state.invalid >0 &&  <Alert color="danger">
                  Your post is invalid. Please try again!
                </Alert> }
                <label htmlFor="name">Title</label>
                  <input
                  type="text"
                  className="form-control"
                  name="title"
                  placeholder="title"
                  value={this.state.title}
                  onChange={this.onChange}
                  noValidate
                />
                 {this.state.errors.title.length > 0 &&
                <Alert color="danger" className='error'>{this.state.errors.title}</Alert>}
              </div>
              <div className="form-group">
                  <label htmlFor="name">Starts in</label><br></br>
                <DatePicker
                 name="start_d"
                 selected={this.state.start_d}
                 onChange={date=>this.setState({start_d:date})}
                 dateFormat="dd/MM/yyyy"
                 minDate={new Date()}
                 //maxDate={this.state.end_d}
                 inline
                 selectsStart
                 startDate={this.state.start_d}
                 endDate={this.state.end_d}
                />
              </div>
                 {this.state.errors.dates.length > 0 &&
                <Alert className='error'>{this.state.errors.dates}</Alert>}
              <div className="form-group">
                  <label htmlFor="name">Ends in</label><br></br>
                <DatePicker
                 name="end_d"
                 selected={this.state.end_d}
                 onChange={date=>this.setState({end_d:date})}
                 dateFormat="dd/MM/yyyy"
                 inline
                 minDate={this.state.start_d}
                 selectsEnd
                 startDate={this.state.start_d}
                 endDate={this.state.end_d}
                />
              </div>
                <div className="form-group">
                <label htmlFor="name">latitude</label>
                <input id = "lat"
                  type="number"
                  step="0.01"
                  className="form-control"
                  name="latitude"
                  placeholder="latitude"
                  value={this.state.latitude}
                  onChange={this.onChange}
                  noValidate
                />
              </div>
                <div className="form-group">
                <label htmlFor="name">longitude</label>
                <input id = "lng"
                  type="number"
                  step="0.01"
                  className="form-control"
                  name="longitude"
                  placeholder="longitude"
                  value={this.state.longitude}
                  onChange={this.onChange}
                  noValidate
                />
                <Map center={position} zoom={this.state.zoom} onClick={this.onClick} style={map_style}>
                     <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
        />
        {
            this.state.current_loc_marker.map((position, idx) =>
                <Marker key={`marker-${idx}`} position={position}>
                    <Popup>
                        <span>Current Post Location</span>
                    </Popup>
                </Marker>
            )
        }
                </Map>
                </div>
                <div className="form-group">
                <label htmlFor="name">City</label>
                <input
                  type="text"
                  className="form-control"
                  name="city"
                  placeholder="city"
                  value={this.state.city}
                  onChange={this.onChange}
                  noValidate
                />

              </div>

                <div className="form-group">
                <label htmlFor="name">Country</label>
                <input
                  type="text"
                  className="form-control"
                  name="country"
                  placeholder="country"
                  value={this.state.country}
                  onChange={this.onChange}
                  noValidate
                />
              </div>
                <div className="form-group">
                <label htmlFor="name">Comments</label>
                <input
                  type="text"
                  className="form-control"
                  name="comment"
                  placeholder="will show on feed only. tag with #{username}"
                  value={this.state.comment}
                  onChange={this.onChange}
                  noValidate
                />
              </div>
                <div className="form-group">
                <label htmlFor="name">Description</label>
                <textarea
                  style={{height:'200px'}}
                  type="text"
                  className="form-control"
                  name="description"
                  placeholder=""
                  value={this.state.description}
                  onChange={this.onChange}
                  noValidate
                />
              </div>
                <div className="form-group">
                    <label htmlFor="image_file">Post picture</label>
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




              <button
                type="submit"
                className="btn btn-lg btn-primary btn-block"
              >
                Post
              </button>
            </form>
          </div>
        </div>
        </div>
      </div>
    )
  }
}

export default NewPost;