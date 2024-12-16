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
                <Row>
                    <Col md={isSideBarOpen ? 2 : 1} className="p-0">
                        <SideBar isOpen={isSideBarOpen} toggleSidebar={toggleSidebar} username={username}/>
                    </Col>
                    <Col md={isSideBarOpen ? 10 : 11} className="content-column">
                        <Row className="mb-4">
                            <Col className="mt-3">
                                <h1>Vitajte v Nemocničnom Informačnom Systéme</h1>
                                <p className="mt-5">Nemocničný informačný systém poskytuje kompletnú správu pacientov,
                                    zamestnancov,
                                    vyšetrení, hospitalizácií a rozvrhov lekárov. Zjednodušuje správu nemocnice a
                                    pomáha efektívne organizovať prácu všetkým pracovníkom.</p>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={4}>
                                <Card className="mb-3 shadow-sm">
                                    <Card.Body>
                                        <Card.Title>Pacienti</Card.Title>
                                        <Card.Text>Spravujte údaje o pacientoch vrátane ich anamnézy, diagnóz a
                                            kontaktov.</Card.Text>
                                        <Button variant="primary" href="/patients">Prejsť na pacientov</Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={4}>
                                <Card className="mb-3 shadow-sm">
                                    <Card.Body>
                                        <Card.Title>Sklad Liekov</Card.Title>
                                        <Card.Text>Spravujte zásoby liekov, záznamy o pohybe liekov a kontrolujte ich
                                            dostupnosť.</Card.Text>
                                        <Button variant="primary" href="/sklad-liekov">Prejsť na sklad liekov</Button>
                                    </Card.Body>
                                </Card>
                            </Col>
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
                        </Row>
                        <Row>
                            <Col md={4}>
                                <Card className="mb-3 shadow-sm">
                                    <Card.Body>
                                        <Card.Title>Objednávky</Card.Title>
                                        <Card.Text>Spravujte dostupnosť miestností, rezervácie a upravovanie
                                            rozvrhov.</Card.Text>
                                        <Button variant="primary" href="/orders">Prejsť na objednávky</Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={4}>
                                <Card className="mb-3 shadow-sm">
                                    <Card.Body>
                                        <Card.Title>Analýza</Card.Title>
                                        <Card.Text>Prehľadajte a analyzujte hospitalizácie, zdravotné záznamy a ďalšie
                                            údaje.</Card.Text>
                                        <Button variant="primary" href="/analysis">Prejsť na analýzu</Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={4}>
                                <Card className="mb-3 shadow-sm">
                                    <Card.Body>
                                        <Card.Title>Správa používateľov</Card.Title>
                                            <Card.Text style={{ marginBottom: '2.5rem' }}>Spravujte používateľov, ich prístupy a povolenia v systéme.</Card.Text>

                                        <Button variant="primary" href="/user-management">Prejsť na správu
                                            používateľov</Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                    </Col>
                </Row>
            </Container>
        )
            ;
    } else {
        return null;
    }
};

export default Home;