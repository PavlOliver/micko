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
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('/profile', {withCredentials: true})
            .then(response => {
                if (response.data.username) {
                    setUsername(response.data.username);
                }
            })
            .catch(error => {
                console.error('Error fetching profile data', error);
                navigate('/login');
            });

        axios.get('/profile_picture', {withCredentials: true})
            .then(response => {
                if (response.data) {
                    setProfilePictureUrl(axios.defaults.baseURL + response.data);
                }
            })
            .catch(error => {
                console.error('Error fetching profile picture', error);
            }
        );
    }, [navigate]);

    const handleSave = () => {
        const formData = new FormData();
        formData.append('new_password', password);
        if (profilePicture) {
            formData.append('profile_picture', profilePicture);
        }
        console.log('formData', formData);
        console.log('profilePicture', formData.get('profile_picture'));

        axios.post('/profile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            withCredentials: true
        })
            .then(response => {
                if (response.status === 200) {
                    setEditMode(false);
                    if (response.data.profilePictureUrl) {
                        setProfilePictureUrl(response.data.profilePictureUrl);
                    }
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

    const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProfilePicture(e.target.files[0]);
        }
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSideBarOpen);

    return (
        <Container fluid>
            <Row style={{height: '100vh'}}>
                <Col md={3} className="p-0">
                    <SideBar isOpen={isSideBarOpen} toggleSidebar={toggleSidebar} username={username}/>
                </Col>
                <Col md={9} className="p-4"
                     style={{marginLeft: isSideBarOpen ? '250px' : '60px', transition: 'margin-left 0.3s'}}>
                    <Row>
                        <Col md={6} className="offset-md-3">
                            <Card>
                                <Card.Body>
                                    <Card.Title>Profile</Card.Title>
                                    <Form>
                                        <Form.Group controlId="formProfilePicture">
                                            <Form.Label>Profile Picture</Form.Label>
                                            {profilePictureUrl && <img src={profilePictureUrl} alt="Profile"
                                                                       className="img-thumbnail mb-3"/>}
                                            {editMode && (
                                                <Form.Control type="file" onChange={handleProfilePictureChange}/>
                                            )}
                                        </Form.Group>
                                        <Form.Group controlId="formPassword">
                                            <Form.Label>Username</Form.Label>
                                            <Form.Control type="text" value={username} disabled/>
                                            <Form.Label>Password</Form.Label>
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
                                                <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
                                                <Button variant="primary" onClick={handleSave}>Save</Button>
                                            </div>
                                        ) : (
                                            <Button variant="primary" onClick={() => setEditMode(true)}>
                                                Edit
                                            </Button>
                                        )}
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row className="mt-3">
                        <Col className="text-center">
                            <Button variant="danger" onClick={() => handleLogout()}>Logout</Button>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
};

export default ProfilePage;