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
    id: number;
}

const Order: React.FC = () => {
    const [username, setUsername] = useState('');
    const [blocks, setBlocks] = useState(1);
    const [doctorName, setDoctorName] = useState(username);
    const [isSideBarOpen, setIsSidebarOpen] = useState(true);
    const toggleSidebar = () => setIsSidebarOpen(!isSideBarOpen);
    const navigate = useNavigate();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [weekNumber, setWeekNumber] = useState(0);
    const [year, setYear] = useState(new Date().getFullYear());
    const [mondayDate, setMondayDate] = useState('');
    const [sundayDate, setSundayDate] = useState('');
    const toggleAddModal = () => setShowAddModal(!showAddModal);
    const toggleEditModal = () => setShowEditModal(!showEditModal);
    const [patientInput, setPatientInput] = useState('');
    const [roomInput, setRoomInput] = useState('');
    const [patientSuggestions, setPatientSuggestions] = useState<string[]>([]);
    const [doctorSuggestions, setDoctorSuggestions] = useState<string[]>([]);
    const [roomSuggestions, setRoomSuggestions] = useState<string[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const timeSlots = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
        "15:00", "15:30", "16:00", "16:30", "17:00"
    ];
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];


    useEffect(() => {
        axios.get('/orders', {withCredentials: true})
            .then(response => {
                if (response.data.username) {
                    setUsername(response.data.username);
                    setDoctorName(response.data.username);
                    setWeekNumber(response.data.week);
                    setMondayDate(response.data.monday);
                    setSundayDate(response.data.sunday);
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

    const handlePatientInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPatientInput(value);
        if (value.length >= 3) {
            axios.get(`/patients_list?query=${value}`)
                .then(response => {
                    const suggestions = response.data.patients.filter((patient: string) =>
                        patient.toLowerCase().includes(value.toLowerCase())
                    );
                    setPatientSuggestions(suggestions);
                })
                .catch(error => {
                    console.error('Error fetching patient list', error);
                });
        } else {
            setPatientSuggestions([]);
        }
    };

    const handleRoomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setRoomInput(value);
        if (value.length >= 3) {
            axios.get(`/rooms_list?query=${value}`)
                .then(response => {
                    setRoomSuggestions(response.data.rooms);
                })
                .catch(error => {
                    console.error('Error fetching room list', error);
                });
        } else {
            setRoomSuggestions([]);
        }
    }

    const AddOrder = () => {
        toggleAddModal();
        const newOrder = {
            reason: (document.querySelector('[name="dovod"]') as HTMLInputElement).value,
            patient: patientInput,
            doctor: (document.querySelector('[name="doctor"]') as HTMLInputElement).value,
            room: (document.querySelector('[name="room"]') as HTMLInputElement).value,
            blocks: Number((document.querySelector('[name="blocks"]') as HTMLInputElement).value),
            date: (document.querySelector('[name="datum_objednavky"]') as HTMLInputElement).value,
            time: `${(document.querySelector('[name="hours"]') as HTMLInputElement).value}:${(document.querySelector('[name="minutes"]') as HTMLInputElement).value}`,
            day: new Date((document.querySelector('[name="datum_objednavky"]') as HTMLInputElement).value).toLocaleDateString('en-US', {weekday: 'long'})
        };

        axios.post('/orders', newOrder, {withCredentials: true})
            .then(response => {
                if (response.data.last_order) {
                    setAppointments([...appointments, response.data.last_order]);
                }
            })
            .catch(error => {
                console.error('Error adding order', error);
            });
    };

    const editOrder = (id: string) => {
        toggleEditModal();
        const appointment = appointments.find(appt => appt.id.toString() === id);
        if (!appointment) {
            console.error('Appointment not found', id);
            return;
        }

        setTimeout(() => {
            const dovodElement = document.querySelector('[name="eDovod"]') as HTMLInputElement;
            const modalTitle = document.querySelector('.modal-title') as HTMLElement;
            modalTitle.innerText = `Editovať objednávku ${appointment.id}`;

            if (dovodElement) {
                dovodElement.value = appointment.reason;
                setPatientInput(appointment.patient);
                document.querySelector('[name="ePatient"]')?.setAttribute('value', appointment.patient);
                document.querySelector('[name="eDoctor"]')?.setAttribute('value', appointment.doctor);
                setDoctorName(appointment.doctor);
                document.querySelector('[name="eRoom"]')?.setAttribute('value', appointment.room);
                setRoomInput(appointment.room);
                document.querySelector('[name="eBlocks"]')?.setAttribute('value', appointment.blocks.toString());
                const [day, month, year] = appointment.date.split('.');
                const date = `${year}-${month}-${day}`;
                document.querySelector('[name="eDatum"]')?.setAttribute('value', date);
                let [hours, minutes] = appointment.time.split(':');
                minutes === '00' ? minutes = '0' : minutes = '30';
                (document.querySelector('[name="eHours"]') as HTMLSelectElement).value = Number(hours).toString();
                (document.querySelector('[name="eMinutes"]') as HTMLSelectElement).value = minutes;
            }
        }, 1);
    };

    const coveredSlots: { [day: string]: { [time: string]: boolean } } = {};
    days.forEach(day => {
        coveredSlots[day] = {};
    });

    const EditOrder = () => {
        toggleEditModal();
        const editedOrder = {
            id: Number(document.querySelector('.modal-title')?.textContent?.split(' ')[2]),
            reason: (document.querySelector('[name="eDovod"]') as HTMLInputElement).value,
            patient: (document.querySelector('[name="ePatient"]') as HTMLInputElement).value,
            doctor: (document.querySelector('[name="eDoctor"]') as HTMLInputElement).value,
            room: (document.querySelector('[name="eRoom"]') as HTMLInputElement).value,
            blocks: Number((document.querySelector('[name="eBlocks"]') as HTMLInputElement).value),
            date: (document.querySelector('[name="eDatum"]') as HTMLInputElement).value,
            time: `${(document.querySelector('[name="eHours"]') as HTMLInputElement).value}:${(document.querySelector('[name="eMinutes"]') as HTMLInputElement).value}`,
            day: new Date((document.querySelector('[name="eDatum"]') as HTMLInputElement).value).toLocaleDateString('en-US', {weekday: 'long'})
        };

        axios.put(`/orders`, editedOrder, {withCredentials: true})
            .then(response => {
                const updatedAppointment = response.data.updated_order;
                const updatedAppointments = appointments.map(appt =>
                    appt.id === updatedAppointment.id ? updatedAppointment : appt
                );
                setAppointments(updatedAppointments);
            })
            .catch(error => {
                console.error('Error updating order', error);
            });
    };

    const DeleteOrder = () => {
        toggleEditModal();
        const id = Number(document.querySelector('.modal-title')?.textContent?.split(' ')[2]);
        axios.delete(`/orders`, {
            data: {id},
            withCredentials: true
        })
            .then(response => {
                const updatedAppointments = appointments.filter(appt => appt.id !== id);
                setAppointments(updatedAppointments);
            })
            .catch(error => {
                console.error('Error deleting order', error);
            });
    }

    const handlePreviousWeek = () => {
        let newWeekNumber = weekNumber - 1;
        let newYear = year;

        if (newWeekNumber < 1) {
            newWeekNumber = 52;
            newYear -= 1;
        }

        setWeekNumber(newWeekNumber);
        setYear(newYear);

        axios.get(`/orders?week=${newWeekNumber}&year=${newYear}`, {withCredentials: true})
            .then(response => {
                setAppointments(response.data.appointments);
                setMondayDate(response.data.monday);
                setSundayDate(response.data.sunday);
            })
            .catch(error => {
                console.error('Error fetching orders', error);
            });
    };

    const handleNextWeek = () => {
        let newWeekNumber = weekNumber + 1;
        let newYear = year;

        if (newWeekNumber > 52) {
            newWeekNumber = 1;
            newYear += 1;
        }

        setWeekNumber(newWeekNumber);
        setYear(newYear);

        axios.get(`/orders?week=${newWeekNumber}&year=${newYear}`, {withCredentials: true})
            .then(response => {
                setAppointments(response.data.appointments);
                setMondayDate(response.data.monday);
                setSundayDate(response.data.sunday);
            })
            .catch(error => {
                console.error('Error fetching orders', error);
            });
    };

    return (
        <Container fluid>
            <Row>
                <Col md={isSideBarOpen ? 2 : 1} className="p-0">
                    <SideBar isOpen={isSideBarOpen} toggleSidebar={toggleSidebar} username={username}/>
                </Col>
                <Col md={isSideBarOpen ? 10 : 11} className="content-column">
                    <div className="container-fluid mt-2">
                        <div className="text-center">
                            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
                                <h1 className="mb-3 mb-md-0">Rozvrh {username}</h1>
                                <div className="d-flex align-items-center mb-3 mb-md-0">
                                    <Button variant="outline-primary" className="me-3" onClick={handlePreviousWeek}>
                                        &lt;
                                    </Button>
                                    <span className="fw-bold">{mondayDate} - {sundayDate}</span>
                                    <Button variant="outline-primary" className="ms-3" onClick={handleNextWeek}>
                                        &gt;
                                    </Button>
                                </div>
                                <Button
                                    variant="primary"
                                    className="mt-3 mt-md-0"
                                    onClick={() => {
                                        setShowAddModal(true);
                                        setPatientInput('');
                                        setRoomInput('');
                                        setDoctorName(username);
                                    }}>
                                    Pridať novú objednávku
                                </Button>
                            </div>
                            <Modal show={showAddModal} onHide={toggleAddModal}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Pridať novú objednávku</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Form>
                                        <Form.Group controlId="formDovod">
                                            <Form.Label>Dôvod</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Zadaj dôvod objednávky"
                                                name="dovod"
                                            />
                                        </Form.Group>
                                        <Form.Group controlId="formPatient">
                                            <Form.Label>Pacient</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Zadať meno pacienta"
                                                name="patient"
                                                value={patientInput}
                                                onChange={handlePatientInputChange}
                                                onClick={() => setPatientSuggestions([])}
                                            />
                                            {patientSuggestions.length > 0 && (
                                                <ul className="suggestions-list">
                                                    {patientSuggestions.map((suggestion, index) => (
                                                        <li
                                                            key={index}
                                                            onClick={() => {
                                                                setPatientInput(suggestion);
                                                                setPatientSuggestions([]);
                                                            }}
                                                        >
                                                            {suggestion}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </Form.Group>
                                        <Form.Group controlId="formDoctor">
                                            <Form.Label>Lekár</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Zadať meno lekára"
                                                name="doctor"
                                                value={doctorName}
                                                readOnly
                                            />
                                            {doctorSuggestions.length > 0 && (
                                                <ul className="suggestions-list">
                                                    {doctorSuggestions.map((suggestion, index) => (
                                                        <li
                                                            key={index}
                                                            onClick={() => {
                                                                setDoctorName(suggestion.split('-')[1].substring(1));
                                                                setDoctorSuggestions([]);
                                                            }}
                                                        >
                                                            {suggestion}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </Form.Group>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group controlId="formRoom">
                                                    <Form.Label>Miestnosť</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Zadať miestnosť"
                                                        name="room"
                                                        value={roomInput}
                                                        onChange={handleRoomInputChange}
                                                    />
                                                    {roomSuggestions.length > 0 && (
                                                        <ul className="suggestions-list">
                                                            {roomSuggestions.map((suggestion, index) => (
                                                                <li
                                                                    key={index}
                                                                    onClick={() => {
                                                                        setRoomInput(suggestion);
                                                                        setRoomSuggestions([]);
                                                                    }}
                                                                >
                                                                    {suggestion}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group controlId="formBlock">
                                                    <Form.Label>Počet blokov</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        placeholder="Zadajte počet blokov"
                                                        name="blocks"
                                                        value={blocks}
                                                        onChange={(e) => setBlocks(Math.max(1, Number(e.target.value)))}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group controlId="formDatum">
                                                    <Form.Label>Dátum</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        name="datum_objednavky"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group controlId="formHours">
                                                            <Form.Label>Hodina</Form.Label>
                                                            <Form.Control
                                                                as="select"
                                                                name="hours">
                                                                {Array.from({length: 9}, (_, i) => i + 9).map(hour => (
                                                                    <option key={hour} value={hour}>{hour}</option>
                                                                ))}
                                                            </Form.Control>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group controlId="formMinutes">
                                                            <Form.Label>Minúta</Form.Label>
                                                            <Form.Control
                                                                as="select"
                                                                name="minutes">
                                                                <option value="0">00</option>
                                                                <option value="30">30</option>
                                                            </Form.Control>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={toggleAddModal}>
                                        Zavrieť
                                    </Button>
                                    <Button variant="primary" onClick={AddOrder}>
                                        Pridať objednávku
                                    </Button>
                                </Modal.Footer>
                            </Modal>
                            <Modal show={showEditModal} onHide={toggleEditModal}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Editovať objednávku</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Form>
                                        <Form.Group controlId="formDovod">
                                            <Form.Label>Dôvod</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Zadaj dôvod objednávky"
                                                name="eDovod"
                                            />
                                        </Form.Group>
                                        <Form.Group controlId="formPatient">
                                            <Form.Label>Pacient</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Zadaj meno pacienta"
                                                name="ePatient"
                                                value={patientInput}
                                                onChange={handlePatientInputChange}
                                                onClick={() => setPatientSuggestions([])}
                                            />
                                            {patientSuggestions.length > 0 && (
                                                <ul className="suggestions-list">
                                                    {patientSuggestions.map((suggestion, index) => (
                                                        <li
                                                            key={index}
                                                            onClick={() => {
                                                                setPatientInput(suggestion);
                                                                setPatientSuggestions([]);
                                                            }}
                                                        >
                                                            {suggestion}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}

                                        </Form.Group>
                                        <Form.Group controlId="formDoctor">
                                            <Form.Label>Lekár</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Zadať meno lekára"
                                                name="eDoctor"
                                                value={doctorName}
                                                readOnly
                                            />
                                            {doctorSuggestions.length > 0 && (
                                                <ul className="suggestions-list">
                                                    {doctorSuggestions.map((suggestion, index) => (
                                                        <li
                                                            key={index}
                                                            onClick={() => {
                                                                setDoctorName(suggestion);
                                                                setDoctorSuggestions([]);
                                                            }}
                                                        >
                                                            {suggestion}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </Form.Group>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group controlId="formRoom">
                                                    <Form.Label>Miestnosť</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Zadaj miestnosť"
                                                        name="eRoom"
                                                        value={roomInput}
                                                        onChange={handleRoomInputChange}
                                                    />
                                                    {roomSuggestions.length > 0 && (
                                                        <ul className="suggestions-list">
                                                            {roomSuggestions.map((suggestion, index) => (
                                                                <li
                                                                    key={index}
                                                                    onClick={() => {
                                                                        setRoomInput(suggestion);
                                                                        setRoomSuggestions([]);
                                                                    }}
                                                                >
                                                                    {suggestion}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group controlId="formBlock">
                                                    <Form.Label>Pocet blokov</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        placeholder="Zadaj počet blokov"
                                                        name="eBlocks"
                                                        onChange={(e) => setBlocks(Math.max(1, Number(e.target.value)))}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group controlId="formDatum">
                                                    <Form.Label>Dátum</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        name="eDatum"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group controlId="formHours">
                                                            <Form.Label>Hodina</Form.Label>
                                                            <Form.Control
                                                                as="select"
                                                                name="eHours">
                                                                {Array.from({length: 9}, (_, i) => i + 9).map(hour => (
                                                                    <option key={hour} value={hour}>{hour}</option>
                                                                ))}
                                                            </Form.Control>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group controlId="formMinutes">
                                                            <Form.Label>Minúta</Form.Label>
                                                            <Form.Control
                                                                as="select"
                                                                name="eMinutes">
                                                                <option value="0">00</option>
                                                                <option value="30">30</option>
                                                            </Form.Control>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Modal.Body>
                                <Modal.Footer className="d-flex justify-content-between">
                                    <Button variant="danger" onClick={DeleteOrder}>
                                        Zmazať objednávku</Button>
                                    <div>
                                        <Button variant="secondary" onClick={toggleEditModal}>
                                            Zavrieť
                                        </Button>
                                        <Button className="ms-2" variant="primary" onClick={EditOrder}>
                                            Editovať objednávku
                                        </Button>
                                    </div>
                                </Modal.Footer>
                            </Modal>

                        </div>
                        <div className="table-responsive">
                            <table className="table table-bordered text-center">
                                <thead>
                                <tr className="bg-light-gray">
                                    <th className="text-uppercase">Čas</th>
                                    {days.map((day, index) => (
                                        <th key={index} className="text-uppercase">{day}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {timeSlots.map((timeSlot, rowIndex) => {
                                    days.every(day => !appointments.some(appt => appt.day === day && appt.time === timeSlot));
                                    return (
                                        <tr key={rowIndex}>
                                            <td>{timeSlot}</td>
                                            {days.map((day, colIndex) => {
                                                if (coveredSlots[day][timeSlot]) {
                                                    return null;
                                                }
                                                const appointment = appointments.find(appt =>
                                                    appt.day === day && appt.time === timeSlot
                                                );

                                                if (appointment) {
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
                                                            className={`event-cell align-content-center`}
                                                            onClick={() => editOrder(appointment?.id.toString())}>
                                                            <div
                                                                className="event bg-primary">{appointment.patient.split('-')[0]}</div>
                                                            <div className="event-details">
                                                                {appointment.reason}
                                                            </div>
                                                            <div className="event-details">
                                                                {appointment.room}
                                                            </div>
                                                        </td>
                                                    );
                                                }
                                                return <td className="bg-light" key={colIndex}></td>;
                                            })}
                                        </tr>
                                    );
                                })}
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