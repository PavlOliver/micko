import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { Container, Row, Col, Spinner, Table } from 'react-bootstrap';
import SideBar from './SideBar'; // Predpokladám, že už máte vytvorený SideBar komponent

interface PacientData {
    mesiac: string;
    pocet_novych_pacientov: number;
    percentualny_narast: number;
    poradove_cislo: number;
}

const TrendyPacientov: React.FC = () => {
    const [data, setData] = useState<PacientData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSideBarOpen, setIsSidebarOpen] = useState(true);
    const [username, setUsername] = useState(''); // Ak potrebujete zobraziť meno používateľa

    useEffect(() => {
        axios
            .get('/analysis/trendy_novych_pacientov')
            .then((response) => {
                setData(response.data);
                setUsername(response.data.username); // Ak sa meno vracia v odpovedi
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setLoading(false);
            });
    }, []);

    const toggleSidebar = () => setIsSidebarOpen(!isSideBarOpen);

    return (
        <Container fluid className="p-4">
            <Row>
                <Col md={isSideBarOpen ? 2 : 1} className="p-0">
                    <SideBar isOpen={isSideBarOpen} toggleSidebar={toggleSidebar} username={username} />
                </Col>

                <Col md={isSideBarOpen ? 10 : 11} className="content-column">
                    <h2>Trendy v počte nových pacientov</h2>

                    {loading ? (
                        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Načítavam...</span>
                            </Spinner>
                        </div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="mesiac" label={{ value: 'Mesiac', position: 'insideBottom', offset: -5 }} />
                                    <YAxis label={{ value: 'Počet pacientov', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="pocet_novych_pacientov" stroke="#8884d8" name="Počet pacientov" />
                                </LineChart>
                            </ResponsiveContainer>

                            <h3 className="mt-4">Tabuľka údajov</h3>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Mesiac</th>
                                        <th>Počet nových pacientov</th>
                                        <th>Percentuálny nárast</th>
                                        <th>Poradové číslo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.mesiac}</td>
                                            <td>{item.pocet_novych_pacientov}</td>
                                            <td>{item.percentualny_narast} %</td>
                                            <td>{item.poradove_cislo}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default TrendyPacientov;
