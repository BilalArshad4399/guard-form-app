import { type NextRequest, NextResponse } from "next/server"

const GOOGLE_APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { guardName, latitude, longitude, submissionTime, checkpointName } = body

    // Validate required fields
    if (!guardName || latitude === null || longitude === null || !submissionTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const formData = {
      guardName,
      location: `${latitude}, ${longitude}`,
      submissionTime: new Date(submissionTime).toLocaleString("en-US", {
        timeZone: "Asia/Karachi",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      checkpointName: checkpointName || "N/A",
      status: "Submitted",
    }

    console.log("NIB Security Guard Report:", JSON.stringify(formData, null, 2))

    // Try Google Apps Script if configured
    if (GOOGLE_APPS_SCRIPT_URL) {
      try {
        console.log("Attempting Google Apps Script submission...")

        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
          redirect: "manual", // Handle redirects manually to catch 302 errors
        })

        if (response.status === 302 || response.status === 301) {
          console.warn("Google Apps Script returned redirect - deployment issue")
          return NextResponse.json({
            success: true,
            message: "Data logged successfully (Google Sheets unavailable - check deployment)",
            fallback: true,
            data: formData,
          })
        }

        if (response.ok) {
          const responseData = await response.text()
          console.log("Google Apps Script success:", responseData)
          return NextResponse.json({
            success: true,
            message: "Data submitted to Google Sheets successfully",
            result: responseData,
          })
        }
      } catch (error) {
        console.warn("Google Apps Script failed, using fallback:", error)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Data logged successfully (check server logs for export)",
      fallback: true,
      data: formData,
      instructions: "Data is logged in server console. Contact admin for Google Sheets setup.",
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
