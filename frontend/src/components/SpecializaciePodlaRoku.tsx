import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Table, Spinner, Form, Button } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import SideBar from './SideBar';

const SpecializacieRok: React.FC = () => {
    const [year, setYear] = useState('2020');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSideBarOpen, setIsSideBarOpen] = useState(false);
    const [username, setUsername] = useState('John Doe');

    useEffect(() => {
        if (year) {
            fetchData(year);
        }
    }, [year]);

    const fetchData = (year: string) => {
        setLoading(true);
        axios
            .get(`/analysis/specializacie_rok?rok=${year}`)
            .then((response) => {
                setData(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setLoading(false);
            });
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setYear(e.target.value);
    };

    const toggleSidebar = () => {
        setIsSideBarOpen((prevState) => !prevState);
    };

    return (
        <Container fluid className="p-4">
            <Row>
                <Col md={isSideBarOpen ? 2 : 1} className="p-0">
                    <SideBar isOpen={isSideBarOpen} toggleSidebar={toggleSidebar} username={username} />
                </Col>

                <Col md={isSideBarOpen ? 10 : 11} className="content-column">
                    <h2>Trendy v zdravotných záznamoch podľa špecializácie za rok</h2>
                    <Form.Group controlId="yearSelect" className="mb-3">
                        <Form.Label>Vyberte rok</Form.Label>
                        <div className="d-flex">
                            <Form.Control
                                type="number"
                                id="startDate"
                                value={year}
                                onChange={handleYearChange}
                                className="me-2"
                                min="1900"
                                max="2100"
                                placeholder="Zadajte rok"
                            />
                        </div>

                    </Form.Group>

                    {loading ? (
                        <div className="d-flex justify-content-center align-items-center" style={{height: '400px'}}>
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Načítavam...</span>
                            </Spinner>
                        </div>
                    ) : (
                        <>

                            <h3>Graf Trendov v Zdravotných Záznamoch</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis dataKey="NAZOV_SPECIALIZACIE"/>
                                    <YAxis/>
                                    <Tooltip/>
                                    <Legend/>
                                    <Line type="monotone" dataKey="pocet_zaznamov" stroke="#8884d8" activeDot={{r: 8}}/>
                                </LineChart>
                            </ResponsiveContainer>
                            <h3>Tabuľka údajov</h3>
                            <Table striped bordered hover>
                                <thead>
                                <tr>
                                    <th>Špecializácia</th>
                                    <th>Počet záznamov</th>
                                    <th>Percentuálny podiel</th>
                                    <th>Poradové číslo</th>
                                </tr>
                                </thead>
                                <tbody>
                                {data.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.NAZOV_SPECIALIZACIE}</td>
                                        <td>{item.pocet_zaznamov}</td>
                                        <td>{item.percentualny_podiel} %</td>
                                        <td>{item.poradove_cislo}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>

                            {/* Recharts LineChart */}
                        </>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default SpecializacieRok;
