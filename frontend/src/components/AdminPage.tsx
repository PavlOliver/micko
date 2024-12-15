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

  useEffect(() => {
    axios
      .get('/home', { withCredentials: true })
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
      .get('/employees-not-users', { withCredentials: true })
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
      .get('/user-management', { withCredentials: true })
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
      .post('/user-management', formData, { withCredentials: true })
      .then(response => {
        setMessage('Používateľ vytvorený úspešne');
        fetchData();
        setFormData({ id_zamestnanca: '', login: '', heslo: '', rola: '' });
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
        <Col
          md={9}
          className="p-4"
          style={{
            marginLeft: isSideBarOpen ? '250px' : '60px',
            transition: 'margin-left 0.3s'
          }}
        >
          <h2>Správa používateľov</h2>
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
          <hr className="my-2" />

          {viewOption === 'employees-not-users' && (
            <>
              <h3>Vytvorenie nového používateľa</h3>
              <Form onSubmit={handleSubmit}>
                <Form.Group>
                  <Form.Label>ID Zamestnanca</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.id_zamestnanca}
                    onChange={e =>
                      setFormData({ ...formData, id_zamestnanca: e.target.value })
                    }
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default AdminPage;