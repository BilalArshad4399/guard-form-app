import { type NextRequest, NextResponse } from "next/server"

// Google Sheets API configuration
const GOOGLE_SHEETS_API_URL = "https://sheets.googleapis.com/v4/spreadsheets"
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID
const SHEET_NAME = "Guard Data" // You can customize this
const API_KEY = process.env.GOOGLE_SHEETS_API_KEY

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { guardName, latitude, longitude, submissionTime, checkpointName } = body

    // Validate required fields
    if (!guardName || latitude === null || longitude === null || !submissionTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Prepare data for Google Sheets
    const values = [
      [
        guardName,
        latitude,
        longitude,
        submissionTime,
        checkpointName || "",
        new Date().toLocaleString(), // Additional timestamp
      ],
    ]

    // Google Sheets API call
    const sheetsUrl = `${GOOGLE_SHEETS_API_URL}/${SPREADSHEET_ID}/values/${SHEET_NAME}:append`
    const response = await fetch(`${sheetsUrl}?valueInputOption=RAW&key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Google Sheets API Error:", errorData)
      throw new Error("Failed to submit to Google Sheets")
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      message: "Data submitted successfully",
      result,
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
