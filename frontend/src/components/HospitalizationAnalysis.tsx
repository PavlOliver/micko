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
import SideBar from "./SideBar";
import { Col, Container, Row, Form, Table, Button } from "react-bootstrap";

interface HospAnalysisItem {
    meno: string;
    priezvisko: string;
    rod_cislo: string;
    pocet_dni: number;
    rank: number;
}

const HospitalizationBarChart = () => {
    const [username, setUsername] = useState('');
    const [data, setData] = useState<HospAnalysisItem[]>([]);
    const [isSideBarOpen, setIsSidebarOpen] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const toggleSidebar = () => setIsSidebarOpen(!isSideBarOpen);

    useEffect(() => {
        fetchData(startDate, endDate);
    }, []);

    const fetchData = (start: string, end: string) => {
        axios
            .get(`analysis/hosp_analysis?start_date=${start}&end_date=${end}`)
            .then((response) => {
                const transformedData = response.data.analysis.map((item: HospAnalysisItem) => ({
                    ...item,
                    fullName: `${item.meno} ${item.priezvisko}`,
                }));
                setData(transformedData);
                setUsername(response.data.username);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
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
                    <SideBar isOpen={isSideBarOpen} toggleSidebar={toggleSidebar} username={username}/>
                </Col>
                <Col md={isSideBarOpen ? 10 : 11} className="content-column">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2>Hospitalization Analysis</h2>
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
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                            data={data}
                            margin={{
                                top: 20,
                                bottom: 5,
                            }}>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="fullName"/>
                            <YAxis/>
                            <Tooltip/>
                            <Legend/>
                            <Bar dataKey="pocet_dni" fill="#8884d8" name="Počet dní"/>
                        </BarChart>
                    </ResponsiveContainer>
                    <Table striped bordered hover className="mt-4">
                        <thead>
                        <tr>
                            <th>Por. číslo</th>
                            <th>Meno</th>
                            <th>Priezvisko</th>
                            <th>Rodné číslo</th>
                            <th>Počet dní</th>
                        </tr>
                        </thead>
                        <tbody>
                        {data.map((item, index) => (
                            <tr key={index}>
                                <td>{item.rank}</td>
                                <td>{item.meno}</td>
                                <td>{item.priezvisko}</td>
                                <td>{item.rod_cislo}</td>
                                <td>{item.pocet_dni}</td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    );
};

export default HospitalizationBarChart;