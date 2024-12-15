import React, {useState, useEffect} from 'react';
import {Container, Row, Col, Form, Button, Alert, Modal} from 'react-bootstrap';
import axios from 'axios';
import SideBar from './SideBar';

interface Employee {
    id_zamestnanca: string;
    meno: string;
    priezvisko: string;
    specializacia: string;
}

interface User {
    login: string;
    id_zamestnanca: string;
    meno: string;
    priezvisko: string;
    rola: string;
}

const AdminPage: React.FC = () => {
    const [isSideBarOpen, setIsSidebarOpen] = useState(true);
    const [username, setUsername] = useState('');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [formData, setFormData] = useState({
        id_zamestnanca: '',
        login: '',
        heslo: '',
        rola: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [viewOption, setViewOption] = useState('employees-not-users');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState<User>({
        login: '',
        id_zamestnanca: '',
        meno: '',
        priezvisko: '',
        rola: ''
    });

    useEffect(() => {
        axios
            .get('/home', {withCredentials: true})
            .then(response => {
                setUsername(response.data.username);
            })
            .catch(error => {
                console.error('Error fetching username:', error);
            });
    }, []);

    useEffect(() => {
        fetchData();
    }, [viewOption]);

    useEffect(() => {
        if (message || error) {
            const timer = setTimeout(() => {
                if (message) setMessage('');
                if (error) setError('');
            }, 2200);
            return () => clearTimeout(timer);
        }
    }, [message, error]);

    const fetchData = () => {
        if (viewOption === 'employees-not-users') {
            fetchEmployees();
        } else if (viewOption === 'users') {
            fetchUsers();
        }
    };

    const fetchEmployees = () => {
        axios
            .get('/employees-not-users', {withCredentials: true})
            .then(response => {
                console.log('Received employees:', response.data.employees);
                setEmployees(response.data.employees);
                setUsers([]);
            })
            .catch(error => {
                setError('Failed to load employees');
            });
    };

    const fetchUsers = () => {
        axios
            .get('/user-management', {withCredentials: true})
            .then(response => {
                console.log('Received users:', response.data.users);
                setUsers(response.data.users);
                setEmployees([]);
            })
            .catch(error => {
                setError('Failed to load users');
            });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        axios
            .post('/user-management', formData, {withCredentials: true})
            .then(response => {
                setMessage('Používateľ vytvorený úspešne');
                fetchData();
                setFormData({id_zamestnanca: '', login: '', heslo: '', rola: ''});
            })
            .catch(error => {
                setError('Vytvorenie nového používateľa zlyhalo');
            });
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSideBarOpen);
    };

    const getFullRoleName = (abbreviation: string) => {
        switch (abbreviation) {
            case 'A':
                return 'Admin';
            case 'L':
                return 'Lekár';
            default:
                return abbreviation;
        }
    };

    const handleEdit = (user: User) => {
        setEditFormData(user);
        setShowEditModal(true);
    };

    const handleDelete = (login: string) => {
        if (window.confirm(`Naozaj chcete vymazať používateľa ${login}?`)) {
            axios
                .delete(`/user-management/${login}`, {withCredentials: true})
                .then(response => {
                    setMessage('Používateľ vymazaný');
                    fetchData();
                })
                .catch(error => {
                    setError('Vymazanie používateľa zlyhalo');
                });
        }
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        axios
            .put(`/user-management/${editFormData.login}`, editFormData, {withCredentials: true})
            .then(response => {
                setMessage('Používateľ upravený úspešne');
                fetchData();
                setShowEditModal(false);
            })
            .catch(error => {
                setError('Úprava používateľa zlyhala');
            });
    };

    return (
        <Container fluid>
            <Row style={{height: '100vh'}}>
                <Col md={isSideBarOpen ? 2 : 1} className="p-0">
                    <SideBar
                        isOpen={isSideBarOpen}
                        toggleSidebar={toggleSidebar}
                        username={username}
                    />
                </Col>

                <Col md={isSideBarOpen ? 10 : 11} className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h2>Správa používateľov</h2>
                    </div>
                    {message && <Alert variant="success">{message}</Alert>}
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form>
                        <Form.Group>
                            <Form.Label>Zobraziť</Form.Label>
                            <Form.Control
                                as="select"
                                value={viewOption}
                                onChange={e => setViewOption(e.target.value)}
                            >
                                <option value="employees-not-users">Zamestnanci bez používateľského konta</option>
                                <option value="users">Existujúci používatelia</option>
                            </Form.Control>
                        </Form.Group>
                    </Form>
                    <hr className="my-2"/>

                    {viewOption === 'employees-not-users' && (
                        <>
                            <h3>Vytvorenie nového používateľa</h3>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={2}>ID Zamestnanca</Form.Label>
                                    <Col sm={6}>
                                        <Form.Control
                                            type="text"
                                            value={formData.id_zamestnanca}
                                            onChange={e => setFormData({...formData, id_zamestnanca: e.target.value})}
                                            required
                                        />
                                    </Col>
                                </Form.Group>

                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={2}>Login</Form.Label>
                                    <Col sm={6}>
                                        <Form.Control
                                            type="text"
                                            value={formData.login}
                                            onChange={e => setFormData({...formData, login: e.target.value})}
                                            required
                                        />
                                    </Col>
                                </Form.Group>

                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={2}>Heslo</Form.Label>
                                    <Col sm={6}>
                                        <Form.Control
                                            type="password"
                                            value={formData.heslo}
                                            onChange={e => setFormData({...formData, heslo: e.target.value})}
                                            required
                                        />
                                    </Col>
                                </Form.Group>

                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={2}>Rola</Form.Label>
                                    <Col sm={6}>
                                        <Form.Control
                                            as="select"
                                            value={formData.rola}
                                            onChange={e => setFormData({...formData, rola: e.target.value})}
                                            required
                                        >
                                            <option value="">Zvoľ rolu...</option>
                                            <option value="A">Admin</option>
                                            <option value="L">Lekár</option>
                                        </Form.Control>
                                    </Col>
                                </Form.Group>

                                <Button type="submit" variant="primary" className="mt-3">
                                    Vytvor používateľa
                                </Button>
                            </Form>

                            <h3 className="mt-4">Zamestnanci bez používateľského konta</h3>
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
                        </>
                    )}

                    {viewOption === 'users' && (
                        <>
                            <h3 className="mt-4">Existujúci používatelia</h3>
                            <table className="table">
                                <thead>
                                <tr>
                                    <th>Login</th>
                                    <th>ID Zamestnanca</th>
                                    <th>Meno</th>
                                    <th>Priezvisko</th>
                                    <th>Rola</th>
                                    <th>Akcie</th>
                                </tr>
                                </thead>
                                <tbody>
                                {users.map(user => (
                                    <tr key={user.login}>
                                        <td>{user.login}</td>
                                        <td>{user.id_zamestnanca}</td>
                                        <td>{user.meno}</td>
                                        <td>{user.priezvisko}</td>
                                        <td>{getFullRoleName(user.rola)}</td>
                                        <td>
                                            <Button
                                                variant="warning"
                                                size="sm"
                                                onClick={() => handleEdit(user)}
                                            >
                                                Upraviť
                                            </Button>{' '}
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDelete(user.login)}
                                            >
                                                Vymazať
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </Col>
            </Row>

            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Upraviť Používateľa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleEditSubmit}>
                        <Form.Group>
                            <Form.Label>Login</Form.Label>
                            <Form.Control type="text" value={editFormData.login} readOnly/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Meno</Form.Label>
                            <Form.Control
                                type="text"
                                value={editFormData.meno}
                                onChange={e => setEditFormData({...editFormData, meno: e.target.value})}
                                required
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Priezvisko</Form.Label>
                            <Form.Control
                                type="text"
                                value={editFormData.priezvisko}
                                onChange={e => setEditFormData({...editFormData, priezvisko: e.target.value})}
                                required
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Rola</Form.Label>
                            <Form.Control
                                as="select"
                                value={editFormData.rola}
                                onChange={e => setEditFormData({...editFormData, rola: e.target.value})}
                                required
                            >
                                <option value="A">Admin</option>
                                <option value="L">Lekár</option>
                            </Form.Control>
                        </Form.Group>
                        <Button variant="primary" type="submit" className="mt-3">
                            Uložiť Zmeny
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default AdminPage;