import React, {Component, useState} from 'react'
import jwt_decode from 'jwt-decode'
import moment from "moment";
import axios from "axios";
import Alert from "reactstrap/es/Alert";
import DatePicker from "react-datepicker";
import Button from "reactstrap/es/Button";
import Badge from "react-bootstrap/Badge";
import {Map, Marker, Popup, TileLayer} from "react-leaflet";
import L from "leaflet";
//import {NewPost} from "./NewPost";


const default_pic_src = "http://127.0.0.1:5000/static/pictures/default_post.jpeg";

const updatePost = (newPost) =>{
    console.log(newPost);
    axios.defaults.withCredentials = true;
    return axios.put('http://127.0.0.1:5000/post/' + newPost.id,newPost).then(request=>{return request.data})
}



const validateForm = (errors) => {
  let valid = true;
  Object.values(errors).forEach(
    (val) => val.length > 0 && (valid = false)
  );
  return valid;
};

function onsubmit(e){
    e.preventDefault();
   // return submitPost();
}

export function EditPost(props){
    const [start,updatestart] = useState(props.start_d);
    const [end,updateend] = useState(props.end_d);
    const position = [props.latitude,props.longitude];
    return(

        <div className="row">
          <div className="col-md-6 mt-5 mx-auto">
            <form noValidate onSubmit={e=>{props.onSubmit(e,start,end)}}>
              <h1 className="h3 mb-3 font-weight-normal">Your post</h1>//
                <div className="form-group">
                  {props.invalid >0 &&  <Alert color="danger">
                  Your post is invalid. Please try again!
                </Alert> }
                <label htmlFor="name">Title</label>
                  <input
                  type="text"
                  className="form-control"
                  name="title"
                  placeholder="title"
                  value={props.title}
                  onChange={props.onChange}
                  noValidate
                />
                 {props.first_submit && props.errors.title.length > 0 &&
                <span className='error'>{props.errors.title}</span>}
              </div>
              <div className="form-group">
                  <label htmlFor="name">Starts in</label><br></br>
                <DatePicker
                 name="start_d"
                 selected={start}
                 onChange={date=>updatestart(date)}
                 dateFormat="dd/MM/yyyy"
                 minDate={new Date()}
                 //maxDate={this.state.end_d}
                 inline
                 selectsStart
                 startDate={start}
                 endDate={end}
                />
              </div>
              <div className="form-group">
                  <label htmlFor="name">Ends in</label><br></br>

                 {props.first_submit && props.errors.dates.length > 0 &&
                <span className='error'>{props.errors.dates}</span>}
                <DatePicker
                 name="end_d"
                 selected={end}
                 onChange={date=>updateend(date)}

                 dateFormat="dd/MM/yyyy"
                 inline
                 minDate={start}
                 selectsEnd
                 startDate={start}
                 endDate={end}
                />
              </div>
                <div className="form-group">
                <label htmlFor="name">latitude</label>
                <input id="lat"
                  type="number"
                  step="0.01"
                  className="form-control"
                  name="latitude"
                  placeholder="latitude"
                  value={props.latitude}
                  onChange={props.onChange}
                  noValidate
                />
              </div>
                <div className="form-group">
                <label htmlFor="name">longitude</label>
                <input id="lng"
                  type="number"
                  step="0.01"
                  className="form-control"
                  name="longitude"
                  placeholder="longitude"
                  value={props.longitude}
                  onChange={props.onChange}
                  noValidate
                />
                <div>
                <Map center={position} zoom={5} style={{height: "400px", width: "100%"}} onClick={props.onClick}>
                    <TileLayer
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
                    />
                     {
            props.current_loc_marker.map((position, idx) =>
                <Marker key={`marker-${idx}`} position={position}>
                    <Popup>
                        <span>Current Post Location</span>
                    </Popup>
                </Marker>
            )
        }
                </Map>
                    </div>
              </div>
                <div className="form-group">
                <label htmlFor="name">City</label>
                <input
                  type="text"
                  className="form-control"
                  name="city"
                  placeholder="city"
                  value={props.city}
                  onChange={props.onChange}
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
                  value={props.country}
                  onChange={props.onChange}
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
                  value={props.comment}
                  onChange={props.onChange}
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
                  value={props.description}
                  onChange={props.onChange}
                  noValidate
                />
              </div>


                <div className="form-group">
                    <label htmlFor="image_file">Post Picture</label>
                    <br/>
                    <input
                        type="file" name="img" id="postpic"
                        onChange={props.onChangeImg}
                        placeholder="Update your profile picture"
                    />
                </div>
                        <img height="200" src={props.previmg}  />
         { props.previmg !== default_pic_src && <button
                            type="button" onClick={e=>{document.getElementById("postpic").value=null;props.onChangeImg(e)}}>delete picture</button>}


              <button
                type="submit"
                className="btn btn-lg btn-primary btn-block"
              >
                Done!
              </button>*/
            </form>
          </div>
        </div>

  );
}



