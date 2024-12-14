import React, {useState, useEffect} from 'react';
import {Container, Col, Row, Form, FormControl, Button, Card, Modal, Dropdown} from 'react-bootstrap';
import SideBar from "./SideBar";
import '../css/patients.css';
import axios from "axios";
import {useNavigate} from "react-router-dom";

interface Patient {
    id_poistenca: number;
    rodne_cislo: string;
    meno: string;
    priezvisko: string;
}

const Patients: React.FC = () => {
    const [isSideBarOpen, setIsSideBarOpen] = useState(true);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [ID_Poistenca, setID_Poistenca] = useState('');
    const [rodneCislo, setRodneCislo] = useState('');
    const [vek, setVek] = useState<number | ''>('');
    const [adresa, setAdresa] = useState('');
    const navigate = useNavigate();
    const [username, setUsername] = useState('');


    const toggleSidebar = () => {
        setIsSideBarOpen(!isSideBarOpen);
    };

    useEffect(() => {
        axios.get('/patients')
            .then(response => {
                setPatients(response.data.patients);
                setUsername(response.data.username);
            })
            .catch(error => {
                console.error('Error fetching patients', error);
                navigate('/login');
            });
    }, []);

    const handleSearch = () => {
        axios.get('/search_patients', {
            params: {ID_Poistenca, rodne_cislo: rodneCislo, vek, adresa}
        })
            .then(response => {
                console.log('Search results:', response.data);

                if (Array.isArray(response.data.patients)) {
                    setPatients(response.data.patients);
                } else {
                    console.error('Expected an array of patients, but got:', response.data.patients);
                    setPatients([]);
                }
            })
            .catch(error => {
                console.error('Error searching patients:', error);
            });
    };


    const handleAddRecept = (id_poistenca: number) => {
        console.log('Add recept');
        navigate(`/pacient/${id_poistenca}/recepty`);
    }

    function handleShowZdravotnaKarta(id_poistenca: number) {
        console.log('Show zdravotna karta');
        navigate(`/pacient/${id_poistenca}/zdravotna_karta`);
    }

    function handleAddDiagnosis(id_poistenca: number) {
        navigate(`/pacient/${id_poistenca}/zaznam`);
    }

    function handleAddHospitalization(id_poistenca: number) {
        navigate(`/pacient/${id_poistenca}/hospitalizacia`);
    }

    if (username) {
        return (
            <Container fluid>
                <Row>
                    <Col md={isSideBarOpen ? 2 : 1} className="p-0">
                        <SideBar isOpen={isSideBarOpen} toggleSidebar={toggleSidebar} username={username}/>
                    </Col>
                    <Col md={isSideBarOpen ? 10 : 11} className="content-column">
                        <Row className="mb-4">
                            <Form>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group controlId="formName">
                                            <Form.Label>ID Poistenca</Form.Label>
                                            <FormControl type="text"
                                                         placeholder="Zadajte meno"
                                                         value={ID_Poistenca}
                                                         onChange={(e) => setID_Poistenca(e.target.value)}/>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group controlId="formRodneCislo">
                                            <Form.Label>Rodné číslo</Form.Label>
                                            <FormControl
                                                type="text"
                                                placeholder="Zadajte rodné číslo"
                                                value={rodneCislo}
                                                onChange={(e) => setRodneCislo(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row className="mt-3">
                                    <Col md={6}>
                                        <Form.Group controlId="formAge">
                                            <Form.Label>Vek</Form.Label>
                                            <FormControl
                                                type="number"
                                                placeholder="Zadajte vek"
                                                value={vek || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setVek(value ? parseInt(value) : '');
                                                }}
                                            />
                                        </Form.Group>

                                    </Col>
                                    <Col md={6}>
                                        <Form.Group controlId="formAdresa">
                                            <Form.Label>Adresa</Form.Label>
                                            <FormControl
                                                type="text"
                                                placeholder="Zadajte adresu"
                                                value={adresa}
                                                onChange={(e) => setAdresa(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Button variant="primary" type="button" className="mt-3" onClick={handleSearch}>
                                    Odoslať
                                </Button>
                            </Form>
                        </Row>
                        <Row>
                            {patients.length === 0 ? (
                                <Col md={12} className="text-center">
                                    <p>Aktuálne sa nenachádzaju žíadni pacienti</p>
                                </Col>
                            ) : (
                                patients.map(patient => (
                                    <Col md={6} key={patient.id_poistenca} className="mb-4">
                                        <Card>
                                            <Card.Body>
                                                <Row>
                                                    <Col md={8}>
                                                        <Card.Title>{patient.meno} {patient.priezvisko}</Card.Title>
                                                        <Card.Text>
                                                            <strong>Rodné číslo:</strong> {patient.rodne_cislo}
                                                        </Card.Text>
                                                    </Col>
                                                    <Col md={4}
                                                         className="d-flex align-items-center justify-content-end">
                                                        <Button variant="outline-primary" className="me-2"
                                                                onClick={() => handleShowZdravotnaKarta(patient.id_poistenca)}>
                                                            <i className="bi bi-info-circle me-1"></i> Detail
                                                        </Button>
                                                        <Dropdown>
                                                            <Dropdown.Toggle variant="outline-success"
                                                                             id="dropdown-basic">
                                                                <i className="bi bi-plus-circle me-1"></i> Pridať
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu>
                                                                <Dropdown.Item
                                                                    onClick={() => handleAddRecept(patient.id_poistenca)}>Pridať
                                                                    recept</Dropdown.Item>
                                                                <Dropdown.Item
                                                                    onClick={() => handleAddDiagnosis(patient.id_poistenca)}>Pridať
                                                                    diagnózu</Dropdown.Item>
                                                                <Dropdown.Item
                                                                    onClick={() => handleAddHospitalization(patient.id_poistenca)}>Pridať
                                                                    hospitalizáciu</Dropdown.Item>
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                    </Col>
                                                </Row>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))
                            )}
                        </Row>
                    </Col>
                </Row>
            </Container>
        );
    } else {
        return null;
    }
};

export default Patients;