import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Modal, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import SideBar from './SideBar';

interface Zamestnanec {
    id: string;
    meno: string;
    priezvisko: string;
    specializacia: string;
    popis_specializacie: string;
}

const Zamestnanci: React.FC = () => {
    const [zamestnanci, setZamestnanci] = useState<Zamestnanec[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSideBarOpen, setIsSidebarOpen] = useState(true);
    const [username, setUsername] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [specializaciaFilter, setSpecializaciaFilter] = useState('');
    const [uniqueSpecializacie, setUniqueSpecializacie] = useState<string[]>([]);
    const [specializacie, setSpecializacie] = useState<{ kod: string; nazov: string; }[]>([]);

    const [userRole, setUserRole] = useState<string>('');
    const [showModal, setShowModal] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        rodne_cislo: '',
        meno: '',
        priezvisko: '',
        id_zamestnanca: '',
        id_specializacie: ''
    });
    const [message, setMessage] = useState<string>('');
    const [formError, setFormError] = useState<string | null>(null);

    // Funkcia na načítanie zamestnancov
    const fetchZamestnanci = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/staff', { withCredentials: true });
            console.log('Response:', response.data);
            setZamestnanci(response.data.zamestnanci);
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Nepodarilo sa načítať zamestnancov');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        axios.get('/home', { withCredentials: true })
            .then(response => {
                setUsername(response.data.username);
            })
            .catch(error => {
                console.error('Error fetching username:', error);
            });

        axios.get('/user-role', { withCredentials: true })
            .then(response => {
                setUserRole(response.data.rola);
            })
            .catch(error => {
                console.error('Error fetching user role:', error);
            });

        axios.get('/specializations', { withCredentials: true })
            .then(response => {
                setSpecializacie(response.data.specializations);
            })
            .catch(error => {
                console.error('Error fetching specializations:', error);
            });

        fetchZamestnanci();
    }, []);

    useEffect(() => {
        if (zamestnanci.length > 0) {
            const specializacieSet = new Set(zamestnanci.map(z => z.specializacia));
            setUniqueSpecializacie(Array.from(specializacieSet));
        }
    }, [zamestnanci]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSideBarOpen);
    };

    const filteredZamestnanci = zamestnanci.filter(zamestnanec => {
        const matchesSearch = (
            zamestnanec.meno.toLowerCase().includes(searchTerm.toLowerCase()) ||
            zamestnanec.priezvisko.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesSpecializacia = !specializaciaFilter ||
            zamestnanec.specializacia === specializaciaFilter;

        return matchesSearch && matchesSpecializacia;
    });

    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => {
        setShowModal(false);
        setFormError(null);
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        axios.post('/add-employee', formData, { withCredentials: true })
            .then(response => {
                setMessage('Nový zamestnanec bol úspešne pridaný.');
                setShowModal(false);
                setFormData({
                    rodne_cislo: '',
                    meno: '',
                    priezvisko: '',
                    id_zamestnanca: '',
                    id_specializacie: ''
                });
                fetchZamestnanci();
            })
            .catch(error => {
                setFormError('Pridanie nového zamestnanca zlyhalo.');
                console.error('Error adding new employee:', error);
            });
    };

    return (
        <Container fluid>
            <Row>
                <Col md={isSideBarOpen ? 2 : 1} className="p-0">
                    <SideBar isOpen={isSideBarOpen} toggleSidebar={toggleSidebar} username={username}/>
                </Col>

                <Col md={isSideBarOpen ? 10 : 11} className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h2>Zamestnanci nemocnice</h2>
                        {userRole === 'A' && (
                            <Button variant="primary" onClick={handleShowModal}>
                                Pridať zamestnanca
                            </Button>
                        )}
                    </div>

                    {message && <Alert variant="success" className="mt-3">{message}</Alert>}
                    {formError && <Alert variant="danger" className="mt-3">{formError}</Alert>}
                    {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

                    <div className="mb-4 row">
                        <div className="col-md-6 mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Vyhľadať podľa mena alebo priezviska..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <select
                                className="form-select"
                                value={specializaciaFilter}
                                onChange={(e) => setSpecializaciaFilter(e.target.value)}
                            >
                                <option value="">Všetky špecializácie</option>
                                {uniqueSpecializacie.map(spec => (
                                    <option key={spec} value={spec}>
                                        {spec}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <p>Načítava sa zoznam zamestnancov...</p>
                    ) : (
                        <div className="row g-4">
                            {filteredZamestnanci.map((zamestnanec) => (
                                <div key={zamestnanec.id} className="col-12 col-md-6 col-lg-4">
                                    <div className="card h-100 shadow-sm">
                                        <div className="card-body">
                                            <h5 className="card-title">
                                                {zamestnanec.meno} {zamestnanec.priezvisko}
                                            </h5>
                                            <h6 className="card-subtitle mb-2 text-muted">
                                                {zamestnanec.specializacia}
                                            </h6>
                                            {zamestnanec.popis_specializacie && (
                                                <p className="card-text">
                                                    {zamestnanec.popis_specializacie}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Col>
            </Row>

            {/* Modal pre pridanie nového zamestnanca */}
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Pridať nového zamestnanca</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {formError && <Alert variant="danger">{formError}</Alert>}
                    <Form onSubmit={handleFormSubmit}>
                        <Form.Group controlId="formRodneCislo">
                            <Form.Label>Rodné číslo</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.rodne_cislo}
                                onChange={(e) => setFormData({ ...formData, rodne_cislo: e.target.value })}
                                maxLength={10}
                                pattern="\d{1,10}"
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formMeno">
                            <Form.Label>Meno</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.meno}
                                onChange={(e) => setFormData({ ...formData, meno: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formPriezvisko">
                            <Form.Label>Priezvisko</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.priezvisko}
                                onChange={(e) => setFormData({ ...formData, priezvisko: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formIdZamestnanca">
                            <Form.Label>ID Zamestnanca</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.id_zamestnanca}
                                onChange={(e) => setFormData({ ...formData, id_zamestnanca: e.target.value })}
                                maxLength={4}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formIdSpecializacie">
                            <Form.Label>Špecializácia</Form.Label>
                            <Form.Control
                                as="select"
                                value={formData.id_specializacie}
                                onChange={(e) => setFormData({ ...formData, id_specializacie: e.target.value })}
                                required
                            >
                                <option value="">Vyberte špecializáciu</option>
                                {specializacie.map(spec => (
                                    <option key={spec.kod} value={spec.kod}>
                                        {spec.nazov}
                                    </option>
                                ))}
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

export default Zamestnanci;