'use client';

import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
    status: "En attente"
  });
  const [search, setSearch] = useState("");

  // Charger les données - CORRECTION DES CHEMINS
  const fetchData = async () => {
    try {
      const [aRes, pRes, dRes] = await Promise.all([
        fetch("/API/appointments"),      // CHANGÉ: minuscule "api"
        fetch("/API/patients"),          // CHANGÉ: minuscule "api"
        fetch("/API/doctors"),           // CHANGÉ: minuscule "api"
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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation date future
    if (new Date(form.date) < new Date()) {
      alert("La date du rendez-vous doit être dans le futur.");
      return;
    }

    try {
      const method = form.id ? "PUT" : "POST";
      const res = await fetch("/api/appointments", { // CHANGÉ: minuscule "api"
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Erreur API");

      setForm({ id: null, date: "", patientId: "", doctorId: "", reason: "", status: "En attente" });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (appt) => {
    setForm({
      id: appt.id,
      date: new Date(appt.date).toISOString().slice(0,16),
      patientId: appt.patientId || appt.patient?.id,
      doctorId: appt.doctorId || appt.doctor?.id,
      reason: appt.reason || "",
      status: appt.status || "En attente"
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer ce rendez-vous ?")) return;
    try {
      const res = await fetch("/api/appointments", { // CHANGÉ: minuscule "api"
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

  // Filtrer les rendez-vous
  const filteredAppointments = appointments.filter(appt =>
    (appt.patient?.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (appt.doctor?.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (appt.status || "").toLowerCase().includes(search.toLowerCase())
  );

  // Export PDF d'un rendez-vous
  const exportPDF = (appt) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Rendez-vous Clinique MedFlow", 14, 20);

    doc.setFontSize(12);
    doc.text(`Rendez-vous #: ${appt.id}`, 14, 35);
    doc.text(`Date: ${new Date(appt.date).toLocaleString()}`, 14, 42);
    doc.text(`Patient: ${appt.patient?.name || "N/A"}`, 14, 49);
    doc.text(`Médecin: ${appt.doctor?.name || "N/A"}`, 14, 56);
    doc.text(`Statut: ${appt.status}`, 14, 63);

    const tableColumn = ["Motif"];
    const tableRows = [[appt.reason || "N/A"]];
    autoTable(doc, {
      startY: 75,
      head: [tableColumn],
      body: tableRows,
      theme: "grid"
    });

    doc.save(`RendezVous_${appt.id}.pdf`);
  };

  return (
    <div className="flex gap-6">
      {/* Formulaire */}
      <div className="w-1/3 bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">{form.id ? "Modifier" : "Ajouter"} Rendez-vous</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label>
            Date et heure
            <input type="datetime-local" name="date" value={form.date} onChange={handleChange} required className="w-full border px-2 py-1 rounded"/>
          </label>

          <label>
            Patient
            <select name="patientId" value={form.patientId} onChange={handleChange} required className="w-full border px-2 py-1 rounded">
              <option value="">-- Choisir un patient --</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>

          <label>
            Médecin
            <select name="doctorId" value={form.doctorId} onChange={handleChange} required className="w-full border px-2 py-1 rounded">
              <option value="">-- Choisir un médecin --</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialty || "N/A"})</option>)}
            </select>
          </label>

          <label>
            Motif
            <input type="text" name="reason" value={form.reason} onChange={handleChange} className="w-full border px-2 py-1 rounded"/>
          </label>

          <label>
            Statut
            <select name="status" value={form.status} onChange={handleChange} className="w-full border px-2 py-1 rounded">
              <option value="En attente">En attente</option>
              <option value="Confirmé">Confirmé</option>
              <option value="Annulé">Annulé</option>
            </select>
          </label>

          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            {form.id ? "Modifier" : "Ajouter"}
          </button>
        </form>
      </div>

      {/* Liste et recherche */}
      <div className="flex-1 bg-white p-6 rounded shadow overflow-auto">
        <h2 className="text-xl font-bold mb-4">Rendez-vous</h2>

        <input
          type="text"
          placeholder="Rechercher patient, médecin ou statut..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border px-2 py-1 rounded mb-4 w-full"
        />

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
            {filteredAppointments.map(appt => (
              <tr key={appt.id}>
                <td className="border px-2 py-1">{new Date(appt.date).toLocaleString()}</td>
                <td className="border px-2 py-1">{appt.patient?.name || "N/A"}</td>
                <td className="border px-2 py-1">{appt.doctor?.name || "N/A"}</td>
                <td className="border px-2 py-1">{appt.reason || "N/A"}</td>
                <td className={`border px-2 py-1 ${
                  appt.status === "Confirmé" ? "text-green-600" :
                  appt.status === "Annulé" ? "text-red-600" :
                  "text-gray-600"
                }`}>{appt.status}</td>
                <td className="border px-2 py-1 flex gap-2">
                  <button onClick={() => handleEdit(appt)} className="bg-yellow-400 px-2 py-1 rounded hover:bg-yellow-500">Edit</button>
                  <button onClick={() => handleDelete(appt.id)} className="bg-red-500 px-2 py-1 rounded text-white hover:bg-red-600">Supprimer</button>
                  <button onClick={() => exportPDF(appt)} className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">PDF</button>
                </td>
              </tr>
            ))}
            {filteredAppointments.length === 0 && (
              <tr>
                <td colSpan="6" className="p-4 text-center">Aucun rendez-vous trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}