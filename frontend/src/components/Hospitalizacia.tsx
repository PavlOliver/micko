import {Alert, Button, Col, Container, Form, Modal, Row} from "react-bootstrap";
import SideBar from "./SideBar";
import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import axios from "axios";

const Hospitalizacia: React.FC = () => {
    const {id_poistenca} = useParams<{ id_poistenca: string }>();

    const [IDs, setIDs] = useState({lekar_id: '', pacient_id: ''});
    const [message, setMessage] = useState('');
    const [isSideBarOpen, setIsSidebarOpen] = useState(true);
    const [username, setUsername] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    interface Room {
        cislo_miestnosti: string;
        kapacita: number;
        stav: string;
        typ: string;
    }

    const [roomSuggestions, setRoomSuggestions] = useState<Room[]>([]);

    const [formData, setFormData] = useState({
        datum_od: '',
        datum_do: '',
        miestnost: '',
        dovod: '',
        pacient: '',
        lekar: ''
    });

    useEffect(() => {
        axios.get(`/pacient/${id_poistenca}/hospitalizacia`, {withCredentials: true})
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
    }, [id_poistenca]);

    const toggleSidebar = () => setIsSidebarOpen(!isSideBarOpen);
    const handleCloseErrorModal = () => setShowErrorModal(false);

    const handleRoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData({...formData, miestnost: value});

        if (value.length >= 2) {
            axios.get(`/room_list?query=${value}`, {withCredentials: true})
                .then(response => {
                        console.log(response.data.rooms); // Skontrolujte, čo backend vrátil

                    setRoomSuggestions(response.data.rooms);
                })
                .catch(error => {
                    console.error(error);
                });
        } else {
            setRoomSuggestions([]);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        axios.post(`/pacient/${id_poistenca}/hospitalizacia`, formData, {withCredentials: true})
            .then(response => {
                setMessage('Hospitalizácia bola úspešne pridaná');
                navigate(`/pacient/${id_poistenca}/hospitalizacia`);
                setFormData({
                    datum_od: '',
                    datum_do: '',
                    miestnost: '',
                    dovod: '',
                    pacient: IDs.pacient_id,
                    lekar: IDs.lekar_id
                });
            })
            .catch(error => {
                setErrorMessage(error.response?.data?.error || 'Nastala chyba');
                setShowErrorModal(true);
            });
    };

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
                            <h2>Pridať hospitalizáciu</h2>
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
                                <Form.Group controlId="datumOd">
                                    <Form.Label>Dátum od</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="datum_od"
                                        value={formData.datum_od}
                                        onChange={(e) => setFormData({...formData, datum_od: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group controlId="datumDo">
                                    <Form.Label>Dátum do</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="datum_do"
                                        value={formData.datum_do}
                                        onChange={(e) => setFormData({...formData, datum_do: e.target.value})}
                                    />
                                </Form.Group>
                                <Form.Group controlId="miestnost">
                                    <Form.Label>Miestnosť</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="miestnost"
                                        value={formData.miestnost}
                                        onChange={handleRoomChange}
                                        required
                                    />
                                    {roomSuggestions.length > 0 && (
                                        <ul className="suggestions-list">
                                            {roomSuggestions.map((room, index) => (
                                                <li
                                                    key={index}
                                                    onClick={() => {
                                                        setFormData({...formData, miestnost: room.cislo_miestnosti});
                                                        setRoomSuggestions([]);
                                                    }}
                                                >
                                                    {room.cislo_miestnosti} - {room.typ} ({room.stav})
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </Form.Group>
                                <Form.Group controlId="dovod">
                                    <Form.Label>Dôvod hospitalizácie</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        name="dovod"
                                        value={formData.dovod}
                                        onChange={(e) => setFormData({...formData, dovod: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                                <Button className="mt-3" variant="primary" type="submit">Pridať hospitalizáciu</Button>
                            </Form>
                        </Col>
                    </Row>
                </Col>
            </Row>

            <Modal show={showErrorModal} onHide={handleCloseErrorModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Chyba</Modal.Title>
                </Modal.Header>
                <Modal.Body>{errorMessage}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseErrorModal}>
                        Zatvoriť
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Hospitalizacia;
