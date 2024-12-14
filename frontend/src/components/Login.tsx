import React, {useState} from 'react';
import axios from 'axios';
import {useNavigate} from "react-router-dom";
import { useUser } from '../context/UserContext';

const Login: React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { setCurrentUser } = useUser();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post('/login', {
                username: username,
                password: password,
            });

            if (response.status === 200) {
                setCurrentUser({
                    id: response.data.id,
                    login: response.data.username,
                    rola: response.data.rola
                });
                navigate('/home');
            }
        } catch (error) {
            setError('Invalid username or password');
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4" style={{width: '400px'}}>
                <h3 className="text-center mb-4">Prihlásenie do NIS</h3>
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label">Používateľské meno</label>
                        <input
                            type="text"
                            id="username"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Heslo</label>
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;