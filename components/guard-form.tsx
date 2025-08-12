"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, CheckCircle, AlertCircle, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

      if (!response.ok) {
        throw new Error("Failed to submit data")
      }

      toast({
        title: "Success!",
        description: "Guard information submitted successfully.",
      })

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
      toast({
        title: "Submission Error",
        description: "Failed to submit guard information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md mx-auto shadow-lg border border-gray-200 bg-white">
        <CardHeader className="pb-6 bg-gradient-to-r from-slate-700 to-slate-800 text-white">
          <CardTitle className="flex items-center gap-3 text-xl font-semibold">
            <div className="p-2 bg-white/20 rounded-lg">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xl font-bold">Security Report</div>
              <div className="text-sm text-slate-100 mt-1">
                {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {formData.checkpointName && (
              <div className="bg-emerald-50 p-4 rounded-lg border-l-4 border-emerald-500">
                <Label className="text-sm font-medium text-slate-600 uppercase tracking-wide">Checkpoint</Label>
                <p className="text-emerald-800 font-bold text-xl mt-1 font-mono">{formData.checkpointName}</p>
              </div>
            )}

            <div className="space-y-3">
              <Label htmlFor="guardName" className="text-base font-medium text-slate-700">
                Guard Name *
              </Label>
              <Select
                value={formData.guardName}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, guardName: value }))}
              >
                <SelectTrigger className="h-12 text-base border-slate-300 focus:border-slate-500 rounded-lg">
                  <SelectValue placeholder="Select assigned guard" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="Abdul Rafay Nawab" className="text-base py-3">
                    Abdul Rafay Nawab
                  </SelectItem>
                  <SelectItem value="Ali Hamza" className="text-base py-3">
                    Ali Hamza
                  </SelectItem>
                  <SelectItem value="Hussain" className="text-base py-3">
                    Hussain
                  </SelectItem>
                  <SelectItem value="other" className="text-base py-3 text-amber-700 font-medium">
                    Other Guard
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.guardName === "other" && (
              <div className="space-y-3">
                <Label htmlFor="customGuardName" className="text-base font-medium text-slate-700">
                  Custom Guard Name *
                </Label>
                <Input
                  id="customGuardName"
                  value={formData.customGuardName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, customGuardName: e.target.value }))}
                  placeholder="Enter guard name"
                  className="h-12 text-base border-slate-300 focus:border-slate-500 rounded-lg"
                />
              </div>
            )}

            <div className="space-y-4">
              <Label className="text-base font-medium text-slate-700">Location Verification * (Required)</Label>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <Button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={locationStatus === "loading"}
                  variant={locationStatus === "success" ? "default" : "outline"}
                  className={`w-full h-12 text-base font-medium flex items-center justify-center gap-2 rounded-lg transition-colors ${
                    locationStatus === "success"
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : locationStatus === "error"
                        ? "border-red-300 text-red-700 hover:bg-red-50"
                        : "bg-slate-600 hover:bg-slate-700 text-white"
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
                  <div className="flex items-center gap-2 text-red-700 mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Location capture failed - please retry</span>
                  </div>
                )}
              </div>

              {formData.latitude && formData.longitude && (
                <div className="bg-emerald-50 p-4 rounded-lg border-l-4 border-emerald-500">
                  <div className="flex items-center gap-2 text-emerald-800 font-medium mb-2">
                    <CheckCircle className="h-4 w-4" />
                    GPS Coordinates
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-slate-600 font-mono">
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
                  ? "bg-slate-800 hover:bg-slate-900 text-white"
                  : "bg-slate-300 text-slate-500 cursor-not-allowed"
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
