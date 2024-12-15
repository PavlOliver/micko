import React from "react";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import {useEffect} from 'react';
import {UserProvider, useUser} from './context/UserContext';
import Domaca from "./components/Domaca";
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from "./components/Login";
import Profile from "./components/Profile";
import Order from "./components/Order";
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Recept from "./components/Recept";
import Patients from "./components/Patients";
import UserManagement from './components/AdminPage';
import ZdravotnaKarta from "./components/ZdravotnaKarta";
import Zaznam from "./components/Zaznam";
import Zamestnanci from "./components/Zamestnanci";
import HospitalizationAnalysis from "./components/HospitalizationAnalysis";
import AppointmentAnalysis from "./components/AppointmentAnalysis";
import DiagnosisAnalysis from "./components/DiagnosisAnalysis";
import HospDischargeAnalysis from "./components/HospDischageAnalysis";
import ReceptyZaMesiac from "./components/ReceptyZaMesiac";
import TrendyNovychPacientov from "./components/TrendyNovychPacientov";
import SpecializaciePodlaRoku from "./components/SpecializaciePodlaRoku";
import VekoveSkupiny from "./components/VekSkupiny";
import ShiftAnalysis from "./components/ShiftAnalysis";
import RoomAnalysis from "./components/RoomAnalysis";
import ReceptyMonthly from "./components/ReceptyMonthly";
import ReceptyDoktor from "./components/ReceptyDoktor";
import Hospitalizacia from "./components/Hospitalizacia";
import SkladLiekov from './components/SkladLiekov';

axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.withCredentials = true;

function AppContent() {
    const {setCurrentUser} = useUser();

    useEffect(() => {
        axios.get('/home', {withCredentials: true})
            .then(response => {
                if (response.data.username) {
                    axios.get('/user-role', {withCredentials: true})
                        .then(roleResponse => {
                            setCurrentUser({
                                login: response.data.username,
                                rola: roleResponse.data.rola
                            });
                        });
                }
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
            });
    }, [setCurrentUser]);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Domaca/>}/>
                <Route path="/home" element={<Domaca/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path={"/profile"} element={<Profile/>}/>
                <Route path={"/orders"} element={<Order/>}/>
                <Route path="/pacient/:id_poistenca/recepty" element={<Recept/>}/>
                <Route path="/pacient/:id_poistenca/zdravotna_karta" element={<ZdravotnaKarta/>}/>
                <Route path="/pacient/:id_poistenca/zaznam" element={<Zaznam/>}/>
                <Route path="/pacient/:id_poistenca/zaznam/:id_zaznamu" element={<Zaznam/>}/>
                <Route path="/pacient/:id_poistenca/hospitalizacia" element={<Hospitalizacia/>}/>
                <Route path={"/patients"} element={<Patients/>}/>
                <Route path="/user-management" element={<UserManagement/>}/>
                <Route path="/staff" element={<Zamestnanci/>}/>


                <Route path="/hospitalization-analysis" element={<HospitalizationAnalysis/>}/>
                <Route path={"/appointment-analysis"} element={<AppointmentAnalysis/>}/>
                <Route path={"/diagnosis-analysis"} element={<DiagnosisAnalysis/>}/>
                <Route path={"/hosp-discharge-analysis"} element={<HospDischargeAnalysis/>}/>
                <Route path="/predpisane_recepty_mesiac"  element={<ReceptyZaMesiac/>}/>
                <Route path={"/trendy_novych_pacientov"} element={<TrendyNovychPacientov/>}/>
                <Route path={"/specializacie_podla_roku"} element={<SpecializaciePodlaRoku/>}/>
                <Route path="/vek-skupina" element={<VekoveSkupiny/>}/>
                <Route path={"/shift-analysis"} element={<ShiftAnalysis/>}/>
                <Route path={"/room-analysis"} element={<RoomAnalysis/>}/>
                <Route path={"/monthly-prescription-analysis"} element={<ReceptyMonthly/>}/>
                <Route path={"/doctor-prescription-analysis"} element={<ReceptyDoktor/>}/>
                <Route path="/sklad-liekov" element={<SkladLiekov />} />
            </Routes>
        </Router>
    );
}

function App() {
    return (
        <UserProvider>
            <AppContent/>
        </UserProvider>
    );
}

export default App;
