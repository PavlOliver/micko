import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
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

    useEffect(() => {
        // Fetch username
        axios.get('/home', { withCredentials: true })
            .then(response => {
                setUsername(response.data.username);
            })
            .catch(error => {
                console.error('Error fetching username:', error);
            });

        // Fetch employees
        const fetchZamestnanci = async () => {
            try {
                const response = await axios.get('/staff', { withCredentials: true });
                console.log('Response:', response.data);
                setZamestnanci(response.data.zamestnanci);
            } catch (err) {
                console.error('Fetch error:', err);
                setError('Failed to load employees');
            } finally {
                setLoading(false);
            }
        };

        fetchZamestnanci();
    }, []);

    useEffect(() => {
        if (zamestnanci.length > 0) {
            const specializacie = [...new Set(zamestnanci.map(z => z.specializacia))];
            setUniqueSpecializacie(specializacie);
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

    return (
        <Container fluid>
            <Row>
                <Col md={3} className="p-0">
                    <SideBar
                        isOpen={isSideBarOpen}
                        toggleSidebar={toggleSidebar}
                        username={username}
                    />
                </Col>
                <Col md={9} className="p-4" style={{
                    marginLeft: isSideBarOpen ? '250px' : '60px',
                    transition: 'margin-left 0.3s'
                }}>
                    <h2>Zamestnanci nemocnice</h2>

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
                </Col>
            </Row>
        </Container>
    );
};

export default Zamestnanci;