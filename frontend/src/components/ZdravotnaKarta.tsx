import React, {useEffect, useState} from 'react';
import {Container, Row, Col, Card, Table, Button, Modal, Form} from 'react-bootstrap';
import SideBar from "./SideBar";
import {useParams} from "react-router-dom";
import axios from "axios";
import {useNavigate} from "react-router-dom";

interface Hospitalizacia {
    datum_od: string;
    datum_do: string;
    dovod: string;
    miestnost: string;
}

interface Recept {
    liek: string;
    poznamka: string;
    vystavenie: string;
    lekar: string;
}

interface Adresa {
    ulica: string;
    mesto: string;
    psc: string;
}

interface VysledokVysetrenia {
    id: number;
    datum: string;
    vysledok: string;
    lekar: string;
}

interface os_udaje {
    meno: string;
    priezvisko: string;
    datumNarodenia: string;
    rodneCislo: string;
    adresa: Adresa;
    telefon: string;
    hospitalizacie: Hospitalizacia[];
    recepty: Recept[];
    vysledkyVysetreni: VysledokVysetrenia[];
    krvna_skupina: string;
    alergie: string[];

}

interface alergia {
    kod_alergie: string;
    nazov_alergie: string;
}

const ZdravotnaKarta: React.FC = () => {
    const {id_poistenca} = useParams<{ id_poistenca: string }>();
    const [Pacient, setPacient] = useState<os_udaje | null>(null);
    const [isSideBarOpen, setIsSideBarOpen] = useState(true);
    const [username, setUsername] = useState('');
    const [alergie, setAlergie] = useState<alergia[]>([]);
    const navigate = useNavigate();
    const [showEditModal, setShowEditModal] = useState(false);

    const [formData, setFormData] = useState({
        krvnaSkupina: '',
        telefon: '',
        psc: '',
        mesto: '',
        ulica: ''
    });
    const toggleSidebar = () => {
        setIsSideBarOpen(!isSideBarOpen);
    };

    const handleEdit = (recordId: number) => {
        navigate(`/pacient/${id_poistenca}/zaznam/${recordId}`);
    }

    const handleShowEditModal = () => {
        setFormData({
            krvnaSkupina: Pacient?.krvna_skupina || '',
            telefon: Pacient?.telefon || '',
            psc: Pacient?.adresa.psc || '',
            mesto: Pacient?.adresa.mesto || '',
            ulica: Pacient?.adresa.ulica || ''
        });
        setShowEditModal(true);
    };
    const handleCloseEditModal = () => setShowEditModal(false);

    const handleSaveChanges = () => {
        axios.post(`/pacient/${id_poistenca}/zmenaUdajov`, formData, {withCredentials: true})
            .then(response => {
                setPacient(response.data.zdravotna_karta);
                setShowEditModal(false);
            })
            .catch(error => {
                console.error('Error updating patient data:', error);
            });
    };
    useEffect(() => {
        axios.get(`/pacient/${id_poistenca}/zdravotna-karta`, {withCredentials: true, params: {id_poistenca}})
            .then(response => {
                setPacient(response.data.zdravotna_karta);
                setUsername(response.data.username);
                console.log(response.data.zdravotna_karta);
                setAlergie(response.data.zdravotna_karta.alergie);
                console.log(alergie);
            })
            .catch(error => {
                console.error('Error fetching patient data:', error);
            });
    }, [id_poistenca]);

    if (!Pacient) {
        return (
            <Container fluid className="ms-2">
                <Row>
                    <Col md={12}>
                        <h2>Načítavam údaje pacienta...</h2>
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <Container fluid className="ms-2">
            <Row>
                <Col md={isSideBarOpen ? 2 : 1} className="p-0">
                    <SideBar isOpen={isSideBarOpen} toggleSidebar={toggleSidebar} username={username}/>
                </Col>
                <Col md={isSideBarOpen ? 10 : 11} className="content-column">
                    <Row>
                        <Col md={12}>
                            <div className="d-flex align-items-center mt-2">
                                <h2 className="">Zdravotná karta: {Pacient.meno} {Pacient.priezvisko}</h2>
                                <Button variant="primary" className="mb-4 ms-auto me-1 mt-3"
                                        onClick={handleShowEditModal}
                                >Upraviť</Button>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <Card className="mb-4">
                                <Card.Body>
                                    <Card.Title>Osobné údaje</Card.Title>
                                    <p><strong>Dátum narodenia:</strong> {Pacient.datumNarodenia}</p>
                                    <p><strong>IČP:</strong> {Pacient.rodneCislo}</p>
                                    <p>
                                        <strong>Adresa:</strong> {Pacient.adresa.ulica}, {Pacient.adresa.mesto} {Pacient.adresa.psc}
                                    </p>
                                    <p><strong>Telefón:</strong> {Pacient.telefon}</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card className="mb-4">
                                <Card.Body>
                                    <Card.Title>Zdravotné údaje</Card.Title>
                                    <p><strong>Krvná skupina:</strong> {Pacient.krvna_skupina}</p>
                                    <p><strong>Alergie:</strong> {alergie?.length > 0 ? (
                                        alergie.map(a => <span key={a.kod_alergie}><br/>{a.nazov_alergie}</span>)
                                    ) : (
                                        <span>Žiadne alergie</span>
                                    )}</p>
                                </Card.Body>
                            </Card>

                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <Card className="mb-4">
                                <Card.Body>
                                    <Card.Title>História hospitalizácií</Card.Title>
                                    <Table striped bordered hover>
                                        <thead>
                                        <tr>
                                            <th>Dátum od</th>
                                            <th>Dátum do</th>
                                            <th>Dôvod</th>
                                            <th>Oddelenie</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {Pacient.hospitalizacie?.map((hosp, index) => (
                                            <tr key={index}>
                                                <td>{hosp.datum_od}</td>
                                                <td>{hosp.datum_do || "Neukončená"}</td>
                                                <td>{hosp.dovod}</td>
                                                <td>{hosp.miestnost}</td>
                                            </tr>
                                        )) || (
                                            <tr>
                                                <td colSpan={4} className="text-center">Žiadne hospitalizácie</td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <Card className="mb-4">
                                <Card.Body>
                                    <Card.Title>Výsledky vyšetrení</Card.Title>
                                    <Table striped bordered hover>
                                        <thead>
                                        <tr>
                                            <th>Dátum</th>
                                            <th>Výsledok</th>
                                            <th>Lekár</th>
                                            <th>Akcie</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {Pacient.vysledkyVysetreni?.length > 0 ? (
                                            Pacient.vysledkyVysetreni.map((vysledok, index) => (
                                                <tr key={index}>
                                                    <td>{vysledok.datum}</td>
                                                    <td>{vysledok.vysledok}</td>
                                                    <td>{vysledok.lekar}</td>
                                                    <td>
                                                        <Button variant="primary" className="me-2"
                                                                onClick={() => handleEdit(vysledok.id)}>Upraviť</Button>
                                                        <Button variant="danger">Vymazať</Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="text-center">Žiadne výsledky vyšetrení</td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <Card className="mb-4">
                                <Card.Body>
                                    <Card.Title>Predpísané lieky</Card.Title>
                                    <Table striped bordered hover>
                                        <thead>
                                        <tr>
                                            <th>Názov</th>
                                            <th>Poznámka</th>
                                            <th>Vystavenie</th>
                                            <th>Predpisujúci lekár</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {Pacient.recepty?.map((recept, index) => (
                                            <tr key={index}>
                                                <td>{recept.liek}</td>
                                                <td>{recept.poznamka}</td>
                                                <td>{recept.vystavenie}</td>
                                                <td>{recept.lekar}</td>
                                            </tr>
                                        )) || (
                                            <tr>
                                                <td colSpan={4} className="text-center">Žiadne predpísané lieky</td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row>

                    </Row>
                </Col>
            </Row>
            <Modal show={showEditModal} onHide={handleCloseEditModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Upraviť údaje</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formKrvnaSkupina">
                            <Form.Label>Krvná skupina</Form.Label>
                            <Form.Control type="text" value={formData.krvnaSkupina}
                                          onChange={e => setFormData({...formData, krvnaSkupina: e.target.value})}/>
                        </Form.Group>
                        <Form.Group controlId="formTelefon">
                            <Form.Label>Telefón</Form.Label>
                            <Form.Control type="text" value={formData.telefon}
                                          onChange={e => setFormData({...formData, telefon: e.target.value})}/>
                        </Form.Group>
                        <Form.Group controlId="formUlica">
                            <Form.Label>Ulica</Form.Label>
                            <Form.Control type="text" value={formData.ulica}
                                          onChange={e => setFormData({...formData, ulica: e.target.value})}/>
                        </Form.Group>
                        <Form.Group controlId="formMesto">
                            <Form.Label>Mesto</Form.Label>
                            <Form.Control type="text" value={formData.mesto}
                                          onChange={e => setFormData({...formData, mesto: e.target.value})}/>
                        </Form.Group>
                        <Form.Group controlId="formPsc">
                            <Form.Label>PSC</Form.Label>
                            <Form.Control type="text" value={formData.psc}
                                          onChange={e => setFormData({...formData, psc: e.target.value})}/>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseEditModal}>Zrušiť</Button>
                    <Button variant="primary" onClick={handleSaveChanges}>Uložiť zmeny</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ZdravotnaKarta;
