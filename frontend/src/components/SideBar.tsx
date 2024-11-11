import React, {useState} from 'react';
import {Nav, Button} from 'react-bootstrap';
import {handleLogout} from '../utils/logout';
import axios from 'axios';


interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
    username: string;
}

const SideBar: React.FC<SidebarProps> = ({isOpen, toggleSidebar, username}) => {
    const [showUserOptions, setShowUserOptions] = useState(false);

    const handleMouseEnter = () => {
        if (isOpen) {
            setShowUserOptions(true);
        }
    };

    const handleMouseLeave = () => {
        if (isOpen) {
            setShowUserOptions(false);
        }
    };

    const handleLogout = () => {
        axios.post('/logout')
            .then(response => {
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
                width: isOpen ? '250px' : '60px',
                height: '100vh',
                transition: 'width 0.3s',
                overflow: 'hidden',
                position: 'fixed',
                top: 0,
                left: '10px',
                zIndex: 1000,
            }}
        >
            <Button variant="link" className="text-decoration-none mb-4" onClick={toggleSidebar}>
                <i className={`bi ${isOpen ? "bi-chevron-left" : "bi-list"}`}></i>
            </Button>

            <Nav defaultActiveKey="/home" className="flex-column">
                <Nav.Link href="/home" className={`text-nowrap ${isOpen ? '' : 'text-center'}`}>
                    <i className="bi bi-house"></i>
                    {isOpen && <span className="ms-2">Domov</span>}
                </Nav.Link>
                <Nav.Link href="/patients" className={`text-nowrap ${isOpen ? '' : 'text-center'}`}>
                    <i className="bi bi-person"></i>
                    {isOpen && <span className="ms-2">Pacienti</span>}
                </Nav.Link>
                <Nav.Link href="/hospitalizations" className={`text-nowrap ${isOpen ? '' : 'text-center'}`}>
                    <i className="bi bi-hospital"></i>
                    {isOpen && <span className="ms-2">Hospitalizácie</span>}
                </Nav.Link>
                <Nav.Link href="/examinations" className={`text-nowrap ${isOpen ? '' : 'text-center'}`}>
                    <i className="bi bi-file-earmark-text"></i>
                    {isOpen && <span className="ms-2">Vyšetrenia</span>}
                </Nav.Link>
                <Nav.Link href="/staff" className={`text-nowrap ${isOpen ? '' : 'text-center'}`}>
                    <i className="bi bi-person-check"></i>
                    {isOpen && <span className="ms-2">Zamestnanci</span>}
                </Nav.Link>
                <Nav.Link href="/schedule" className={`text-nowrap ${isOpen ? '' : 'text-center'}`}>
                    <i className="bi bi-calendar"></i>
                    {isOpen && <span className="ms-2">Rozvrh miestností</span>}
                </Nav.Link>
                <Nav.Link href="/patient-appointment" className={`text-nowrap ${isOpen ? '' : 'text-center'}`}>
                    <i className="bi bi-file-earmark-medical"></i>
                    {isOpen && <span className="ms-2">Objednávky</span>}
                </Nav.Link>

                <Nav.Link onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
                          className={`text-nowrap ${isOpen ? '' : 'text-center'}`}>
                    <i className="bi bi-person-circle"></i>
                    {isOpen && <span className="ms-2">{username}</span>}
                    {isOpen && (
                        <i className={`bi ms-2 ${showUserOptions ? 'bi-caret-up-fill' : 'bi-caret-down-fill'}`}
                           style={{transition: 'transform 0.3s ease'}}></i>)}
                </Nav.Link>
                {showUserOptions && (
                    <div className="ms-3" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                        <Nav.Link href="/profile" className={`text-nowrap ${isOpen ? '' : 'text-center'}`}>
                            <i className="bi bi-gear"></i>
                            {isOpen && <span className="ms-2">Detail</span>}
                        </Nav.Link>
                        <Nav.Link
                            className={`text-nowrap ${isOpen ? '' : 'text-center'}`}
                            onClick={handleLogout}>
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