const map_style = {
    height: '300px',
    width: '60%',
    margin:"auto",
    border:"2px solid black"
}


function PostInfo(props){
    const position = [props.latitude,props.longitude];
  return (
     <div className="text-center">






                <div  style={{width:"100%",height:"100%",margin:"auto" }}>
                    <h1 className="h3 mb-3 font-weight-normal">{props.title}</h1>
              <img className="rounded account-img justify-content-center" src={"http://127.0.0.1:5000"+props.image_file+"?"+new Date().toString()} height={"100%"} width={"100%"}/>

          </div>
                <br/><br/><br/><br/>
                <table className="table col-md-6 mx-auto">
            <tbody>
              <tr>
                <td><b>Username</b></td>
                <td>{props.username}</td>
              </tr>
            <tr>
                <td><b>Starts in</b></td>
                <td>{moment(props.start_d).format("LL")}</td>
              </tr>
            <tr>
                <td><b>Ends in</b></td>
                <td>{moment(props.end_d).format("LL")}</td>
              </tr>
            <tr>
                <td><b>City</b></td>
                <td>{props.city}</td>
              </tr>
            <tr>
                <td><b>Country</b></td>
                <td>{props.country}</td>
              </tr>
            </tbody>
          </table>

                    <br/><br/><br/><br/>
                <Map center={position} zoom={5} style={map_style} >
                    <TileLayer
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
                    />
                    {props.current_loc_marker}
                    {
            props.current_loc_marker.map((position, idx) =>

                <Marker key={`marker-${idx}`} position={position}>
                    <Popup>
                        <span>Current Post Location</span>
                    </Popup>
                </Marker>
            )
        }
                </Map>
                    <br/><br/><br/><br/>

                {props.description}

 <br></br><br></br>
         <br></br><br></br>

</div>

  );
}


