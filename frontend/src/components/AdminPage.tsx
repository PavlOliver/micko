import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import SideBar from './SideBar';

interface Employee {
    id_zamestnanca: string;
    meno: string;
    priezvisko: string;
    specializacia: string;
}

const AdminPage: React.FC = () => {
    const [isSideBarOpen, setIsSidebarOpen] = useState(true);
    const [username, setUsername] = useState('');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [formData, setFormData] = useState({
        id_zamestnanca: '',
        login: '',
        heslo: '',
        rola: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        axios.get('/home', { withCredentials: true })
            .then(response => {
                setUsername(response.data.username);
            })
            .catch(error => {
                console.error('Error fetching username:', error);
            });

        fetchEmployees();
    }, []);

    useEffect(() => {
        if (message || error) {
            const timer = setTimeout(() => {
                if (message) setMessage('');
                if (error) setError('');
            }, 2200);
            return () => clearTimeout(timer);
        }
    }, [message, error]);

    const fetchEmployees = () => {
        axios.get('/employees-not-users', { withCredentials: true })
            .then(response => {
                console.log('Received employees:', response.data.employees);
                setEmployees(response.data.employees);
            })
            .catch(error => {
                setError('Failed to load employees');
            });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        axios.post('/user-management', formData, { withCredentials: true })
            .then(response => {
                setMessage('Používateľ vytvorený úspešne');
                fetchEmployees();
                setFormData({ id_zamestnanca: '', login: '', heslo: '', rola: '' });
            })
            .catch(error => {
                setError('Vytvorenie nového používateľa zlyhalo');
            });
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSideBarOpen);
    };

    return (
        <Container fluid>
            <Row style={{ height: '100vh' }}>
                <Col md={3} className="p-0">
                    <SideBar
                        isOpen={isSideBarOpen}
                        toggleSidebar={toggleSidebar}
                        username={username}
                    />
                </Col>
                <Col md={9} className="p-4" style={{
                    marginLeft: isSideBarOpen ? '250px' : '60px',
                    transition: 'margin-left 0.3s'
                }}>
                    <h2>Správa používateľov</h2>
                    {message && <Alert variant="success">{message}</Alert>}
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group>
                            <Form.Label>ID Zamestnanca</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.id_zamestnanca}
                                onChange={e => setFormData({ ...formData, id_zamestnanca: e.target.value })}
                                required
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Login</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.login}
                                onChange={e => setFormData({ ...formData, login: e.target.value })}
                                required
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Heslo</Form.Label>
                            <Form.Control
                                type="password"
                                value={formData.heslo}
                                onChange={e => setFormData({ ...formData, heslo: e.target.value })}
                                required
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Rola</Form.Label>
                            <Form.Control
                                as="select"
                                value={formData.rola}
                                onChange={e => setFormData({ ...formData, rola: e.target.value })}
                                required
                            >
                                <option value="">Zvoľ rolu...</option>
                                <option value="A">Admin</option>
                                <option value="L">Lekár</option>
                            </Form.Control>
                        </Form.Group>

                        <Button type="submit" variant="primary">Vytvor používateľa</Button>
                    </Form>

                    <h3 className="mt-4">Zamestnanci, ktorí ešte nie sú používateľmi</h3>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID Zamestnanca</th>
                                <th>Meno</th>
                                <th>Priezvisko</th>
                                <th>Špecializácia</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map(employee => (
                                <tr key={employee.id_zamestnanca}>
                                    <td>{employee.id_zamestnanca}</td>
                                    <td>{employee.meno}</td>
                                    <td>{employee.priezvisko}</td>
                                    <td>{employee.specializacia}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminPage;