import { GuardForm } from "@/components/guard-form"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 px-4 sm:py-8">
      <div className="max-w-md mx-auto sm:max-w-lg">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Guard Check-in</h1>
          <p className="text-sm sm:text-base text-gray-600">Submit your location and checkpoint information</p>
        </div>
        <GuardForm />
      </div>
    </main>
  )
}
