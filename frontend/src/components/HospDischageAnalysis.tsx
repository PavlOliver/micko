import React, {useEffect, useState} from 'react';
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
import {Col, Container, Row, Table, Spinner} from 'react-bootstrap';

interface HospitalizationData {
    year: number;
    total_hospitalizations: number;
    total_discharges: number;
}

const HospDischargeAnalysis = () => {
    const [username, setUsername] = useState('');
    const [data, setData] = useState<HospitalizationData[]>([]);
    const [isSideBarOpen, setIsSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);

    const toggleSidebar = () => setIsSidebarOpen(!isSideBarOpen);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        axios
            .get('/analysis/hosp_discharge_analysis')
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

    return (
        <Container fluid className="p-4">
            <Row>
                <Col md={isSideBarOpen ? 2 : 1} className="p-0">
                    <SideBar isOpen={isSideBarOpen} toggleSidebar={toggleSidebar} username={username}/>
                </Col>
                <Col md={isSideBarOpen ? 10 : 11} className="content-column">
                    <h2>Hospitalization and Discharge Analysis</h2>
                    {loading ? (
                        <div className="d-flex justify-content-center align-items-center" style={{height: '400px'}}>
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis dataKey="year"/>
                                    <YAxis label={{value: "Count", angle: -90, position: "insideLeft"}}/>
                                    <Tooltip/>
                                    <Legend/>
                                    <Line
                                        type="monotone"
                                        dataKey="total_hospitalizations"
                                        stroke="#8884d8"
                                        name="Total Hospitalizations"
                                        dot={{r: 0}}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="total_discharges"
                                        stroke="#82ca9d"
                                        name="Total Discharges"
                                        dot={{r: 0}}
                                    />
                                </LineChart>
                            </ResponsiveContainer>

                            <Table striped bordered hover className="mt-4">
                                <thead>
                                <tr>
                                    <th>Rok</th>
                                    <th>Počet prijatých pacientov</th>
                                    <th>Počet prepustených pacientov</th>
                                </tr>
                                </thead>
                                <tbody>
                                {[...data].reverse().map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.year}</td>
                                        <td>{item.total_hospitalizations}</td>
                                        <td>{item.total_discharges}</td>
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

export default HospDischargeAnalysis;