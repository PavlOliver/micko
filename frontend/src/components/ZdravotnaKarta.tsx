import React, {useEffect, useState} from 'react';
import {Container, Row, Col, Card, Table, Button} from 'react-bootstrap';
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


    const toggleSidebar = () => {
        setIsSideBarOpen(!isSideBarOpen);
    };

    const handleEdit = (recordId: number) => {
        navigate(`/pacient/${id_poistenca}/zaznam/${recordId}`);
    }

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
                            <h2 className="mt-2">Zdravotná karta: {Pacient.meno} {Pacient.priezvisko}</h2>

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
                        <Col className="d-flex justify-content-end">
                            <Button variant="primary" className="me-2">Upraviť</Button>
                            <Button variant="danger">Vymazať kartu</Button>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
};

export default ZdravotnaKarta;
