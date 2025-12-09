'use client'

import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts'

export default function DashboardPage() {
  const [patients, setPatients] = useState([])
  const [appointments, setAppointments] = useState([])
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, aRes, iRes] = await Promise.all([
          fetch('/API/patients'),
          fetch('/API/appointments'),
          fetch('/API/invoices'),
        ])
        setPatients(await pRes.json())
        setAppointments(await aRes.json())
        setInvoices(await iRes.json())
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Statistiques
  const totalPatients = patients.length
  const totalAppointments = appointments.length
  const upcomingAppointments = appointments.filter(appt => new Date(appt.date) > new Date()).length
  const totalInvoices = invoices.length
  const paidInvoices = invoices.filter(inv => inv.status === 'Payée').length
  const unpaidInvoices = invoices.filter(inv => inv.status === 'Non payée').length

  // Préparer les données pour graphique des rendez-vous par jour
  const appointmentsByDay = appointments.reduce((acc, appt) => {
    const day = new Date(appt.date).toLocaleDateString()
    if (!acc[day]) acc[day] = 0
    acc[day]++
    return acc
  }, {})
  const appointmentsChartData = Object.keys(appointmentsByDay).map(day => ({
    day,
    appointments: appointmentsByDay[day],
  }))

  // Préparer les données pour graphique factures payées/non payées
  const invoiceChartData = [
    { name: 'Payées', value: paidInvoices },
    { name: 'Non payées', value: unpaidInvoices },
  ]

  if (loading) return <div className="p-6 text-xl">Chargement des données...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord Réceptionniste</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-sm text-gray-500">Total Patients</h2>
          <p className="text-2xl font-bold">{totalPatients}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-sm text-gray-500">Rendez-vous</h2>
          <p className="text-2xl font-bold">{totalAppointments}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-sm text-gray-500">Rendez-vous à venir</h2>
          <p className="text-2xl font-bold">{upcomingAppointments}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-sm text-gray-500">Factures</h2>
          <p className="text-2xl font-bold">{totalInvoices}</p>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Graphique rendez-vous par jour */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-bold mb-2">Rendez-vous par jour</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={appointmentsChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="appointments" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique factures payées / non payées */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-bold mb-2">Factures payées / non payées</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={invoiceChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Derniers rendez-vous */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-bold mb-2">Derniers rendez-vous</h2>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Date</th>
              <th className="border px-2 py-1">Patient</th>
              <th className="border px-2 py-1">Médecin</th>
              <th className="border px-2 py-1">Motif</th>
            </tr>
          </thead>
          <tbody>
            {appointments
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .slice(0, 5)
              .map((appt) => (
                <tr key={appt.id}>
                  <td className="border px-2 py-1">{new Date(appt.date).toLocaleString()}</td>
                  <td className="border px-2 py-1">{appt.patient?.name}</td>
                  <td className="border px-2 py-1">{appt.doctor?.name}</td>
                  <td className="border px-2 py-1">{appt.reason || '-'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Dernières factures */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-bold mb-2">Dernières factures</h2>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Facture #</th>
              <th className="border px-2 py-1">Patient</th>
              <th className="border px-2 py-1">Montant</th>
              <th className="border px-2 py-1">Statut</th>
            </tr>
          </thead>
          <tbody>
            {invoices
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0, 5)
              .map((inv) => (
                <tr key={inv.id}>
                  <td className="border px-2 py-1">{inv.id}</td>
                  <td className="border px-2 py-1">{inv.patient?.name}</td>
                  <td className="border px-2 py-1">{inv.amount} DT</td>
                  <td className="border px-2 py-1">{inv.status}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
