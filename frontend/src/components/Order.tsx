import React, {useEffect, useState} from 'react';
import '../css/order.css';
import SideBar from "./SideBar";
import {Button, Col, Container, Form, Modal, Row} from "react-bootstrap";
import axios from "axios";
import {useNavigate} from "react-router-dom";

interface Appointment {
    reason: string;
    date: string;
    time: string;
    blocks: number;
    room: string;
    patient: string;
    day: string;
    doctor: string;
}

const Order: React.FC = () => {
    const [isSideBarOpen, setIsSidebarOpen] = useState(true);
    const toggleSidebar = () => setIsSidebarOpen(!isSideBarOpen);
    const [username, setUsername] = useState('');
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const toggleModal = () => setShowModal(!showModal);
    const AddOrder = () => {
        console.log('Add order');
        toggleModal();
        const newOrder = {
            reason: (document.querySelector('[name="dovod"]') as HTMLInputElement).value,
            patient: (document.querySelector('[name="patient"]') as HTMLInputElement).value,
            doctor: (document.querySelector('[name="doctor"]') as HTMLInputElement).value,
            room: (document.querySelector('[name="room"]') as HTMLInputElement).value,
            blocks: Number((document.querySelector('[name="blocks"]') as HTMLInputElement).value),
            date: (document.querySelector('[name="datum_objednavky"]') as HTMLInputElement).value,
            time: (document.querySelector('[name="cas_objednavky"]') as HTMLInputElement).value,
            day: new Date((document.querySelector('[name="datum_objednavky"]') as HTMLInputElement).value).toLocaleDateString('en-US', {weekday: 'long'})
        };

        axios.post('/last_order', newOrder, {withCredentials: true})
            .then(response => {
                console.log('Order added', response.data);
                //add new appointment to the timetable from this response
                setAppointments([...appointments, response.data.last_order]);

            })
            .catch(error => {
                console.error('Error adding order', error);
            });
    }

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const timeSlots = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
        "15:00", "15:30", "16:00", "16:30", "17:00"
    ];

    useEffect(() => {
        axios.get('/orders', {withCredentials: true})
            .then(response => {
                if (response.data.username) {
                    setUsername(response.data.username);
                } else if (response.data.error) {
                    console.error('Error fetching username', response.data.error);
                }
                setAppointments(response.data.appointments);

            })
            .catch(error => {
                console.error('Error fetching username', error);
                navigate('/login');
            });
    }, [navigate]);

    const coveredSlots: { [day: string]: { [time: string]: boolean } } = {};

    days.forEach(day => {
        coveredSlots[day] = {};
    });

    return (
        <Container fluid>
            <Row>
                <Col md={isSideBarOpen ? 2 : 1} className="p-0">
                    <SideBar isOpen={isSideBarOpen} toggleSidebar={toggleSidebar} username={username}/>
                </Col>
                <Col md={isSideBarOpen ? 10 : 11} className="content-column">
                    <div className="container">
                        <div className="text-center">
                            <div className="d-flex justify-content-between align-items-center">
                                <h1>Rozvrh {username}</h1>
                                <Button variant="primary" onClick={() => setShowModal(true)} className="mt-3">
                                    Add Order
                                </Button>
                            </div>
                            <Modal show={showModal} onHide={toggleModal}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Add New Order</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Form>
                                        <Form.Group controlId="formDovod">
                                            <Form.Label>Reason</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter reason for appointment"
                                                name="dovod"
                                            />
                                        </Form.Group>
                                        <Form.Group controlId="formPatient">
                                            <Form.Label>Pacient</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter patient name"
                                                name="patient"
                                            />
                                        </Form.Group>
                                        <Form.Group controlId="formDoctor">
                                            <Form.Label>Lekár</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter doctor name"
                                                name="doctor"
                                                value={username}
                                            />
                                        </Form.Group>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group controlId="formRoom">
                                                    <Form.Label>Miestnosť</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Enter room name"
                                                        name="room"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group controlId="formBlock">
                                                    <Form.Label>Pocet blokov</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        placeholder="Enter number of blocks"
                                                        name="blocks"
                                                        value="1"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group controlId="formDatum">
                                                    <Form.Label>Date</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        name="datum_objednavky"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group controlId="formTime">
                                                    <Form.Label>Time</Form.Label>
                                                    <Form.Control
                                                        type="time"
                                                        name="cas_objednavky"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={toggleModal}>
                                        Close
                                    </Button>
                                    <Button variant="primary" onClick={AddOrder}>
                                        Add Order
                                    </Button>
                                </Modal.Footer>
                            </Modal>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-bordered text-center">
                                <thead>
                                <tr className="bg-light-gray">
                                    <th className="text-uppercase">Time</th>
                                    {days.map((day, index) => (
                                        <th key={index} className="text-uppercase">{day}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {timeSlots.map((timeSlot, rowIndex) => (
                                    <tr key={rowIndex}>
                                        <td>{timeSlot}</td>
                                        {days.map((day, colIndex) => {
                                            if (coveredSlots[day][timeSlot]) {
                                                return <td key={colIndex}></td>;
                                            }
                                            const appointment = appointments.find(appt =>
                                                appt.day === day && appt.time === timeSlot
                                            );

                                            if (appointment) {
                                                // Označte nasledujúce bloky ako pokryté
                                                for (let i = 1; i < appointment.blocks; i++) {
                                                    const [hours, minutes] = timeSlot.split(':').map(Number);
                                                    const newMinutes = minutes + 30 * i;
                                                    let newHours = hours;
                                                    let newTime = '';

                                                    if (newMinutes >= 60) {
                                                        newHours += Math.floor(newMinutes / 60);
                                                        newTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes % 60).padStart(2, '0')}`;
                                                    } else {
                                                        newTime = `${String(hours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
                                                    }

                                                    const nextTimeSlot = `${newHours}:${String(newMinutes % 60).padStart(2, '0')}`;
                                                    coveredSlots[day][nextTimeSlot] = true;
                                                }
                                                return (
                                                    <td key={colIndex} rowSpan={appointment.blocks}
                                                        className="event-cell align-content-center">
                                                        <div className="event bg-sky">{appointment.patient}</div>
                                                        <div className="event-details">
                                                            {appointment.reason}
                                                        </div>
                                                        <div className="event-details">
                                                            {appointment.room}
                                                        </div>
                                                    </td>
                                                );
                                            }

                                            return <td key={colIndex}></td>;
                                        })}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default Order;
