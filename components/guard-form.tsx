"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, CheckCircle, AlertCircle, Shield, Clock, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface FormData {
  guardName: string
  customGuardName: string
  latitude: number | null
  longitude: number | null
  checkpointName: string
}

export function GuardForm() {
  const [formData, setFormData] = useState<FormData>({
    guardName: "",
    customGuardName: "",
    latitude: null,
    longitude: null,
    checkpointName: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [showSuccess, setShowSuccess] = useState(false)
  const [lastSubmission, setLastSubmission] = useState<{
    guardName: string
    checkpointName: string
    time: string
  } | null>(null)
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const checkpoint = searchParams.get("chkpt")
    if (checkpoint && checkpoint !== formData.checkpointName) {
      setFormData((prev) => ({ ...prev, checkpointName: checkpoint }))
    }
  }, [searchParams, formData.checkpointName])

  const getCurrentLocation = () => {
    setLocationStatus("loading")

    if (!navigator.geolocation) {
      setLocationStatus("error")
      toast({
        title: "Location Error",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive",
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }))
        setLocationStatus("success")
        toast({
          title: "Location Captured",
          description: "Your location has been successfully recorded.",
        })
      },
      (error) => {
        setLocationStatus("error")
        let errorMessage = "Unable to retrieve your location."

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable."
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out."
            break
        }

        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive",
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.guardName) {
      toast({
        title: "Validation Error",
        description: "Please select a guard name.",
        variant: "destructive",
      })
      return
    }

    if (formData.guardName === "other" && !formData.customGuardName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a custom guard name.",
        variant: "destructive",
      })
      return
    }

    if (formData.latitude === null || formData.longitude === null || locationStatus !== "success") {
      toast({
        title: "Location Required",
        description: "You must capture your current location before submitting the form.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const submissionTime = new Date().toISOString()
      const finalGuardName = formData.guardName === "other" ? formData.customGuardName : formData.guardName

      const dataToSubmit = {
        guardName: finalGuardName,
        latitude: formData.latitude,
        longitude: formData.longitude,
        submissionTime,
        checkpointName: formData.checkpointName,
      }

      const response = await fetch("/api/submit-guard-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit data")
      }

      setLastSubmission({
        guardName: finalGuardName,
        checkpointName: formData.checkpointName,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      })
      setShowSuccess(true)

      if (result.fallback) {
        toast({
          title: "✅ Report Logged Successfully",
          description: "Your security report has been recorded and logged for processing.",
          duration: 5000,
        })
      } else {
        toast({
          title: "✅ Report Submitted Successfully",
          description: "Your security report has been saved to the system.",
          duration: 5000,
        })
      }

      setTimeout(() => {
        setShowSuccess(false)
      }, 5000)

      const currentCheckpoint = formData.checkpointName
      setFormData({
        guardName: "",
        customGuardName: "",
        latitude: null,
        longitude: null,
        checkpointName: currentCheckpoint,
      })
      setLocationStatus("idle")
    } catch (error) {
      console.error("Submission error:", error)
      toast({
        title: "Submission Error",
        description: error instanceof Error ? error.message : "Failed to submit guard information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showSuccess && lastSubmission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto shadow-2xl border border-yellow-400/20 bg-gray-900/95 backdrop-blur-sm">
          <CardHeader className="pb-6 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-center">
            <CardTitle className="flex flex-col items-center gap-4">
              <div className="p-4 bg-black/20 rounded-full">
                <CheckCircle className="h-12 w-12" />
              </div>
              <div>
                <div className="text-2xl font-bold">Report Submitted!</div>
                <div className="flex items-center justify-center mt-2">
                  <Image
                    src="/images/mib-security-logo.png"
                    alt="MIB Security"
                    width={120}
                    height={40}
                    className="object-contain"
                  />
                </div>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <div className="bg-yellow-400/10 p-4 rounded-lg border border-yellow-400/30">
                <h3 className="font-semibold text-yellow-400 mb-3">Submission Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-300">
                      <User className="h-4 w-4" />
                      Guard:
                    </span>
                    <span className="font-medium text-white">{lastSubmission.guardName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-300">
                      <Clock className="h-4 w-4" />
                      Time:
                    </span>
                    <span className="font-medium text-white">{lastSubmission.time}</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-gray-300 mb-4">
                  Your security report has been successfully recorded and logged in the system.
                </p>
                <Button
                  onClick={() => setShowSuccess(false)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-2 rounded-lg transition-colors"
                >
                  Submit Another Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 flex items-center justify-center">
      <Card className="w-full max-w-md mx-auto shadow-2xl border border-yellow-400/20 bg-gray-900/95 backdrop-blur-sm">
        <CardHeader className="pb-6 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black">
          <CardTitle className="flex flex-col items-center gap-3 text-xl font-semibold">
            <div className="flex items-center justify-center">
              <Image
                src="/images/mib-security-logo.png"
                alt="MIB Security"
                width={140}
                height={48}
                className="object-contain"
              />
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">Security Report</div>
              <div className="text-sm text-black/80 mt-1 font-medium">
                {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="guardName" className="text-base font-medium text-gray-200">
                Guard Name *
              </Label>
              <Select
                value={formData.guardName}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, guardName: value }))}
              >
                <SelectTrigger className="h-12 text-base border-gray-600 bg-gray-800 text-white focus:border-yellow-400 rounded-lg">
                  <SelectValue placeholder="Select assigned guard" />
                </SelectTrigger>
                <SelectContent className="rounded-lg bg-gray-800 border-gray-600">
                  <SelectItem value="Abdul Rafay Nawab" className="text-base py-3 text-white hover:bg-gray-700">
                    Abdul Rafay Nawab
                  </SelectItem>
                  <SelectItem value="Ali Hamza" className="text-base py-3 text-white hover:bg-gray-700">
                    Ali Hamza
                  </SelectItem>
                  <SelectItem value="Hussain" className="text-base py-3 text-white hover:bg-gray-700">
                    Hussain
                  </SelectItem>
                  <SelectItem value="other" className="text-base py-3 text-yellow-400 font-medium hover:bg-gray-700">
                    Other Guard
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.guardName === "other" && (
              <div className="space-y-3">
                <Label htmlFor="customGuardName" className="text-base font-medium text-gray-200">
                  Custom Guard Name *
                </Label>
                <Input
                  id="customGuardName"
                  value={formData.customGuardName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, customGuardName: e.target.value }))}
                  placeholder="Enter guard name"
                  className="h-12 text-base border-gray-600 bg-gray-800 text-white focus:border-yellow-400 rounded-lg"
                />
              </div>
            )}

            <div className="space-y-4">
              <Label className="text-base font-medium text-gray-200">Location Verification * (Required)</Label>

              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <Button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={locationStatus === "loading"}
                  variant={locationStatus === "success" ? "default" : "outline"}
                  className={`w-full h-12 text-base font-medium flex items-center justify-center gap-2 rounded-lg transition-colors ${
                    locationStatus === "success"
                      ? "bg-yellow-400 hover:bg-yellow-500 text-black"
                      : locationStatus === "error"
                        ? "border-red-400 text-red-400 hover:bg-red-400/10"
                        : "bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                  }`}
                >
                  {locationStatus === "loading" ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                      Getting Location...
                    </>
                  ) : locationStatus === "success" ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Location Captured
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4" />
                      Capture Location
                    </>
                  )}
                </Button>

                {locationStatus === "error" && (
                  <div className="flex items-center gap-2 text-red-400 mt-3 p-3 bg-red-400/10 rounded-lg border border-red-400/30">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Location capture failed - please retry</span>
                  </div>
                )}
              </div>

              {formData.latitude && formData.longitude && (
                <div className="bg-yellow-400/10 p-4 rounded-lg border-l-4 border-yellow-400">
                  <div className="flex items-center gap-2 text-yellow-400 font-medium mb-2">
                    <CheckCircle className="h-4 w-4" />
                    GPS Coordinates
                  </div>
                  <div className="bg-gray-800 p-3 rounded border border-gray-700">
                    <p className="text-sm text-gray-300 font-mono">
                      {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className={`w-full h-12 text-base font-medium mt-6 rounded-lg transition-colors ${
                locationStatus === "success"
                  ? "bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
              disabled={isSubmitting || locationStatus === "loading" || locationStatus !== "success"}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                  Submitting...
                </>
              ) : locationStatus !== "success" ? (
                "Capture Location to Submit"
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Submit Report
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
