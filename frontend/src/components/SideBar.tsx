import React, {useState} from 'react';
import {Nav, Button} from 'react-bootstrap';
import axios from 'axios';
import {useUser} from '../context/UserContext';
import '../css/SideBar.css';

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
    username: string;
}

const SideBar: React.FC<SidebarProps> = ({isOpen, toggleSidebar, username}) => {
    const [showUserOptions, setShowUserOptions] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const {currentUser, setCurrentUser} = useUser();

    const handleStatsClick = () => {
        if (isOpen) setShowStats(!showStats);
    };

    const handleUserOptionsClick = () => {
        if (isOpen) setShowUserOptions(!showUserOptions);
    };

    const handleLogout = () => {
        axios.post('/logout')
            .then(response => {
                setCurrentUser(null);
                window.location.href = '/login';
            })
            .catch(error => {
                console.error('There was an error logging out!', error);
            });
    };

    return (
        <div
            className={`bg-light p-3 shadow`}
            style={{
                height: '100vh',
                transition: 'width 0.3s',
                overflow: 'hidden',
                position: 'fixed',
                top: 0,
                zIndex: 1000,
            }}
        >
            <Button variant="link" className="text-decoration-none mb-4" onClick={toggleSidebar}>
                <i className={`bi ${isOpen ? "bi-chevron-left" : "bi-list"}`}></i>
            </Button>

            <Nav defaultActiveKey="/home" className="flex-column px-0">
                <Nav.Link href="/home" className={`nav-link-button ${isOpen ? '' : 'text-center'}`}>
                    <i className="bi bi-house"></i>
                    {isOpen && <span className="ms-2">Domov</span>}
                </Nav.Link>
                <Nav.Link href="/patients" className={`nav-link-button ${isOpen ? '' : 'text-center'}`}>
                    <i className="bi bi-person"></i>
                    {isOpen && <span className="ms-2">Pacienti</span>}
                </Nav.Link>
                <Nav.Link href="/hospitalizations" className={`nav-link-button ${isOpen ? '' : 'text-center'}`}>
                    <i className="bi bi-hospital"></i>
                    {isOpen && <span className="ms-2">Hospitalizácie</span>}
                </Nav.Link>
                <Nav.Link href="/examinations" className={`nav-link-button ${isOpen ? '' : 'text-center'}`}>
                    <i className="bi bi-file-earmark-text"></i>
                    {isOpen && <span className="ms-2">Vyšetrenia</span>}
                </Nav.Link>
                <Nav.Link href="/staff" className={`nav-link-button ${isOpen ? '' : 'text-center'}`}>
                    <i className="bi bi-person-check"></i>
                    {isOpen && <span className="ms-2">Zamestnanci</span>}
                </Nav.Link>
                <Nav.Link href="/schedule" className={`nav-link-button ${isOpen ? '' : 'text-center'}`}>
                    <i className="bi bi-calendar"></i>
                    {isOpen && <span className="ms-2">Rozvrh miestností</span>}
                </Nav.Link>
                <Nav.Link href="/orders" className={`nav-link-button ${isOpen ? '' : 'text-center'}`}>
                    <i className="bi bi-file-earmark-medical"></i>
                    {isOpen && <span className="ms-2">Objednávky</span>}
                </Nav.Link>
                <Nav.Link onClick={handleStatsClick} className={`nav-link-button ${isOpen ? '' : 'text-center'}`}>
                    <i className="bi bi-person-circle"></i>
                    {isOpen && <span className="ms-2">Analýza</span>}
                    {isOpen && (
                        <i className={`bi ms-2 ${showStats ? 'bi-caret-up-fill' : 'bi-caret-down-fill'}`}
                           style={{transition: 'transform 0.3s ease'}}></i>)}
                </Nav.Link>
                {showStats && (
                    <div className="ms-3">
                        <Nav.Link href="/hospitalization-analysis"
                                  className={`nav-link-button ${isOpen ? '' : 'text-center'}`}>
                            <i className="bi bi-house"></i>
                            {isOpen && <span className="ms-2">Hospitalizácia</span>}
                        </Nav.Link>
                        <Nav.Link href="/appointment-analysis"
                                  className={`nav-link-button ${isOpen ? '' : 'text-center'}`}>
                            <i className="bi bi-calendar"></i>
                            {isOpen && <span className="ms-2">Objednávky</span>}
                        </Nav.Link>
                        <Nav.Link href="/diagnosis-analysis"
                                  className={`nav-link-button ${isOpen ? '' : 'text-center'}`}>
                            <i className="bi bi-file-earmark-medical"></i>
                            {isOpen && <span className="ms-2">Diagnózy</span>}
                        </Nav.Link>
                        <Nav.Link href="/hosp-discharge-analysis"
                                  className={`nav-link-button ${isOpen ? '' : 'text-center'}`}>
                            <i className="bi bi-file-earmark-medical"></i>
                            {isOpen && <span className="ms-2">Prijatý a Prepustený</span>}
                        </Nav.Link>
                        <Nav.Link href="/predpisane_recepty_mesiac"
                                  className={`nav-link-button ${isOpen ? '' : 'text-center'}`}>
                            <i className="bi bi-file-earmark-medical"></i>
                            {isOpen && <span className="ms-2">ReceptyNarast</span>}
                        </Nav.Link>
                        <Nav.Link href="/trendy_novych_pacientov"
                                  className={`nav-link-button ${isOpen ? '' : 'text-center'}`}>
                            <i className="bi bi-file-earmark-medical"></i>
                            {isOpen && <span className="ms-2">Trendy novych pacientov</span>}
                        </Nav.Link>
                        <Nav.Link href="/specializacie_podla_roku"
                                  className={`nav-link-button ${isOpen ? '' : 'text-center'}`}>
                            <i className="bi bi-file-earmark-medical"></i>
                            {isOpen && <span className="ms-2">Specializacie podla roku</span>}
                        </Nav.Link>
                        <Nav.Link href="/vek-skupina"
                                  className={`nav-link-button ${isOpen ? '' : 'text-center'}`}>
                            <i className="bi bi-file-earmark-medical"></i>
                            {isOpen && <span className="ms-2">Vek-Skupiny</span>}
                        </Nav.Link>

                    </div>
                )}

                {currentUser?.rola === 'A' && (
                    <Nav.Link href="/user-management" className={`nav-link-button ${isOpen ? '' : 'text-center'}`}>
                        <i className="bi bi-person-check"></i>
                        {isOpen && <span className="ms-2">Správa používateľov</span>}
                    </Nav.Link>
                )}

                <Nav.Link onClick={handleUserOptionsClick} className={`nav-link-button ${isOpen ? '' : 'text-center'}`}>
                    <i className="bi bi-person-circle"></i>
                    {isOpen && <span className="ms-2">{username}</span>}
                    {isOpen && (
                        <i className={`bi ms-2 ${showUserOptions ? 'bi-caret-up-fill' : 'bi-caret-down-fill'}`}
                           style={{transition: 'transform 0.3s ease'}}></i>)}
                </Nav.Link>
                {showUserOptions && (
                    <div className="ms-3">
                        <Nav.Link href="/profile" className={`nav-link-button ${isOpen ? '' : 'text-center'}`}>
                            <i className="bi bi-gear"></i>
                            {isOpen && <span className="ms-2">Detail</span>}
                        </Nav.Link>
                        <Nav.Link className={`nav-link-button ${isOpen ? '' : 'text-center'}`} onClick={handleLogout}>
                            <i className="bi bi-box-arrow-right"></i>
                            {isOpen && <span className="ms-2">Odhlásiť</span>}
                        </Nav.Link>
                    </div>
                )}
            </Nav>
        </div>
    );
};

export default SideBar;