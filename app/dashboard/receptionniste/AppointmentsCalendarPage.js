'use client';

import { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

export default function AppointmentsCalendar() {
  const [appointments, setAppointments] = useState([]);
  const localizer = momentLocalizer(moment);

  // Charger les rendez-vous
  const fetchAppointments = async () => {
    try {
      const res = await fetch('/API/appointments');
      if (!res.ok) throw new Error('Erreur API');
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Transformer les rendez-vous pour react-big-calendar
  const events = appointments.map(appt => ({
    id: appt.id,
    title: `${appt.patient.name} - ${appt.doctor.name}`,
    start: new Date(appt.date),
    end: new Date(new Date(appt.date).getTime() + 30 * 60 * 1000), // Durée 30min
    status: appt.status,
    patient: appt.patient,
    doctor: appt.doctor,
    reason: appt.reason,
  }));

  // Couleur selon le statut
  const eventStyleGetter = (event) => {
    let backgroundColor = '#3182CE'; // bleu par défaut
    if (event.status === 'En attente') backgroundColor = '#F6AD55'; // orange
    if (event.status === 'Annulé') backgroundColor = '#E53E3E'; // rouge
    if (event.status === 'Confirmé') backgroundColor = '#48BB78'; // vert

    return {
      style: {
        backgroundColor,
        color: 'white',
        borderRadius: '4px',
        border: 'none',
        padding: '2px',
      },
    };
  };

  // Clic sur un rendez-vous
  const handleSelectEvent = (event) => {
    alert(
      `Rendez-vous:\nPatient: ${event.patient.name}\nMédecin: ${event.doctor.name}\nMotif: ${event.reason}\nStatut: ${event.status}\nDate: ${new Date(event.start).toLocaleString()}`
    );
    // Ici tu peux ouvrir un modal pour modifier ou supprimer
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Calendrier des Rendez-vous</h1>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={handleSelectEvent}
      />
    </div>
  );
}
