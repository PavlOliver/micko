import React, {useEffect, useState} from 'react';
import {Container, Row, Col, Button, Card, Alert} from 'react-bootstrap';
import SideBar from './SideBar';
import axios from "axios";
import {useNavigate} from 'react-router-dom';

const Home: React.FC = () => {
    const [isSideBarOpen, setIsSidebarOpen] = useState(true);
    const [username, setUsername] = useState('');
    const toggleSidebar = () => setIsSidebarOpen(!isSideBarOpen);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('/home', {withCredentials: true})
            .then(response => {
                if (response.data.username) {
                    setUsername(response.data.username);
                } else if (response.data.error) {
                    console.error('Error fetching username', response.data.error);
                }
            })
            .catch(error => {
                console.error('Error fetching username', error);
                navigate('/login');
            });
    }, [navigate]);

    if (username) {
        return (
            <Container fluid>
                <Row style={{height: '100vh'}}>
                    <Col md={3} className="p-0">
                        <SideBar isOpen={isSideBarOpen} toggleSidebar={toggleSidebar} username={username}/>
                    </Col>
                    <Col md={9} className="p-4"
                         style={{marginLeft: isSideBarOpen ? '250px' : '60px', transition: 'margin-left 0.3s'}}>
                        <Row className="mb-4">
                            <Col>
                                <h1>Vitajte v Nemocničnom Informačnom Systéme</h1>
                                <p>Nemocničný informačný systém poskytuje kompletnú správu pacientov, zamestnancov,
                                    vyšetrení, hospitalizácií a rozvrhov miestností. Zjednodušuje správu nemocnice a
                                    pomáha efektívne organizovať prácu všetkým pracovníkom.</p>
                            </Col>
                        </Row>
                        <Row className="mb-4">
                            <Col>
                                <Alert variant="info">
                                    <strong>Oznam:</strong> Na zajtrajšok sú plánované pravidelné údržbové práce na
                                    systéme medzi 2:00 a 5:00. Systém môže byť dočasne nedostupný.
                                </Alert>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={4}>
                                <Card className="mb-3 shadow-sm">
                                    <Card.Body>
                                        <Card.Title>Pacienti</Card.Title>
                                        <Card.Text>Spravujte údaje o pacientoch, vrátane ich anamnézy, diagnóz a
                                            kontaktov.</Card.Text>
                                        <Button variant="primary" href="/patients">Prejsť na pacientov</Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={4}>
                                <Card className="mb-3 shadow-sm">
                                    <Card.Body>
                                        <Card.Title>Hospitalizácie</Card.Title>
                                        <Card.Text>Prehľad hospitalizácií, aktuálny stav pacientov a záznamy o
                                            liečbe.</Card.Text>
                                        <Button variant="primary" href="/hospitalizations">Prejsť na
                                            hospitalizácie</Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={4}>
                                <Card className="mb-3 shadow-sm">
                                    <Card.Body>
                                        <Card.Title>Vyšetrenia</Card.Title>
                                        <Card.Text>Plánujte a sledujte vyšetrenia pacientov, vrátane objednávok a
                                            výsledkov.</Card.Text>
                                        <Button variant="primary" href="/examinations">Prejsť na vyšetrenia</Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={4}>
                                <Card className="mb-3 shadow-sm">
                                    <Card.Body>
                                        <Card.Title>Zamestnanci</Card.Title>
                                        <Card.Text>Informácie o zamestnancoch vrátane kvalifikácií, služieb a
                                            kontaktov.</Card.Text>
                                        <Button variant="primary" href="/staff">Prejsť na zamestnancov</Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={4}>
                                <Card className="mb-3 shadow-sm">
                                    <Card.Body>
                                        <Card.Title>Rozvrh miestností</Card.Title>
                                        <Card.Text>Kontrola dostupnosti miestností, rezervácie a upravovanie
                                            rozvrhov.</Card.Text>
                                        <Button variant="primary" href="/schedule">Prejsť na rozvrh</Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container>
        );
    } else {
        return null;
    }
};

export default Home;