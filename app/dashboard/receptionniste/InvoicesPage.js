"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    id: null,
    patientId: "",
    doctorId: "",
    amount: "",
    status: "Non payée",
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState({ patient: "", doctor: "", status: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const invoicesPerPage = 10;

  useEffect(() => {
    fetchInvoices();
    fetchPatients();
    fetchDoctors();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch("/API/invoices");
      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await fetch("/API/patients");
      const data = await res.json();
      setPatients(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch("/API/doctors");
      const data = await res.json();
      setDoctors(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = form.id ? "PUT" : "POST";
      await fetch("/API/invoices", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setForm({ id: null, patientId: "", doctorId: "", amount: "", status: "Non payée" });
      fetchInvoices();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer cette facture ?")) return;
    try {
      await fetch("/API/invoices", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchInvoices();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (invoice) => {
    setForm({
      id: invoice.id,
      patientId: invoice.patientId,
      doctorId: invoice.doctorId,
      amount: invoice.amount,
      status: invoice.status,
    });
  };

  // Filtrage
  const filteredInvoices = invoices.filter((inv) =>
    (!search.patient || inv.patient?.name.toLowerCase().includes(search.patient.toLowerCase())) &&
    (!search.doctor || inv.doctor?.name.toLowerCase().includes(search.doctor.toLowerCase())) &&
    (!search.status || inv.status === search.status)
  );

  // Pagination
  const indexOfLast = currentPage * invoicesPerPage;
  const indexOfFirst = indexOfLast - invoicesPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredInvoices.length / invoicesPerPage);

  // Export PDF d'une facture
  const exportPDFInvoice = (invoice) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Facture Clinique MedFlow", 14, 20);
    doc.setFontSize(12);
    doc.text(`Facture #: ${invoice.id}`, 14, 35);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 14, 42);
    doc.text(`Patient: ${invoice.patient?.name}`, 14, 49);
    doc.text(`Médecin: ${invoice.doctor?.name}`, 14, 56);
    doc.text(`Statut: ${invoice.status}`, 14, 63);
    autoTable(doc, {
      startY: 75,
      head: [["Description", "Montant"]],
      body: [["Consultation", `${invoice.amount} DT`]],
      theme: "grid",
    });
    const finalY = doc.lastAutoTable?.finalY || 75;
    doc.setFontSize(14);
    doc.text(`Total: ${invoice.amount} DT`, 14, finalY + 10);
    doc.save(`Facture_${invoice.id}.pdf`);
  };

  // Export PDF global
  const exportPDFAll = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Factures Clinique MedFlow", 14, 20);
    const tableRows = filteredInvoices.map((inv) => [
      inv.patient?.name,
      inv.doctor?.name,
      `${inv.amount} DT`,
      inv.status,
      new Date(inv.createdAt).toLocaleDateString(),
    ]);
    autoTable(doc, { startY: 30, head: [["Patient", "Médecin", "Montant", "Statut", "Date"]], body: tableRows });
    doc.save("Factures.pdf");
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ["Patient", "Médecin", "Montant", "Statut", "Date"];
    const rows = filteredInvoices.map((inv) => [
      inv.patient?.name,
      inv.doctor?.name,
      inv.amount,
      inv.status,
      new Date(inv.createdAt).toLocaleDateString(),
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "factures.csv";
    link.click();
  };

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Factures</h1>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <select required value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} className="border p-2 rounded">
          <option value="">Sélectionner un patient</option>
          {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select required value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })} className="border p-2 rounded">
          <option value="">Sélectionner un médecin</option>
          {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <input type="number" required placeholder="Montant" value={form.amount} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })} className="border p-2 rounded" />
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="border p-2 rounded">
          <option value="Non payée">Non payée</option>
          <option value="Payée">Payée</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">{loading ? "Chargement..." : form.id ? "Modifier" : "Ajouter"}</button>
      </form>

      {/* Filtres et export */}
      <div className="mb-4 flex gap-4 flex-wrap">
        <input placeholder="Filtrer par patient" value={search.patient} onChange={(e) => setSearch({ ...search, patient: e.target.value })} className="border p-2 rounded" />
        <input placeholder="Filtrer par médecin" value={search.doctor} onChange={(e) => setSearch({ ...search, doctor: e.target.value })} className="border p-2 rounded" />
        <select value={search.status} onChange={(e) => setSearch({ ...search, status: e.target.value })} className="border p-2 rounded">
          <option value="">Tous</option>
          <option value="Non payée">Non payée</option>
          <option value="Payée">Payée</option>
        </select>
        <button onClick={exportPDFAll} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Export PDF global</button>
        <button onClick={exportCSV} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Export CSV</button>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Patient</th>
              <th className="p-2 border">Médecin</th>
              <th className="p-2 border">Montant</th>
              <th className="p-2 border">Statut</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentInvoices.map((inv) => (
              <tr key={inv.id} className="text-center">
                <td className="p-2 border">{inv.patient?.name}</td>
                <td className="p-2 border">{inv.doctor?.name}</td>
                <td className="p-2 border">{inv.amount} DT</td>
                <td className="p-2 border">{inv.status}</td>
                <td className="p-2 border">{new Date(inv.createdAt).toLocaleDateString()}</td>
                <td className="p-2 border flex justify-center gap-2">
                  <button onClick={() => handleEdit(inv)} className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600">Modifier</button>
                  <button onClick={() => handleDelete(inv.id)} className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">Supprimer</button>
                  <button onClick={() => exportPDFInvoice(inv)} className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">Export PDF</button>
                </td>
              </tr>
            ))}
            {currentInvoices.length === 0 && <tr><td colSpan="6" className="p-4">Aucune facture trouvée.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Pagination et total */}
      <div className="mt-4 flex justify-between items-center">
        <span>Total factures affichées : {totalAmount} DT</span>
        <div className="flex gap-2">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="px-2 py-1 border rounded disabled:opacity-50">Précédent</button>
          <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(currentPage + 1)} className="px-2 py-1 border rounded disabled:opacity-50">Suivant</button>
        </div>
      </div>
    </div>
  );
}