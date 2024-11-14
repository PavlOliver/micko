import React, {useEffect, useState} from 'react';
import {Container, Row, Col, Card, Button, Form} from 'react-bootstrap';
import {useNavigate} from "react-router-dom";
import SideBar from './SideBar';
import axios from 'axios';
import {handleLogout} from "../utils/logout";


const ProfilePage: React.FC = () => {
    const [username, setUsername] = useState('Oliver');
    const [password, setPassword] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [isSideBarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('/profile', {withCredentials: true})
            .then(response => {
                if (response.data.username) {
                    setUsername(response.data.username);
                }
            })
            .catch(error => {
                console.error('Error fetching username', error);
                navigate('/login');
            });
    }, [navigate]);

    const handleSave = () => {
        axios.post('/profile', {
            new_password: password,
        })
            .then(response => {
                if (response.status === 200) {
                    setEditMode(false);
                }
            })
            .catch(error => {
                console.error('Error saving profile', error);
            });
        setEditMode(false);
    };

    const handleCancel = () => {
        setEditMode(false);
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSideBarOpen);

    return (
        <Container fluid>
            <Row style={{height: '100vh'}}>
                <Col md={3} className="p-0">
                    <SideBar isOpen={isSideBarOpen} toggleSidebar={toggleSidebar} username={username}/>
                </Col>
                <Col md={9} className="p-4" style={{marginLeft: isSideBarOpen ? '250px' : '60px', transition: 'margin-left 0.3s'}}>
                    <Row>
                        <Col md={6} className="offset-md-3">
                            <Card>
                                <Card.Body>
                                    <Card.Title>Profil</Card.Title>
                                    <Form>
                                        <Form.Group controlId="formPassword">
                                            <p>Meno</p>
                                            <Form.Control type="text" value={username} disabled/>
                                            <Form.Label>Heslo</Form.Label>
                                            {editMode ? (
                                                <Form.Control
                                                    type="password"
                                                    onChange={(e) => setPassword(e.target.value)}
                                                />
                                            ) : (
                                                <Form.Control type="password" value="********" disabled/>
                                            )}
                                        </Form.Group>
                                        {editMode ? (
                                            <div className="d-flex justify-content-between">
                                                <Button variant="secondary" onClick={handleCancel}>Zrušiť</Button>
                                                <Button variant="primary" onClick={handleSave}>Uložiť</Button>
                                            </div>
                                        ) : (
                                            <Button variant="primary" onClick={() => setEditMode(true)}>
                                                Upraviť
                                            </Button>
                                        )}
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row className="mt-3">
                        <Col className="text-center">
                            <Button variant="danger" onClick={() => handleLogout()}>Odhlásiť sa</Button>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
};

export default ProfilePage;