import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

const ShowAppointment = () => {
    const [appointments, setAppointments] = useState([]);

    const fetchAppointments = () => {
        axios
            .get("https://appointment-backend-1.onrender.com/api/appointments")
            .then(response => {
                // Sort appointments by date, showing latest first
                const sortedAppointments = response.data.sort(
                    (a, b) => new Date(b.datetime) - new Date(a.datetime)
                );
                setAppointments(sortedAppointments);
            })
            .catch(error => console.error("Error fetching appointments:", error));
    };

    useEffect(() => {
        fetchAppointments(); // Initial fetch

        // Set up polling to fetch appointments every 5 seconds
        const interval = setInterval(fetchAppointments, 5000);

        // Clean up the interval on component unmount
        return () => clearInterval(interval);
    }, []);

    // Function to show browser notification
    const showNotification = (title, body) => {
        if (Notification.permission === 'granted') {
            new Notification(title, { body });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(title, { body });
                }
            });
        }
    };

    // Accept appointment
    const acceptAppointment = (id) => {
        axios
            .put(`https://appointment-backend-1.onrender.com/api/appointments/accept/${id}`)
            .then(response => {
                console.log("Appointment accepted:", response.data);

                // Update status of accepted appointment
                setAppointments(appointments.map(appt =>
                    appt._id === id ? { ...appt, status: "accepted" } : appt
                ));

                // Notify the user about acceptance
                showNotification("Appointment Accepted", "Your appointment has been accepted.");
            })
            .catch(error => console.error("Error accepting appointment:", error));
    };

    return (
        <div>
            <h2>Appointments</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Date and Time</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.map(appointment => (
                        <tr key={appointment._id}>
                            <td>{appointment.name}</td>
                            <td>{dayjs(appointment.datetime).format("DD-MM-YY HH:mm")}</td>
                            <td>{appointment.status}</td>
                            <td>
                                <button onClick={() => acceptAppointment(appointment._id)}>
                                    Accept
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ShowAppointment;
