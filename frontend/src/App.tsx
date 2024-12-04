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

axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.withCredentials = true;

// const App: React.FC = () => {
//     return (
//         <UserProvider>
//             <Router>
//                 <Routes>
//                     <Route path="/" element={<Domaca/>} />
//                     <Route path="/home" element={<Domaca/>} />
//                     <Route path="/login" element={<Login/>} />
//                     <Route path={"/profile"} element={<Profile/>} />
//                     <Route path={"/orders"} element={<Order/>} />
//                     <Route path="/pacient/:id_poistenca/recepty" element={<Recept/>} />
//                     <Route path={"/patients"} element={<Patients/>} />
//                     <Route path="/user-management" element={<UserManagement />} />
//                 </Routes>
//             </Router>
//         </UserProvider>
//     );
// };


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
                <Route path={"/patients"} element={<Patients/>}/>
                <Route path="/user-management" element={<UserManagement/>}/>
                <Route path="/staff" element={<Zamestnanci/>}/>
                <Route path="/hospitalization-analysis" element={<HospitalizationAnalysis/>}/>
                <Route path={"/appointment-analysis"} element={<AppointmentAnalysis/>}/>
                <Route path={"/diagnosis-analysis"} element={<DiagnosisAnalysis/>}/>
                <Route path={"/hosp-discharge-analysis"} element={<HospDischargeAnalysis/>}/>
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
