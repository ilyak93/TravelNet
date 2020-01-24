import React, { Component }from "react";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import L from "leaflet";
import SearchField from "react-search-field";
import Select from 'react-select';
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import Button from "react-bootstrap/Button";
import { useAlert } from 'react-alert';
import axios from "axios";
import background from '../connectivity.jpg';


const floatRegEx=
    RegExp("^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$")

const get_posts = newRequest => {
    axios.defaults.withCredentials = true;
  return axios
    .post('http://127.0.0.1:5000/travelpartners', {
      lat: newRequest.lat,
      lng: newRequest.lng,
      radius: newRequest.radius,
      start_date: newRequest.start_date,
      end_date: newRequest.end_date
    })
    .then(response => {
        return response.data
    })
}

const get_followed_posts = () => {
    axios.defaults.withCredentials = true;
  return axios
    .get('http://127.0.0.1:5000/travelpartners')
    .then(response => {
        return response.data
    })
}

const style = {
  width: "75%",
  height: "500px",
  display: "flex",
  marginBottom: "100px",
  marginLeft: "150px",
  marginRight: "0px",
  marginTop: "0px"
};

const style2 = {
  display: "flex",
  width: "100%",
  marginBottom: "0px",
  marginRight: "0px",
  marginLeft: "250px",
  marginTop: "10px"
};

const button_style = {
  display: "block",
  width: "200px",
  border: "none",
  marginLeft: "100px",
  marginTop: "0px",
  padding: "14px 28px",
  fontSize: "16px",
  cursor: "pointer",
  textAlign: "center",
  type: "sumbit",
  value: "Reset"
}

const select_style = {
  width: "200px",
  marginTop: "0px"
}

const options = [
  { value: 'Km', label: 'Km' },
  { value: 'Ml', label: 'Ml' },
];



class TravelPartners extends Component {
  state = {
    pos: null,
    current_position_marker: null,
    travel_posts_of_followed: new Map(),
    travel_posts_layer: null,
    startDate: new Date(),
    endDate: new Date(),
    radius: null,
    selectedOption: null,
    clear: true
  }

  handleChange = selectedOption => {
    this.setState({ selectedOption });
  };

  handleClick = e => {
    this.map.setView(e.latlng, 16);
    if (this.state.clear){
      this.state.pos = e.latlng;
      this.state.current_position_marker = L.marker(this.state.pos).bindPopup('Searched Point', {autoClose:false}).openPopup();
      this.map.addLayer(this.state.current_position_marker);
    }
  this.state.clear = false;
  };

  handlePartnersSearch = (value) => {
    if(!floatRegEx.test(value)){
      alert("Please pick valid radius");
      return;
    }
    if(this.state.travel_posts_layer){
       alert("Please reset and pick a new location");
       return;
    }
    if(this.state.pos == null){
       alert("Please choose a location to search");
       return;
    }
    this.state.radius = value;
    const [lat, lng] = [this.state.pos.lat, this.state.pos.lng] ;
    const searchRequest = {
      lat: lat,
      lng: lng,
      radius: this.state.radius,
      start_date: this.state.startDate,
      end_date: this.state.endDate,
    }
    let travel_posts = [];
    get_posts(searchRequest).then(res => {
      let posts_array = res.posts_array
      for(let post of posts_array){
        if(this.state.travel_posts_of_followed.has(post["id"])){
          continue;
        }
        const latlng = [post["lat"], post["lng"]];
        let new_marker = new L.marker(latlng)//.bindPopup(id, start_date, end_date, distance, name);
        new_marker.on('click', onClick);
        function onClick(e) {
           window.open('/posts/'+post["id"], '_blank', 'toolbar=0,location=0,menubar=0');
        }
        travel_posts.push(new_marker);
      }
      let travel_posts_layer_group = new L.LayerGroup(travel_posts);
      //this.map.removeLayer(this.state.travel_posts_layer);
      this.map.addLayer(travel_posts_layer_group);
      this.state.travel_posts_layer = travel_posts_layer_group;
    })
  };

  handleResetButton = () => {
    if(!this.state.clear) {
      if(this.state.current_position_marker) {
        this.map.removeLayer(this.state.current_position_marker);
        this.state.current_position_marker = null;
        this.state.pos = null;
      }
      if(this.state.travel_posts_layer) {
        this.map.removeLayer(this.state.travel_posts_layer);
        this.state.travel_posts_layer = null;
      }
      this.state.clear = true;
    }
  };

  componentDidMount() {
    // create map
    this.map = L.map("map", {
      center: [49.8419, 24.0315],
      zoom: 5,
      layers: [
        L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png")
      ],
    });
    this.map.on('click', this.handleClick);
    get_followed_posts().then(response => {
      let travel_posts = [];
      let posts_of_followed = response.posts_array;
      for(let post of posts_of_followed){
        const latlng = [post["lat"], post["lng"]];
        let new_marker = new L.marker(latlng)//.bindPopup(id, start_date, end_date, distance, name);
        new_marker.on('click', onClick);
        function onClick(e) {
          window.open('/posts/'+post["id"], '_blank', 'toolbar=0,location=0,menubar=0');
        }
        this.state.travel_posts_of_followed.set(post["id"], new_marker);
        travel_posts.push(new_marker);
      }
      let travel_posts_layer_group = new L.LayerGroup(travel_posts);
      console.log(travel_posts_layer_group);
      //this.map.removeLayer(this.state.travel_posts_layer);
      this.map.addLayer(travel_posts_layer_group);
      //this.state.travel_posts_layer = travel_posts_layer_group;
    })

  }

  render() {
    const { selectedOption } = this.state;
    const { startDate, endDate } = this.state;
    const setStartDate = date => {
      this.setState({ startDate: date });
    };
    const setEndDate = date => {
      this.setState({ endDate: date });
    };
    return <section id = "travelpartners">

      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <div style={style2}>
      <DatePicker
        selected={startDate}
        onSelect={date => setStartDate(date)}
      />
      <DatePicker
        selected={endDate}
        onSelect={date => setEndDate(date)}
      />
      <SearchField
        placeholder="Enter Radius"
        onSearchClick={this.handlePartnersSearch}
        searchText=""
        classNames="test-class"
      />
      <Select
          value={selectedOption}
          options={options}
          onChange={this.handleChange}
        />
       </div>
      <div style={{marginTop: "230px", marginLeft: "250px", backgroundColor: "white", width: "600px"}}>
        Please choose your travel dates and the radius in which you desire to find your travel partners
      </div>
      <div style={button_style}>
        <ButtonToolbar>
          <Button onClick={this.handleResetButton} >Reset Search</Button>
        </ButtonToolbar>
      </div>
      <div id="map" style = {style}/>

      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
    </section>
  }
}

export default TravelPartners;
