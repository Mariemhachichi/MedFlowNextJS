'use client'
import { useEffect, useState } from 'react'

export default function PatientsPage() {
  const [patients, setPatients] = useState([])
  const [form, setForm] = useState({ id: null, name: '', phone: '', dob: '' })
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    async function fetchPatients() {
      const res = await fetch('/API/patients')
      const data = await res.json()
      setPatients(data)
    }
    fetchPatients()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editing) {
      await fetch('/API/patients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } else {
      await fetch('/API/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    }
    setForm({ id: null, name: '', phone: '', dob: '' })
    setEditing(false)
    const res = await fetch('/API/patients')
    setPatients(await res.json())
  }

  const handleEdit = (patient) => {
    setForm({
      id: patient.id,
      name: patient.name,
      phone: patient.phone || '',
      dob: patient.dob ? patient.dob.split('T')[0] : '',
    })
    setEditing(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Voulez-vous vraiment supprimer ce patient ?')) {
      await fetch('/API/patients', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const res = await fetch('/API/patients')
      setPatients(await res.json())
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Patients</h2>

      {/* Formulaire ajout / modification */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
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
          {patients.map(p => (
            <tr key={p.id} className="border-b">
              <td className="p-2">{p.id}</td>
              <td className="p-2">{p.name}</td>
              <td className="p-2">{p.phone || '-'}</td>
              <td className="p-2">{p.dob ? new Date(p.dob).toLocaleDateString() : '-'}</td>
              <td className="p-2 flex gap-2">
                <button onClick={() => handleEdit(p)} className="bg-yellow-400 px-2 rounded">Modifier</button>
                <button onClick={() => handleDelete(p.id)} className="bg-red-500 text-white px-2 rounded">Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
