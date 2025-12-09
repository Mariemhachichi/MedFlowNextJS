import { Button } from "@/components/ui/button";


export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-cyan-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-blue-800 mb-4">
          MedFlow 🏥
        </h1>
        <p className="text-xl text-gray-600">
          Gestion médicale simplifiée
        </p>
        <div className="mt-8">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
            Commencer
          </button>
          <div>
      <h1>MedFlow</h1>
      <Button>Bouton shadcn</Button>
    </div>
        </div>
      </div>
    </div>
  )
}