import React, { Component } from 'react'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css";
import Alert from "reactstrap/es/Alert";
import axios from "axios";
import Map from "./Map";
import L from 'leaflet';
/*
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
}

class TravelPartners extends Component {
  constructor() {
    super()
    this.state = {
      username: '',
      first_name: '',
      last_name: '',
      gender: '',
      birth_date: new Date(),
      email: '',
      password: '',
      errors: {
          username: '',
          email: '',
          password: '',
          first_name: '',
          last_name: '',
          gender: 'Please choose your gender',
      },
      user_taken: 0,
      email_taken: 0,
      invalid: 0
    }

    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  handleChange = date => {
    this.setState({
      birth_date: date
    });
  };
  onChange(e) {
      //  e.preventDefault()
        let errors = this.state.errors;
        const { name, value } = e.target;
        this.setState({ [e.target.name]: e.target.value });

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
              default:
                break;
        }
        this.setState({errors, [name]: value});
  }
  onSubmit(e) {
    e.preventDefault()
    this.setState({invalid: 0});
    this.setState({user_taken: 0});
    this.setState({email_taken: 0});

    const newUser = {
      username: this.state.username,
      first_name: this.state.first_name,
      last_name: this.state.last_name,
      gender: this.state.gender,
      birth_date: this.state.birth_date,
      email: this.state.email,
      password: this.state.password
    }

     if (validateForm(this.state.errors)) {
         register(newUser).then(res => {
             if (res == 'Created') {
                 this.props.history.push(`/login`)
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

  render() {
    return <Map>map</Map>
  }
}


 */

const style = {
  width: "30%",
  height: "100px"
};

class TravelPartners extends Component {
  componentDidMount() {
    // create map
    this.map = L.map('map', {
      center: [49.8419, 24.0315],
      zoom: 16,
      layers: [
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }),
      ]
    });
  }

  render() {
    return <div id="map" style={style} />;
  }
}

export default TravelPartners

