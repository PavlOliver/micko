import React, {useEffect, useState} from 'react';
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
import SideBar from "./SideBar";
import {Col, Container, Row, Form, Table, Button, Spinner} from "react-bootstrap";

interface AppointmentAnalysisItem {
    lekar: string;
    total_orders: number;
    doctor_rank: number;
}

const AppointmentAnalysis = () => {
    const [username, setUsername] = useState('');
    const [data, setData] = useState<AppointmentAnalysisItem[]>([]);
    const [isSideBarOpen, setIsSidebarOpen] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(true);


    const toggleSidebar = () => setIsSidebarOpen(!isSideBarOpen);

    useEffect(() => {
        fetchData(startDate, endDate);
    }, []);

    const fetchData = (start: string, end: string) => {
        axios
            .get(`analysis/appointment_analysis?start_date=${start}&end_date=${end}`)
            .then((response) => {
                setData(response.data.analysis);
                setUsername(response.data.username);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setLoading(false);
            });
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {id, value} = e.target;
        if (id === 'startDate') {
            setStartDate(value);
        } else if (id === 'endDate') {
            setEndDate(value);
        }
    };

    const handleRefresh = () => {
        fetchData(startDate, endDate);
        setLoading(true);
    };

    return (
        <Container fluid className="p-4">
            <Row>
                <Col md={isSideBarOpen ? 2 : 1} className="p-0">
                    <SideBar isOpen={isSideBarOpen} toggleSidebar={toggleSidebar} username={username}/>
                </Col>
                <Col md={isSideBarOpen ? 10 : 11} className="content-column">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2>Appointment Analysis</h2>
                        <Form.Group>
                            <Form.Label>Select Date Range</Form.Label>
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
                        <Button onClick={handleRefresh} className="ms-2">Refresh</Button>
                    </div>
                    {loading ? (
                        <div className="d-flex justify-content-center align-items-center" style={{height: '400px'}}>
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart
                                    data={data}
                                    margin={{
                                        top: 20,
                                        bottom: 5,
                                    }}>
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis dataKey="lekar"/>
                                    <YAxis/>
                                    <Tooltip/>
                                    <Legend/>
                                    <Bar dataKey="total_orders" fill="#8884d8" name="Total Orders"/>
                                </BarChart>
                            </ResponsiveContainer>
                            <Table striped bordered hover className="mt-4">
                                <thead>
                                <tr>
                                    <th>Doctor</th>
                                    <th>Total Orders</th>
                                    <th>Rank</th>
                                </tr>
                                </thead>
                                <tbody>
                                {data.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.lekar}</td>
                                        <td>{item.total_orders}</td>
                                        <td>{item.doctor_rank}</td>
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

export default AppointmentAnalysis;