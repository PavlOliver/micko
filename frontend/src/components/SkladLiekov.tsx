import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Modal, Form, Alert, Table } from 'react-bootstrap';
import axios from 'axios';
import SideBar from './SideBar';

interface InventoryItem {
    sarza: number;
    nazov: string;
    pocet: number;
    datum_dodania: string;
    expiracia: string;
    pohyb: string;
}

const SkladLiekov: React.FC = () => {
    const [username, setUsername] = useState('');
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [isSideBarOpen, setIsSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        sarza: '',
        liek: '',
        pocet: '',
        datum_dodania: '',
        expiracia: '',
        pohyb: 'P',
        faktura_scan: null
    });

    const toggleSidebar = () => setIsSidebarOpen(!isSideBarOpen);

    useEffect(() => {
        fetchData();

        axios.get('/home', { withCredentials: true })
            .then(response => {
                setUsername(response.data.username);
            })
            .catch(error => {
                console.error('Error fetching username:', error);
            });
    }, []);

    const fetchData = () => {
        setLoading(true);
        axios
            .get('/sklad-liekov')
            .then((response) => {
                console.log('Response:', response.data);
                setInventory(response.data.inventory);
                setUsername(response.data.username);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setError('Failed to load inventory data');
                setLoading(false);
            });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        axios
            .post('/sklad-liekov', formData)
            .then(() => {
                setShowModal(false);
                fetchData();
                setFormData({
                    sarza: '',
                    liek: '',
                    pocet: '',
                    datum_dodania: '',
                    expiracia: '',
                    pohyb: 'P',
                    faktura_scan: null
                });
            })
            .catch((error) => {
                console.error('Error adding inventory item:', error);
                setError('Failed to add inventory item');
            });
    };

    const getPohybDisplay = (pohyb: string) => {
        return pohyb === 'P' ? 'Príchod' : 'Výber';
    };

    return (
        <Container fluid>
            <Row>
                <Col md={isSideBarOpen ? 2 : 1} className="p-0">
                    <SideBar
                        isOpen={isSideBarOpen}
                        toggleSidebar={toggleSidebar}
                        username={username}
                    />
                </Col>
                <Col md={isSideBarOpen ? 10 : 11} className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2>Sklad liekov</h2>
                        <Button variant="primary" onClick={() => setShowModal(true)}>
                            + Pridať položku
                        </Button>
                    </div>

                    {error && <Alert variant="danger">{error}</Alert>}

                    {loading ? (
                        <div>Loading...</div>
                    ) : (
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Šarža</th>
                                    <th>Názov lieku</th>
                                    <th>Počet</th>
                                    <th>Dátum dodania</th>
                                    <th>Expirácia</th>
                                    <th>Pohyb</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventory.map((item) => (
                                    <tr key={item.sarza}>
                                        <td>{item.sarza}</td>
                                        <td>{item.nazov}</td>
                                        <td>{item.pocet}</td>
                                        <td>{item.datum_dodania}</td>
                                        <td>{item.expiracia}</td>
                                        <td>{getPohybDisplay(item.pohyb)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Col>
            </Row>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Pridať položku do skladu</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group>
                            <Form.Label>Šarža</Form.Label>
                            <Form.Control
                                type="number"
                                value={formData.sarza}
                                onChange={(e) => setFormData({ ...formData, sarza: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Liek</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.liek}
                                onChange={(e) => setFormData({ ...formData, liek: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Počet</Form.Label>
                            <Form.Control
                                type="number"
                                value={formData.pocet}
                                onChange={(e) => setFormData({ ...formData, pocet: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Dátum dodania</Form.Label>
                            <Form.Control
                                type="date"
                                value={formData.datum_dodania}
                                onChange={(e) => setFormData({ ...formData, datum_dodania: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Expirácia</Form.Label>
                            <Form.Control
                                type="date"
                                value={formData.expiracia}
                                onChange={(e) => setFormData({ ...formData, expiracia: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Pohyb</Form.Label>
                            <Form.Control
                                as="select"
                                value={formData.pohyb}
                                onChange={(e) => setFormData({ ...formData, pohyb: e.target.value })}
                                required
                            >
                                <option value="P">Príchod</option>
                                <option value="V">Výber</option>
                            </Form.Control>
                        </Form.Group>
                        <Button variant="primary" type="submit" className="mt-3">
                            Pridať
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );

};

export default SkladLiekov;