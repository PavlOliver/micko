import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';
import {Container, Row, Col, Table, Spinner} from 'react-bootstrap';
import SideBar from "./SideBar";

interface PrescriptionData {
    mesiac: string;
    pocet_predpisov: number;
    percentualny_narast: number;
    poradove_cislo: number;
}

const ReceptyZaMesiac = () => {
    const [username, setUsername] = useState('');
    const [data, setData] = useState<PrescriptionData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSideBarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => setIsSidebarOpen(!isSideBarOpen);


    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        axios
            .get('/analysis/recepty_za_mesiac_narast')
            .then((response) => {
                setData(response.data);
                setUsername(response.data.username);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setLoading(false);
            });
    }

    return (
        <Container fluid className="p-4">
            <Row>
                <Col md={isSideBarOpen ? 2 : 1} className="p-0">
                    <SideBar isOpen={isSideBarOpen} toggleSidebar={toggleSidebar} username={username}/>
                </Col>
                <Col md={isSideBarOpen ? 10 : 11} className="content-column">
                    <h2>Nárast počtu predpísaných liekov</h2>
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
                                    <XAxis dataKey="mesiac"/>
                                    <YAxis label={{value: 'Počet predpisov', angle: -90, position: 'insideLeft'}}/>
                                    <Tooltip/>
                                    <Legend/>
                                    <Line type="monotone" dataKey="pocet_predpisov" stroke="#8884d8"
                                          name="Počet predpisov"/>
                                </LineChart>
                            </ResponsiveContainer>

                            <Table striped bordered hover className="mt-4">
                                <thead>
                                <tr>
                                    <th>Mesiac</th>
                                    <th>Počet predpisov</th>
                                    <th>Percentuálny nárast</th>
                                    <th>Poradové číslo</th>
                                </tr>
                                </thead>
                                <tbody>
                                {data.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.mesiac}</td>
                                        <td>{item.pocet_predpisov}</td>
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

export default ReceptyZaMesiac;
