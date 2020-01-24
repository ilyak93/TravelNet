import React, { Component } from 'react'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css";
import Alert from "reactstrap/es/Alert";
import axios from "axios";
import {EditPost} from "./Post";
import jwt_decode from "jwt-decode";
import {Users} from "./Users";


export class Search extends Component {
    constructor() {
        super();
        this.state = {
            users: []
        }
    }

        render(){
            return (
                <Users type={3} searchfor={this.props.match.params.searchfor}/>
            )
        }
    }
export default Search