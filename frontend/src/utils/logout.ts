// frontend/src/utils/logout.ts
import axios from 'axios';

export const handleLogout = () => {
    axios.post('/logout')
        .then(response => {
            window.location.href = '/login';
        })
        .catch(error => {
            console.error('There was an error logging out!', error);
        });
};