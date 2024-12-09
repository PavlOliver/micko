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
    ResponsiveContainer,
} from 'recharts';
import SideBar from './SideBar';
import { Col, Container, Row, Form, Table, Button, Spinner } from 'react-bootstrap';

interface PrescriptionData {
    month_year: string;
    id_poistenca: string;
    meno: string;
    priezvisko: string;
    prescription_count: number;
    patient_order: number;
}

const ReceptyMonthly = () => {
    const [username, setUsername] = useState('');
    const [data, setData] = useState<PrescriptionData[]>([]);
    const [isSideBarOpen, setIsSidebarOpen] = useState(true);
    const [startDate, setStartDate] = useState('2024-01-01');
    const [endDate, setEndDate] = useState('2024-12-31');
    const [loading, setLoading] = useState(true);

    const toggleSidebar = () => setIsSidebarOpen(!isSideBarOpen);

    useEffect(() => {
        fetchData(startDate, endDate);
    }, []);

    const fetchData = (start: string, end: string) => {
        setLoading(true);
        axios
            .get(`/analysis/prescription_monthly_analysis/?start_date=${start}&end_date=${end}`)
            .then((response) => {
                setData(response.data.prescription_analysis);
                setUsername(response.data.username);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setLoading(false);
            });
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        if (id === 'startDate') {
            setStartDate(value);
        } else if (id === 'endDate') {
            setEndDate(value);
        }
    };

    const handleRefresh = () => {
        fetchData(startDate, endDate);
    };

    return (
        <Container fluid className="p-4">
            <Row>
                <Col md={isSideBarOpen ? 2 : 1} className="p-0">
                    <SideBar isOpen={isSideBarOpen} toggleSidebar={toggleSidebar} username={username} />
                </Col>
                <Col md={isSideBarOpen ? 10 : 11} className="content-column">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2>Pacienti ktorý majú najviac receptov za mesiac</h2>
                        <Form.Group>
                            <Form.Label>Vyber rozsah dátumu</Form.Label>
                            <div className="d-flex">
                                <Form.Control
                                    type="date"
                                    id="startDate"
                                    value={startDate}
                                    onChange={handleDateChange}
                                    className="me-2"
                                />
                                <Form.Control
                                    type="date"
                                    id="endDate"
                                    value={endDate}
                                    onChange={handleDateChange}
                                />
                            </div>
                        </Form.Group>
                        <Button onClick={handleRefresh} className="ms-2">
                            Refresh
                        </Button>
                    </div>
                    {loading ? (
                        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month_year" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="prescription_count"
                                        stroke="#8884d8"
                                        name="Počet receptov"
                                    />
                                </LineChart>
                            </ResponsiveContainer>

                            <Table striped bordered hover className="mt-4">
                                <thead>
                                <tr>
                                    <th>Rok-Mesiac Poradie</th>
                                    <th>Číslo poistenca</th>
                                    <th>Poradie</th>
                                    <th>Meno Priezvisko</th>
                                    <th>Predpísaných receptov</th>

                                </tr>
                                </thead>
                                <tbody>
                                    {data.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.month_year}</td>
                                            <td>{item.id_poistenca}</td>
                                            <td>{item.patient_order}</td>
                                            <td>{item.meno} {item.priezvisko}</td>
                                            <td>{item.prescription_count}</td>
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

export default ReceptyMonthly;