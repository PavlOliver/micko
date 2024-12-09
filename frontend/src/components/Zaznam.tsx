import {Alert, Button, Col, Container, Form, Modal, Row} from "react-bootstrap";
import SideBar from "./SideBar";
import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import axios from "axios";

const Zaznam: React.FC = () => {
    useEffect(() => {
        axios.get(`/pacient/${id_poistenca}/zaznam`, {withCredentials: true})
            .then(response => {
                setFormData(prevFormData => ({
                    ...prevFormData,
                    pacient: response.data.pacient_meno,
                    lekar: response.data.lekar_meno
                }));
                setIDs({
                    lekar_id: response.data.lekar_id,
                    pacient_id: response.data.pacient_id
                });
                setUsername(response.data.username);
            })
            .catch(error => {
                console.error(error);
            });
    }, []);

    const {id_poistenca} = useParams<{ id_poistenca: string }>();

    const [IDs, setIDs] = useState({lekar_id: '', pacient_id: ''});
    const [message, setMessage] = useState('');
    const [isSideBarOpen, setIsSidebarOpen] = useState(true);
    const [username, setUsername] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [diagnosisSuggestion, setdiagnosisSuggestion] = useState<RecordSuggestion[]>([]);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        diagnoza_nazov: '',
        diagnoza_kod: '',
        datum_vysetrenia: '',
        pacient: '',
        lekar: '',
        popis: ''
    });

    interface RecordSuggestion {
        nazov_diagnozy: string;
        kod_diagnozy: string;
    }


    const toggleSidebar = () => setIsSidebarOpen(!isSideBarOpen);
    const handleCloseErrorModal = () => setShowErrorModal(false);

    const handlePopisChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData({...formData, popis: e.target.value});
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        axios.post(`/pacient/${id_poistenca}/zaznam`, formData, {withCredentials: true})
            .then(response => {
                setMessage('Záznam bol úspešne pridaný');
                navigate(`/pacient/${id_poistenca}/zaznam`);
                formData.popis = '';
                formData.datum_vysetrenia = '';
                formData.diagnoza_nazov = '';
            })
            .catch(error => {
                setErrorMessage(error.response.data.error);
                setShowErrorModal(true);
            });
    }

    const handleRecordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData({...formData, diagnoza_nazov: value, diagnoza_kod: ''});
        if (value.length >= 3) {
            axios.get(`/diagnosis_list?query=${value}`, {withCredentials: true})
                .then(response => {
                    setdiagnosisSuggestion(response.data.diagnosis);
                })
                .catch(error => {
                    console.error(error);
                });
        } else {
            setdiagnosisSuggestion([]);
        }
    }

    return (
        <Container fluid>
            <Row style={{height: '100vh'}}>
                <Col md={3} className="p-0">
                    <SideBar isOpen={isSideBarOpen} toggleSidebar={toggleSidebar} username={username}/>
                </Col>
                <Col md={9} className="p-4"
                     style={{marginLeft: isSideBarOpen ? '250px' : '60px', transition: 'margin-left 0.3s'}}>
                    <Row>
                        <Col md={{span: 6, offset: 3}}>
                            <h2>Pridať zdravotný záznam</h2>
                            {message && <Alert variant="success" style={{
                                position: 'fixed',
                                top: '10px',
                                right: '10px',
                                zIndex: 1000
                            }}>{message}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group controlId="lekar">
                                    <Form.Label>Lekár</Form.Label>
                                    <Form.Control type="text" name="lekar" value={formData.lekar} readOnly/>
                                </Form.Group>
                                <Form.Group controlId="pacient">
                                    <Form.Label>Pacient</Form.Label>
                                    <Form.Control type="text" name="pacient" value={formData.pacient} readOnly/>
                                </Form.Group>
                                <Form.Group controlId="diagnoza">
                                    <Form.Label>Diagnoza</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="liek"
                                        value={formData.diagnoza_nazov}
                                        onChange={handleRecordInputChange}
                                        required
                                    />
                                    {diagnosisSuggestion.length > 0 && (
                                        <ul className="suggestions-list">
                                            {diagnosisSuggestion.map((diagnosis, index) => (
                                                <li
                                                    key={index}
                                                    onClick={() => {
                                                        setFormData({
                                                            ...formData,
                                                            diagnoza_nazov: diagnosis.nazov_diagnozy,
                                                            diagnoza_kod: diagnosis.kod_diagnozy
                                                        });
                                                        setdiagnosisSuggestion([]);
                                                    }}
                                                >
                                                    {diagnosis.nazov_diagnozy}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </Form.Group>
                                <Form.Group controlId="popis">
                                    <Form.Label>Popis diagnozy</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        name="popis"
                                        value={formData.popis}
                                        onChange={handlePopisChange}
                                    />
                                </Form.Group>
                                <Form.Group controlId="formDatum">
                                    <Form.Label>Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="datum_vysetrenia"
                                        value={formData.datum_vysetrenia}
                                        onChange={(e) => setFormData({...formData, datum_vysetrenia: e.target.value})}
                                    />
                                </Form.Group>
                                <Button className="mt-3" variant="primary" type="submit">Pridať zdravotný záznam</Button>
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


export default Zaznam;