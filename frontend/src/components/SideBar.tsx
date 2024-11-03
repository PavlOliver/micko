import React from 'react';
import { Nav, Button } from 'react-bootstrap';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const SideBar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  return (
    <div
      className={`bg-light p-3 shadow`}
      style={{
        width: isOpen ? '250px' : '60px',
        height: '100vh',
        transition: 'width 0.3s',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000,
      }}
    >
      <Button variant="link" className="text-decoration-none mb-4" onClick={toggleSidebar}>
        <i className={`bi ${isOpen ? "bi-chevron-left" : "bi-list"}`}></i>
      </Button>

      <Nav defaultActiveKey="/home" className="flex-column">
        <Nav.Link href="/" className={`text-nowrap ${isOpen ? '' : 'text-center'}`}>
          <i className="bi bi-house"></i>
          {isOpen && <span className="ms-2">Domov</span>}
        </Nav.Link>
        <Nav.Link href="/patients" className={`text-nowrap ${isOpen ? '' : 'text-center'}`}>
          <i className="bi bi-person"></i>
          {isOpen && <span className="ms-2">Pacienti</span>}
        </Nav.Link>
        <Nav.Link href="/hospitalizations" className={`text-nowrap ${isOpen ? '' : 'text-center'}`}>
          <i className="bi bi-hospital"></i>
          {isOpen && <span className="ms-2">Hospitalizácie</span>}
        </Nav.Link>
        <Nav.Link href="/examinations" className={`text-nowrap ${isOpen ? '' : 'text-center'}`}>
          <i className="bi bi-file-earmark-text"></i>
          {isOpen && <span className="ms-2">Vyšetrenia</span>}
        </Nav.Link>
        <Nav.Link href="/staff" className={`text-nowrap ${isOpen ? '' : 'text-center'}`}>
          <i className="bi bi-person-check"></i>
          {isOpen && <span className="ms-2">Zamestnanci</span>}
        </Nav.Link>
        <Nav.Link href="/schedule" className={`text-nowrap ${isOpen ? '' : 'text-center'}`}>
          <i className="bi bi-calendar"></i>
          {isOpen && <span className="ms-2">Rozvrh miestností</span>}
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default SideBar;
