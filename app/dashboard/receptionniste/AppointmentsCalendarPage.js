"use client";

import { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

export default function AppointmentsCalendarPage() {
  const [appointments, setAppointments] = useState([]);
  const localizer = momentLocalizer(moment);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await fetch("/API/appointments"); // Ton API CRUD
      const data = await res.json();
      // On transforme les dates pour react-big-calendar
      const formatted = data.map((a) => ({
        id: a.id,
        title: `${a.patient?.name} - ${a.doctor?.name}`,
        start: new Date(a.date),
        end: new Date(a.date), // si durée fixe, on peut ajouter 1h
      }));
      setAppointments(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Calendrier des Rendez-vous</h1>
      <Calendar
        localizer={localizer}
        events={appointments}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
      />
    </div>
  );
}
