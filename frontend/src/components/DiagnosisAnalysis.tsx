import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {
    PieChart,
    Pie,
    Tooltip,
    Cell,
    ResponsiveContainer,
} from 'recharts';
import SideBar from './SideBar';
import {Col, Container, Row, Form, Table, Button, Spinner} from 'react-bootstrap';

interface DiagnosisAnalysisItem {
    kod_diagnozy: string;
    choroba: string;
    pacienti: string;
    pocet_pacientov: number;
}

const DiagnosisAnalysis = () => {
    const [username, setUsername] = useState('');
    const [data, setData] = useState<DiagnosisAnalysisItem[]>([]);
    const [prevYearData, setPrevYearData] = useState<DiagnosisAnalysisItem[]>([]);
    const [isSideBarOpen, setIsSidebarOpen] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [loading, setLoading] = useState(true);

    const toggleSidebar = () => setIsSidebarOpen(!isSideBarOpen);

    useEffect(() => {
        fetchData(year);
    }, [year]);

    const fetchData = (year: string) => {
        axios.get(`analysis/diagnosis_analysis?year=${year}`)
            .then((response) => {
                setData(response.data.analysis);
                setUsername(response.data.username);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setLoading(false);
            });

        const prevYear = (parseInt(year) - 1).toString();
        axios
            .get(`analysis/diagnosis_analysis?year=${prevYear}`)
            .then((response) => {
                setPrevYearData(response.data.analysis);
            })
            .catch((error) => {
                console.error('Error fetching previous year data:', error);
            });
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setYear(e.target.value);
    };

    const handleRefresh = () => {
        setLoading(true);
        fetchData(year);
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#A569BD', '#F39C12'];

    const renderCustomLabel = (entry: DiagnosisAnalysisItem) => {
        return entry.kod_diagnozy;
    };

    return (
        <Container fluid className="p-4">
            <Row>
                <Col md={isSideBarOpen ? 2 : 1} className="p-0">
                    <SideBar isOpen={isSideBarOpen} toggleSidebar={toggleSidebar} username={username}/>
                </Col>
                <Col md={isSideBarOpen ? 10 : 11} className="content-column">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2>Diagnosis Analysis</h2>
                        <Form.Group>
                            <Form.Label>Select Year</Form.Label>
                            <Form.Control
                                type="text"
                                value={year}
                                onChange={handleYearChange}
                                placeholder="Enter year"
                            />
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
                            <Row>
                                <Col md={6}>
                                    <h3>Previous Year Analysis</h3>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <PieChart>
                                            <Pie
                                                data={prevYearData}
                                                dataKey="pocet_pacientov"
                                                nameKey="choroba"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={150}
                                                fill="#8884d8"
                                                label={renderCustomLabel}
                                            >
                                                {prevYearData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                                ))}
                                            </Pie>
                                            <Tooltip/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Col>
                                <Col md={6}>
                                    <h3>Current Year Analysis</h3>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <PieChart>
                                            <Pie
                                                data={data}
                                                dataKey="pocet_pacientov"
                                                nameKey="choroba"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={150}
                                                fill="#8884d8"
                                                label={renderCustomLabel}
                                            >
                                                {data.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                                ))}
                                            </Pie>
                                            <Tooltip/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Col>
                            </Row>
                            <Table striped bordered hover className="mt-4">
                                <thead>
                                <tr>
                                    <th>Diagnosis Code</th>
                                    <th>Diagnosis</th>
                                    <th>Patients</th>
                                    <th>Number of Patients</th>
                                </tr>
                                </thead>
                                <tbody>
                                {data.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.kod_diagnozy}</td>
                                        <td>{item.choroba}</td>
                                        <td>{item.pacienti}</td>
                                        <td>{item.pocet_pacientov}</td>
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

export default DiagnosisAnalysis;