export class Post extends Component {
  constructor() {
    super();
    this.state = {
        current_loc_marker: [],
        zoom: 5,
        current_user: 0,
        id:0,
        username:'',
        title:'',
        date_posted:'',
        start_d:new Date(),
        end_d:new Date(),
        country:'',
        city:'',
        latitude:0,
        longitude:0,
        description:'',
        user_id:0,
        comment:'',
        image_file:'',
      errors: {
          title:"",
          dates:""
      },
      user_taken: 0,
      email_taken: 0,
      invalid: 0,
      flag: true,
        is_subscribed:false,
        first_submit:false,
        file:null,
        previmg:default_pic_src,
        img_loading:0,

    };

    this.onChange = this.onChange.bind(this);
     this.onChangeImg = this.onChangeImg.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
     this.onClick = this.onClick.bind(this);

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
  componentWillReceiveProps(){
    this.componentDidMount()
  }
  componentDidMount() {
      const token = localStorage.usertoken;
      if (token) {
          const decoded = jwt_decode(token);
          this.setState({current_user: decoded.identity.id});
      }
      axios.defaults.withCredentials = true;
      axios.get("http://127.0.0.1:5000/post/" + this.props.match.params.id).then(response => {
              for (let i in response.data) {
                  if (i === "start_d" || i === "end_d") {
                      response.data[i] = new Date(response.data[i])
                  }
                  this.setState({[i]: response.data[i]},()=>{if(i === "image_file"){this.setState({previmg:"http://127.0.0.1:5000"+response.data[i]})}});
                  const pos = new L.latLng([response.data.latitude,response.data.longitude]);
                  if(!this.state.current_loc_marker.length){this.state.current_loc_marker.push(pos);}
                  this.setState({current_loc_marker : this.state.current_loc_marker})
              }
          }
      );
              axios.get("http://127.0.0.1:5000/is_subscribed/"+this.props.match.params.id)
                  .then(response=>{const res = response.data ==='True';
                      this.setState({is_subscribed:res})}
                      )
      console.log(this.props.match.params.id);
  }




  onChangeImg = e=> {
      e.preventDefault();
      this.setState({img_loading:1});
       console.log(e.target.files);
       if(!e.target.files ){
           this.setState({file:null, previmg:default_pic_src });
       }
       else{
    this.setState({file:e.target.files[0]},()=>{
        let reader=new FileReader();
        reader.onloadend = e=>{this.setState({previmg:reader.result})};
        reader.readAsDataURL(this.state.file);
    });

  }}



  uploadImg(post_id) {
      let img = this.state.file;
      const token = localStorage.usertoken;
      const decoded = jwt_decode(token);

      axios.defaults.withCredentials = true;
      if (img) {
          return axios
              .post("http://127.0.0.1:5000/image/post/" + post_id, img, {headers: {'content-type': 'image/png'}})
              .then(res => {
                      return res.data.image_file;
                  }
              ).catch(err => {

              })
      }
      else{
          return axios.delete("http://127.0.0.1:5000/image/post/" + post_id).then(res=>{return res;})
      }
  }

  onSubmit(e,start,end) {

      e.preventDefault();
      this.setState({first_submit:true});
      this.setState({invalid: 0});
      this.setState({user_taken: 0});
      this.setState({email_taken: 0});

      this.state.errors.dates = start > end ? "start date is later than end" : "" ;

      const newPost = {
          title: this.state.title,
          start_date: start,
          end_date: end,
          latitude: parseFloat(this.state.latitude),
          longitude: parseFloat(this.state.longitude),
          content: this.state.description,
          city: this.state.city,
          country: this.state.country,
          comment: this.state.comment,
          id:this.props.match.params.id
      };

      if (validateForm(this.state.errors)) {
          updatePost(newPost).then(res => {
              if (res === 'Updated') {
                 if(this.state.img_loading){this.uploadImg(this.props.match.params.id)}
                     this.props.history.push('/users/'+jwt_decode(localStorage.getItem('usertoken')).identity.id)
              }
          })
      } else {
          this.setState({invalid: 1});/**/
      }
  }
  edit_post(){
      this.setState({flag:false})
  }
  onChange(e){

        const { name, value } = e.target;


        switch (name) {
            case 'title':

                this.state.errors.title =
                  value.length < 1 || value.length > 20
                    ? 'Title is not valid!'
                    : '';
                break;
              default:
                break;
        }
        this.setState({[name]: value});
  }


  deletePicture(){
      axios.defaults.withCredentials = true;
      axios
        .delete("http://127.0.0.1:5000/image/post/")
        .then(res =>
            {}
            )
      console.log("pic deleted");
  }

  subscribe = () =>{
      axios.defaults.withCredentials= true;
      axios.post("http://127.0.0.1:5000/subscribe/"+this.props.match.params.id).then(res=>this.setState({is_subscribed:true})).catch(err=>console.log(err))
  };
  unSubscribe = () =>{
      axios.defaults.withCredentials = true;

      axios.delete("http://127.0.0.1:5000/subscribe/"+this.props.match.params.id).then(res=>this.setState({is_subscribed:false})).catch(err=>console.log(err))
  };
  delete_post(){
      axios.defaults.withCredentials = true;
      axios.delete("http://127.0.0.1:5000/post/"+this.props.match.params.id).then(res=>{
          if (res.data == "Deleted")  this.props.history.push('/');
      }).catch(err=>console.log (err))
  }
    render() {
        return (<div className="jumbotron mt-1">
            <div><br></br><br></br>

                {
                    (this.state.current_user != this.state.user_id) && <p className="m-md-4" align="center">
                        <Button variant="outline-primary"
                                onClick={this.state.is_subscribed ? this.unSubscribe.bind(this) : this.subscribe.bind(this)}
                        >
                            {this.state.is_subscribed ? 'Stop subscription' : 'Subscribe'}
                </Button> </p>}
                {(this.state.current_user == this.state.user_id) && this.state.flag &&
                  <p className="m-md-4" align="center">
                <Button className="my-3" color="info" onClick={this.edit_post.bind(this)}>
                    Edit Post</Button>

                <Button className="my-3" color="danger" onClick={this.delete_post.bind(this)}>
                    Delete Post</Button>
                  </p>}

                {this.state.flag &&
                <PostInfo
                    title={this.state.title}
                    username={this.state.username}
                    start_d={this.state.start_d}
                    end_d={this.state.end_d}
                    description={this.state.description}
                    city={this.state.city}
                    country={this.state.country}
                    image_file={this.state.image_file}
                    longitude={this.state.longitude}
                    latitude={this.state.latitude}
                    current_loc_marker={this.state.current_loc_marker}
                />}


                {!this.state.flag &&
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
                    comment={this.state.comment}
                    onChange={this.onChange}
                    //handlechange={this.changeDate}
                    onSubmit={this.onSubmit}
                    zoom={this.state.zoom}
                    onClick={this.onClick}
                    current_loc_marker={this.state.current_loc_marker}
                    invalid={this.state.invalid}
                    //user_taken={this.state.user_taken}
                    //email_taken={this.state.email_taken}
                    flag={this.state.flag}
                    errors={this.state.errors}
                    // toggleUpdate={this.toggleUpdate}
                    onChangeImg={this.onChangeImg}
                    previmg={this.state.previmg }
                    deletepicture={this.deletePicture}
                />}

          </div>
            </div>
        )
      }
    }
export default Post