import React, {useEffect, useState} from 'react';
import {Container, Row, Col, Card, Button, Form} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom';
import SideBar from './SideBar';
import axios from 'axios';
import {handleLogout} from "../utils/logout";
import '../css/ProfilePage.css';

const ProfilePage: React.FC = () => {
    const [username, setUsername] = useState('Oliver');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [isSideBarOpen, setIsSidebarOpen] = useState(true);
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
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
    }, [navigate]);

    const handleSave = () => {
        if (newPassword !== confirmNewPassword) {
            console.error('New passwords do not match');
            return;
        }

        const formData = new FormData();
        formData.append('old_password', oldPassword);
        formData.append('new_password', newPassword);
        if (profilePicture) {
            formData.append('profile_picture', profilePicture);
        }

        axios.post('/profile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            withCredentials: true
        })
            .then(response => {
                if (response.status === 200) {
                    setEditMode(false);
                }
            })
            .catch(error => {
                console.error('Error saving profile', error);
            });
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
        <Container fluid className="profile-page">
            <Row>
                <Col md={3} className={`p-0 ${isSideBarOpen ? "sidebar-open" : "sidebar-closed"}`}>
                    <SideBar isOpen={isSideBarOpen} toggleSidebar={toggleSidebar} username={username}/>
                </Col>
                <Col md={9} className="p-4 profile-content">
                    <div className="d-flex justify-content-center align-items-center vh-100">
                        <Card className="profile-card shadow">
                            <Card.Body>
                                <div className="text-center mb-4">
                                    <img
                                        src="http://localhost:5000/profile_picture"
                                        alt="Profile"
                                        className="profile-picture"
                                    />
                                </div>
                                <Card.Title className="text-center mb-4">Profile Settings</Card.Title>
                                <Form>
                                    <Form.Group className="mb-3" controlId="formUsername">
                                        <Form.Label>Username</Form.Label>
                                        <Form.Control type="text" value={username} disabled/>
                                    </Form.Group>
                                    {editMode ? (
                                        <>
                                            <Form.Group className="mb-3" controlId="formOldPassword">
                                                <Form.Label>Old Password</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    placeholder="Enter old password"
                                                    onChange={(e) => setOldPassword(e.target.value)}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3" controlId="formNewPassword">
                                                <Form.Label>New Password</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    placeholder="Enter new password"
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3" controlId="formConfirmNewPassword">
                                                <Form.Label>Confirm New Password</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    placeholder="Confirm new password"
                                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3" controlId="formProfilePicture">
                                                <Form.Label>Change Profile Picture</Form.Label>
                                                <Form.Control type="file" onChange={handleProfilePictureChange}/>
                                            </Form.Group>
                                        </>
                                    ) : (
                                        <Form.Group className="mb-3" controlId="formPassword">
                                            <Form.Label>Password</Form.Label>
                                            <Form.Control type="password" value="********" disabled/>
                                        </Form.Group>
                                    )}
                                    <div className="d-flex justify-content-between">
                                        {editMode ? (
                                            <>
                                                <Button variant="secondary" onClick={handleCancel}>
                                                    Cancel
                                                </Button>
                                                <Button variant="primary" onClick={handleSave}>
                                                    Save
                                                </Button>
                                            </>
                                        ) : (
                                            <Button variant="primary" onClick={() => setEditMode(true)}>
                                                Edit Profile
                                            </Button>
                                        )}
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </div>
                    <Row className="mt-4">
                        <Col className="text-center">
                            <Button variant="danger" onClick={() => handleLogout()}>
                                Logout
                            </Button>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
};

export default ProfilePage;