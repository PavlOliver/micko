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
import {Col, Container, Row} from "react-bootstrap";

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
    const toggleSidebar = () => setIsSidebarOpen(!isSideBarOpen);

    useEffect(() => {
        axios
            .get('http://localhost:5000/analysis/hosp_analysis')
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
    }, []);

    return (
        <Container fluid>
            <Row style={{height: '100vh'}}>
                <Col md={3} className="p-0">
                    <SideBar isOpen={isSideBarOpen} toggleSidebar={toggleSidebar} username={username}/>
                </Col>
                <Col md={9} className="p-4"
                     style={{marginLeft: isSideBarOpen ? '250px' : '60px', transition: 'margin-left 0.3s'}}>

                    <div className="d-flex">
                        <div className="flex-grow-1">
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart
                                    data={data}
                                    margin={{
                                        top: 20,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis dataKey="fullName"/>
                                    <YAxis/>
                                    <Tooltip/>
                                    <Legend/>
                                    <Bar dataKey="pocet_dni" fill="#8884d8" name="Počet dní"/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}
export default HospitalizationBarChart;
