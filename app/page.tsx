import { GuardForm } from "@/components/guard-form"
import { Suspense } from "react"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 px-4 sm:py-8">
      <div className="max-w-md mx-auto sm:max-w-lg">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">NIB Security Check-in</h1>
          <p className="text-sm sm:text-base text-gray-600">Submit your location and checkpoint information</p>
        </div>
        <Suspense
          fallback={
            <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          }
        >
          <GuardForm />
        </Suspense>
      </div>
    </main>
  )
}
