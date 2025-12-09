'use client'
import { useState } from 'react'
import PatientsPage from './PatientsPage'
import AppointmentsPage from './AppointmentsPage'
import InvoicesPage from './InvoicesPage'
import CalendarPage from './AppointmentsCalendarPage'
import DashboardPage from './DashboardPage'


export default function ReceptionnisteDashboard() {
  const [activeTab, setActiveTab] = useState('patients')

  const tabs = [
     { id: 'dashboard', label: 'Dashboard' },
    { id: 'patients', label: 'Patients' },
    { id: 'appointments', label: 'Rendez-vous' },
    { id: 'calendar', label: 'calendar' },
     { id: 'invoices', label: 'Factures' },
  ]

  return (
    <div className="flex w-full h-full">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <h1 className="text-2xl font-bold p-6 border-b">MedFlow</h1>
        <nav className="flex-1 p-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`block w-full text-left px-4 py-2 rounded mb-2 ${
                activeTab === tab.id ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 overflow-auto">
         {activeTab === 'dashboard' && <DashboardPage />}
        {activeTab === 'patients' && <PatientsPage />}
        {activeTab === 'appointments' && <AppointmentsPage />}
        {activeTab === 'calendar' && <CalendarPage />} 
        {activeTab === 'invoices' && <InvoicesPage />}
      </main>
    </div>
  )
}
