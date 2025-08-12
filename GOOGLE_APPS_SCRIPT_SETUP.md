# Google Apps Script Setup for NIB Security Guard Form

## Step 1: Create Google Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Replace the default code with this:

\`\`\`javascript
function doPost(e) {
  try {
    let data;
    
    // Handle both JSON and form-encoded data
    if (e.postData.type === 'application/x-www-form-urlencoded') {
      data = {};
      const params = e.parameter;
      for (let key in params) {
        data[key] = params[key];
      }
    } else {
      data = JSON.parse(e.postData.contents);
    }
    
    // Open your Google Sheet (replace with your sheet ID)
    const SHEET_ID = '1M5MLPoWRCtWtV68mYhZfnWPI8WNOH7U5EDM0hoZnErk';
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    
    // Set headers if this is the first row
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 5).setValues([
        ['Guard Name', 'Location', 'Submission Time', 'Checkpoint', 'Status']
      ]);
    }
    
    // Add the new row
    sheet.appendRow([
      data.guardName,
      data.location,
      data.submissionTime,
      data.checkpointName,
      data.status
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true, message: 'Data added successfully'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
\`\`\`

## Step 2: Deploy the Script

1. Click "Deploy" → "New deployment"
2. Choose "Web app" as the type
3. Set "Execute as" to "Me"
4. **IMPORTANT**: Set "Who has access" to "Anyone" (this fixes the 302 redirect error)
5. Click "Deploy"
6. **Copy the web app URL** (it will look like: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`)

## Step 3: Add Environment Variable

Add this environment variable to your Vercel project settings:
\`\`\`
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
\`\`\`

## Step 4: Important Notes

- **Make sure to use the web app URL, not the script editor URL**
- The script must be deployed with "Anyone" access to avoid authentication redirects
- If you update the script, you need to create a new deployment or update the existing one

## Step 5: Test

Your form should now work! The data will be automatically added to your Google Sheet with proper formatting.
