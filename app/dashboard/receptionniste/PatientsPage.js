'use client';

import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ id: null, name: '', phone: '', dob: '' });
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null); // Profil patient
  const [appointments, setAppointments] = useState([]);
  const [invoices, setInvoices] = useState([]);

  // Charger patients
  const fetchPatients = async () => {
    const res = await fetch('/API/patients');
    const data = await res.json();
    setPatients(data);
  };

  // Charger rendez-vous pour le profil patient
  const fetchAppointments = async (patientId) => {
    const res = await fetch('/API/appointments');
    const data = await res.json();
    return data.filter(a => a.patientId === patientId);
  };

  // Charger factures pour le profil patient
  const fetchInvoices = async (patientId) => {
    const res = await fetch('/API/invoices');
    const data = await res.json();
    return data.filter(i => i.patientId === patientId);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await fetch('/API/patients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } else {
      await fetch('/API/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    }
    setForm({ id: null, name: '', phone: '', dob: '' });
    setEditing(false);
    fetchPatients();
  };

  const handleEdit = (patient) => {
    setForm({
      id: patient.id,
      name: patient.name,
      phone: patient.phone || '',
      dob: patient.dob ? patient.dob.split('T')[0] : '',
    });
    setEditing(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer ce patient ?')) return;
    await fetch('/API/patients', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchPatients();
  };

  const handleViewProfile = async (patient) => {
    setSelectedPatient(patient);
    const appts = await fetchAppointments(patient.id);
    const invs = await fetchInvoices(patient.id);
    setAppointments(appts);
    setInvoices(invs);
  };

  const handleCloseProfile = () => {
    setSelectedPatient(null);
    setAppointments([]);
    setInvoices([]);
  };

  // Export PDF profil patient
  const exportPatientPDF = (patient, appointments, invoices) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Profil Patient: ${patient.name}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Téléphone: ${patient.phone || '-'}`, 14, 30);
    doc.text(`Date de naissance: ${patient.dob ? new Date(patient.dob).toLocaleDateString() : '-'}`, 14, 37);

    // Rendez-vous
    doc.text('Historique Rendez-vous', 14, 47);
    const apptColumns = ['Date', 'Médecin', 'Motif', 'Statut'];
    const apptRows = appointments.map(a => [
      new Date(a.date).toLocaleString(),
      a.doctor?.name || '-',
      a.reason || '-',
      a.status || '-'
    ]);
    autoTable(doc, { startY: 50, head: [apptColumns], body: apptRows });

    const nextY = doc.lastAutoTable?.finalY + 10 || 70;
    doc.text('Factures', 14, nextY);
    const invColumns = ['Date', 'Médecin', 'Montant', 'Statut'];
    const invRows = invoices.map(i => [
      new Date(i.createdAt).toLocaleDateString(),
      i.doctor?.name || '-',
      `${i.amount} DT`,
      i.status
    ]);
    autoTable(doc, { startY: nextY + 5, head: [invColumns], body: invRows });

    doc.save(`Patient_${patient.id}.pdf`);
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.phone && p.phone.includes(search))
  );

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Patients</h2>

      {/* Recherche */}
      <input
        type="text"
        placeholder="Rechercher patient..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="border p-2 rounded mb-4 w-full"
      />

      {/* Formulaire ajout / modification */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Nom"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="border p-2 rounded flex-1"
          required
        />
        <input
          type="text"
          placeholder="Téléphone"
          value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
          className="border p-2 rounded flex-1"
        />
        <input
          type="date"
          value={form.dob}
          onChange={e => setForm({ ...form, dob: e.target.value })}
          className="border p-2 rounded flex-1"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 rounded">
          {editing ? 'Modifier' : 'Ajouter'}
        </button>
      </form>

      {/* Liste patients */}
      <table className="w-full bg-white shadow rounded text-sm">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Nom</th>
            <th className="p-2 text-left">Téléphone</th>
            <th className="p-2 text-left">Date de naissance</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPatients.map(p => (
            <tr key={p.id} className="border-b">
              <td className="p-2">{p.id}</td>
              <td className="p-2">{p.name}</td>
              <td className="p-2">{p.phone || '-'}</td>
              <td className="p-2">{p.dob ? new Date(p.dob).toLocaleDateString() : '-'}</td>
              <td className="p-2 flex gap-2 flex-wrap">
                <button onClick={() => handleEdit(p)} className="bg-yellow-400 px-2 rounded">Modifier</button>
                <button onClick={() => handleDelete(p.id)} className="bg-red-500 text-white px-2 rounded">Supprimer</button>
                <button onClick={() => handleViewProfile(p)} className="bg-green-500 text-white px-2 rounded">Voir Profil</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Profil Patient */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start p-6 overflow-auto z-50">
          <div className="bg-white rounded p-6 w-full max-w-3xl relative">
            <button
              onClick={handleCloseProfile}
              className="absolute top-2 right-2 text-red-500 font-bold"
            >
              X
            </button>
            <h3 className="text-xl font-bold mb-4">Profil Patient: {selectedPatient.name}</h3>
            <p>Téléphone: {selectedPatient.phone || '-'}</p>
            <p>Date de naissance: {selectedPatient.dob ? new Date(selectedPatient.dob).toLocaleDateString() : '-'}</p>

            <h4 className="mt-4 font-semibold">Historique Rendez-vous</h4>
            <table className="w-full text-sm mb-4">
              <thead>
                <tr>
                  <th className="border px-2 py-1">Date</th>
                  <th className="border px-2 py-1">Médecin</th>
                  <th className="border px-2 py-1">Motif</th>
                  <th className="border px-2 py-1">Statut</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a.id}>
                    <td className="border px-2 py-1">{new Date(a.date).toLocaleString()}</td>
                    <td className="border px-2 py-1">{a.doctor?.name || '-'}</td>
                    <td className="border px-2 py-1">{a.reason || '-'}</td>
                    <td className="border px-2 py-1">{a.status || '-'}</td>
                  </tr>
                ))}
                {appointments.length === 0 && <tr><td colSpan="4" className="p-2">Aucun rendez-vous</td></tr>}
              </tbody>
            </table>

            <h4 className="mt-4 font-semibold">Factures</h4>
            <table className="w-full text-sm mb-4">
              <thead>
                <tr>
                  <th className="border px-2 py-1">Date</th>
                  <th className="border px-2 py-1">Médecin</th>
                  <th className="border px-2 py-1">Montant</th>
                  <th className="border px-2 py-1">Statut</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(i => (
                  <tr key={i.id}>
                    <td className="border px-2 py-1">{new Date(i.createdAt).toLocaleDateString()}</td>
                    <td className="border px-2 py-1">{i.doctor?.name || '-'}</td>
                    <td className="border px-2 py-1">{i.amount} DT</td>
                    <td className="border px-2 py-1">{i.status}</td>
                  </tr>
                ))}
                {invoices.length === 0 && <tr><td colSpan="4" className="p-2">Aucune facture</td></tr>}
              </tbody>
            </table>

            <button
              onClick={() => exportPatientPDF(selectedPatient, appointments, invoices)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Export PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
