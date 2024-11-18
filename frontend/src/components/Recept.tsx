import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, Modal } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SideBar from './SideBar';

const Recept: React.FC = () => {
    const { id_poistenca } = useParams<{ id_poistenca: string }>();
    const [formData, setFormData] = useState({
        liek: '',
        vybrane: '',
        pacient: '',
        lekar: '',
        pocet: 1,
        poznamka: ''
    });
    const [IDs, setIDs] = useState({ lekar_id: '', pacient_id: '' });
    const [message, setMessage] = useState('');
    const [isSideBarOpen, setIsSidebarOpen] = useState(true);
    const [username, setUsername] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [drugSuggestions, setDrugSuggestions] = useState<string[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`/pacient/${id_poistenca}/recepty`, { withCredentials: true })
            .then(response => {
                setFormData({
                    ...formData,
                    pacient: response.data.pacient_meno,
                    lekar: response.data.lekar_meno
                });
                setIDs({
                    lekar_id: response.data.lekar_id,
                    pacient_id: response.data.pacient_id
                });
                setUsername(response.data.username);
            })
            .catch(error => {
                console.error(error);
            });
    }, [id_poistenca]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDrugInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData({ ...formData, liek: value });
        if (value.length >= 3) {
            axios.get(`/lieky?query=${value}`, { withCredentials: true })
                .then(response => {
                    setDrugSuggestions(response.data.drugs);
                })
                .catch(error => {
                    console.error(error);
                });
        } else {
            setDrugSuggestions([]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedFormData = { ...formData, lekar: IDs.lekar_id, pacient: IDs.pacient_id };
        axios.post(`/pacient/${id_poistenca}/recepty`, updatedFormData, { withCredentials: true })
            .then(response => {
                if (response.status === 201) {
                    setMessage('Recept bol úspešne pridaný');
                    setTimeout(() => {
                        setMessage('');
                        navigate(`/pacient/${id_poistenca}/recepty`);
                    }, 3000);
                }
            })
            .catch(error => {
                console.error(error);
                setErrorMessage('Nastala chyba pri pridávaní receptu');
                setShowErrorModal(true);
            });
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSideBarOpen);
    const handleCloseErrorModal = () => setShowErrorModal(false);

    return (
        <Container fluid>
            <Row style={{ height: '100vh' }}>
                <Col md={3} className="p-0">
                    <SideBar isOpen={isSideBarOpen} toggleSidebar={toggleSidebar} username={username} />
                </Col>
                <Col md={9} className="p-4" style={{ marginLeft: isSideBarOpen ? '250px' : '60px', transition: 'margin-left 0.3s' }}>
                    <Row>
                        <Col md={{ span: 6, offset: 3 }}>
                            <h2>Nový recept</h2>
                            {message && <Alert variant="success" style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 1000 }}>{message}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group controlId="lekar">
                                    <Form.Label>Lekár</Form.Label>
                                    <Form.Control type="text" name="lekar" value={formData.lekar} readOnly />
                                </Form.Group>
                                <Form.Group controlId="pacient">
                                    <Form.Label>Pacient</Form.Label>
                                    <Form.Control type="text" name="pacient" value={formData.pacient} readOnly />
                                </Form.Group>
                                <Form.Group controlId="liek">
                                    <Form.Label>Liek</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="liek"
                                        value={formData.liek}
                                        onChange={handleDrugInputChange}
                                        required
                                    />
                                    {drugSuggestions.length > 0 && (
                                        <ul className="suggestions-list">
                                            {drugSuggestions.map((suggestion, index) => (
                                                <li
                                                    key={index}
                                                    onClick={() => {
                                                        setFormData({ ...formData, liek: suggestion });
                                                        setDrugSuggestions([]);
                                                    }}
                                                >
                                                    {suggestion}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </Form.Group>
                                <Form.Group controlId="pocet">
                                    <Form.Label>Počet</Form.Label>
                                    <Form.Control type="number" name="pocet" value={formData.pocet} onChange={handleChange} min="1" required />
                                </Form.Group>
                                <Form.Group controlId="poznamka">
                                    <Form.Label>Poznámka</Form.Label>
                                    <Form.Control type="text" name="poznamka" value={formData.poznamka} onChange={handleChange} />
                                </Form.Group>
                                <Button variant="primary" type="submit">Pridať recept</Button>
                            </Form>
                        </Col>
                    </Row>
                </Col>
            </Row>

            <Modal show={showErrorModal} onHide={handleCloseErrorModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Error</Modal.Title>
                </Modal.Header>
                <Modal.Body>{errorMessage}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseErrorModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Recept;