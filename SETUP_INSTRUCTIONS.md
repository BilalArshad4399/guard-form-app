# Google Sheets Integration Setup

## Step 1: Create a Google Sheet
1. Go to Google Sheets and create a new spreadsheet
2. Name it "Guard Data" or your preferred name
3. Add headers in the first row: `Guard Name | Latitude | Longitude | Submission Time | Checkpoint | Created At`
4. Copy the spreadsheet ID from the URL (the long string between `/d/` and `/edit`)

## Step 2: Get Google Sheets API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API
4. Go to "Credentials" and create an API key
5. Restrict the API key to Google Sheets API for security

## Step 3: Make Sheet Public (Simple Method)
1. In your Google Sheet, click "Share" 
2. Change access to "Anyone with the link can view"
3. This allows the API to write to your sheet

## Step 4: Environment Variables
Add these to your `.env.local` file:
\`\`\`
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_SHEETS_API_KEY=your_api_key_here
\`\`\`

## Step 5: Test the Form
1. Visit your app with a checkpoint parameter: `/?chkpt=CHECKPOINT_A`
2. Fill out the form and test location capture
3. Submit and check your Google Sheet for the data

## Alternative: Service Account (More Secure)
For production, consider using a Google Service Account instead of an API key for better security.
