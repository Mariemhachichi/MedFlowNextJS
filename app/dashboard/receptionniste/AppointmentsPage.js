"use client";

import { useState, useEffect } from "react";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    id: null,
    date: "",
    patientId: "",
    doctorId: "",
    reason: "",
  });

  const fetchData = async () => {
    try {
      const [aRes, pRes, dRes] = await Promise.all([
        fetch("/API/appointments"),
        fetch("/API/patients"),
        fetch("/API/doctors"),
      ]);

      if (!aRes.ok || !pRes.ok || !dRes.ok) throw new Error("Erreur API");

      setAppointments(await aRes.json());
      setPatients(await pRes.json());
      setDoctors(await dRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = form.id ? "PUT" : "POST";
      const url = form.id ? "/API/appointments" : "/API/appointments";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Erreur API");
      setForm({ id: null, date: "", patientId: "", doctorId: "", reason: "" });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (appt) => {
    setForm({
      id: appt.id,
      date: new Date(appt.date).toISOString().slice(0, 16),
      patientId: appt.patient.id,
      doctorId: appt.doctor.id,
      reason: appt.reason || "",
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer ce rendez-vous ?")) return;
    try {
      const res = await fetch("/API/appointments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Erreur API");
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex gap-6">
      {/* Formulaire */}
      <div className="w-1/3 bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">
          {form.id ? "Modifier" : "Ajouter"} Rendez-vous
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label>
            Date et heure
            <input
              type="datetime-local"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="w-full border px-2 py-1 rounded"
            />
          </label>

          <label>
            Patient
            <select
              name="patientId"
              value={form.patientId}
              onChange={handleChange}
              required
              className="w-full border px-2 py-1 rounded"
            >
              <option value="">-- Choisir un patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Médecin
            <select
              name="doctorId"
              value={form.doctorId}
              onChange={handleChange}
              required
              className="w-full border px-2 py-1 rounded"
            >
              <option value="">-- Choisir un médecin --</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.specialty || "N/A"})
                </option>
              ))}
            </select>
          </label>

          <label>
            Motif
            <input
              type="text"
              name="reason"
              value={form.reason}
              onChange={handleChange}
              className="w-full border px-2 py-1 rounded"
            />
          </label>

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {form.id ? "Modifier" : "Ajouter"}
          </button>
        </form>
      </div>

      {/* Liste */}
      <div className="flex-1 bg-white p-6 rounded shadow overflow-auto">
        <h2 className="text-xl font-bold mb-4">Rendez-vous</h2>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Date</th>
              <th className="border px-2 py-1">Patient</th>
              <th className="border px-2 py-1">Médecin</th>
              <th className="border px-2 py-1">Motif</th>
              <th className="border px-2 py-1">Statut</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => (
              <tr key={appt.id}>
                <td className="border px-2 py-1">
                  {new Date(appt.date).toLocaleString()}
                </td>
                <td className="border px-2 py-1">{appt.patient.name}</td>
                <td className="border px-2 py-1">{appt.doctor.name}</td>
                <td className="border px-2 py-1">{appt.reason}</td>
                <td className="border px-2 py-1">{appt.status}</td>
                <td className="border px-2 py-1 flex gap-2">
                  <button
                    onClick={() => handleEdit(appt)}
                    className="bg-yellow-400 px-2 py-1 rounded hover:bg-yellow-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(appt.id)}
                    className="bg-red-500 px-2 py-1 rounded text-white hover:bg-red-600"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
