import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import SideBar from './SideBar';
import { Col, Container, Row, Form, Table, Button, Spinner } from 'react-bootstrap';

interface DoctorPrescriptionItem {
    lekar: string;
    specializacia: string;
    rod_cislo: string;
    meno: string;
    priezvisko: string;
    prescriptions_count: number;
    doctor_rank: number;
    fullName?: string;
}

const ReceptyDoktor = () => {
    const [username, setUsername] = useState('');
    const [data, setData] = useState<DoctorPrescriptionItem[]>([]);
    const [isSideBarOpen, setIsSidebarOpen] = useState(true);
    const [startDate, setStartDate] = useState('2024-01-01');
    const [endDate, setEndDate] = useState('2024-12-31');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const toggleSidebar = () => setIsSidebarOpen(!isSideBarOpen);

    const topFiveData = data
        .sort((a, b) => b.prescriptions_count - a.prescriptions_count)
        .slice(0, 5)
        .map(item => ({
            ...item,
            fullName: `${item.meno} ${item.priezvisko}`
        }));

    useEffect(() => {
        fetchData(startDate, endDate);
    }, []);

    const fetchData = (start: string, end: string) => {
        setLoading(true);
        axios
            .get(`analysis/doctor_prescription_analysis/?start_date=${start}&end_date=${end}`)
            .then((response) => {
                console.log('Response from server:', response);
                setData(response.data.doctor_analysis);
                setUsername(response.data.username);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setError(error.message);
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
                        <h2>Analýza predpisovania receptov lekármi</h2>
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
                    {error && (
                        <div className="alert alert-danger">
                            Error loading data: {error}
                        </div>
                    )}
                    {loading ? (
                        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart
                                    data={topFiveData}
                                    margin={{
                                        top: 20,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="fullName" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="prescriptions_count" fill="#8884d8" name="Počet receptov" />
                                </BarChart>
                            </ResponsiveContainer>
                            <Table striped bordered hover className="mt-4">
                                <thead>
                                    <tr>
                                        <th style={{ width: '60px', textAlign: 'center' }}>Por.</th>
                                        <th>Meno a priezvisko</th>
                                        <th>Špecializácia</th>
                                        <th style={{ width: '120px', textAlign: 'center' }}>Počet receptov</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item, index) => (
                                        <tr key={index}>
                                            <td style={{ textAlign: 'center' }}>{item.doctor_rank}</td>
                                            <td>{`${item.meno} ${item.priezvisko}`}</td>
                                            <td>{item.specializacia}</td>
                                            <td style={{ textAlign: 'center' }}>{item.prescriptions_count}</td>
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

export default ReceptyDoktor;