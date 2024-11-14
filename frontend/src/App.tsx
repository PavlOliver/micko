import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Domaca from "./components/Domaca";
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from "./components/Login";
import Profile from "./components/Profile";
import Order from "./components/Order";
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Recept from "./components/Recept";
//import Pacients from "./components/Patients";<Route path={"/patients"} element={<Pacients/>} />

axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.withCredentials = true;

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Domaca/>} />
                <Route path="/home" element={<Domaca/>} />
                <Route path="/login" element={<Login/>} />
                <Route path={"/profile"} element={<Profile/>} />
                <Route path={"/orders"} element={<Order/>} />
                <Route path="/pacient/:id_poistenca/recepty" element={<Recept/>} />

            </Routes>
        </Router>
    );
};

export default App;
