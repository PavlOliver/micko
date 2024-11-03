import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Domaca from "./components/Domaca";
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from "./components/Login";
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.withCredentials = true;

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home/>} />
                <Route path="/home" element={<Domaca/>} />
                <Route path="/login" element={<Login/>} />
            </Routes>
        </Router>
    );
};

export default App;
