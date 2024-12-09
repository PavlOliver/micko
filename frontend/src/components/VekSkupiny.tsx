import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer} from 'recharts';
import SideBar from './SideBar'; // Predpokladám, že máš komponent SideBar
import {Col, Container, Row, Table} from 'react-bootstrap';

interface AgeGroupData {
    vekova_skupina: string;
    pocet_pacientov: number;
    percentualny_podiel: number;
    poradove_cislo: number;
}

const VekoveSkupiny: React.FC = () => {
    const [ageGroups, setAgeGroups] = useState<AgeGroupData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isSideBarOpen, setIsSideBarOpen] = useState<boolean>(false); // Stav pre bočný panel
    const [username, setUsername] = useState<string>(''); // Používateľské meno (prípadne z tokenu alebo iného zdroja)

    useEffect(() => {
        const fetchAgeGroups = async () => {
            try {
                const response = await axios.get('/analysis/vekove-skupiny');
                setAgeGroups(response.data);
            } catch (error) {
                console.error("Chyba pri načítavaní dát vekových skupín", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAgeGroups();
    }, []);


    if (ageGroups.length === 0) return <p>Načítavam dáta...</p>;

    // Príprava dát pre graf
    const chartData = ageGroups.map((item: any) => ({
        vekova_skupina: item.vekova_skupina,
        pocet_pacientov: item.pocet_pacientov,
        percentualny_podiel: item.percentualny_podiel,
    }));

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6347', '#32CD32'];
    const toggleSidebar = () => setIsSideBarOpen(!isSideBarOpen);

    return (
        <Container fluid className="p-4">
            <Row>
                {/* Bočný panel */}
                <Col md={isSideBarOpen ? 2 : 1} className="p-0">
                    <SideBar isOpen={isSideBarOpen} toggleSidebar={toggleSidebar} username={username}/>
                </Col>

                {/* Hlavný obsah */}
                <Col md={isSideBarOpen ? 10 : 11} className="content-column">
                    <h2>Vekové skupiny pacientov (Koláčový graf)</h2>
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                dataKey="pocet_pacientov"
                                nameKey="vekova_skupina"
                                cx="50%"
                                cy="50%"
                                outerRadius={150}
                                fill="#8884d8"
                                label
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                ))}
                            </Pie>
                            <Tooltip/>
                            <Legend/>
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Tabuľka pod grafom */}
                    <h3 className="mt-4">Podrobné údaje</h3>
                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Veková skupina</th>
                            <th>Počet pacientov</th>
                            <th>Percentuálny podiel</th>
                        </tr>
                        </thead>
                        <tbody>
                        {ageGroups.map((item, index) => (
                            <tr key={index}>
                                <td>{item.poradove_cislo}</td>
                                <td>{item.vekova_skupina}</td>
                                <td>{item.pocet_pacientov}</td>
                                <td>
                                    {item.percentualny_podiel ?
                                        parseFloat(item.percentualny_podiel.toString()).toFixed(2) :
                                        "0.00"
                                    } %
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    );
};
export default VekoveSkupiny;
