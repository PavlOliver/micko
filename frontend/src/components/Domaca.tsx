import React from 'react';
import { Button, Navbar, Nav } from 'react-bootstrap';

const App: React.FC = () => {
    return (
        <div>
            <Navbar bg="light" expand="lg">
                <Navbar.Brand href="#home">React-Bootstrap</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="#home">Home</Nav.Link>
                        <Nav.Link href="#link">Link</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>

            <div className="container mt-4">
                <h1>Hello, React-Bootstrap!</h1>
                <Button variant="primary">Click Me</Button>
            </div>
        </div>
    );
};

export default App;
