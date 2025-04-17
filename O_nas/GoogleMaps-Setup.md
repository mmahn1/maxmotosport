# Google Maps Setup Guide for Local Development

## Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click "NEW PROJECT" in the top-right corner of the popup window
4. Enter "MaxMotoSport" as the Project name
5. Click "CREATE"

## Step 2: Enable the Maps JavaScript API
1. In the Google Cloud Console, select your new project
2. Click on the navigation menu (≡) in the top-left corner
3. Go to "APIs & Services" > "Library"
4. In the search bar, type "Maps JavaScript API"
5. Click on "Maps JavaScript API" from the results
6. Click the "ENABLE" button

## Step 3: Create an API Key for Local Development
1. In Google Cloud Console, navigate to "APIs & Services" > "Credentials"
2. Click "+ CREATE CREDENTIALS" at the top of the page
3. Select "API key" from the dropdown menu
4. Your new API key will be displayed in a popup - copy this key

## Step 4: Add Minimal Restrictions to Your API Key
Since you're developing locally without a domain, you have two options:

### Option 1: HTTP Referrer Restriction for Local Development
1. In the API key popup, click "RESTRICT KEY" (or find your key in Credentials and click on it)
2. Under "Application restrictions", select "HTTP referrers (websites)"
3. Under "Website restrictions", click "ADD AN ITEM"
4. Add `*localhost*` and `*127.0.0.1*` as allowed referrers
5. Under "API restrictions", select "Restrict key"
6. Select "Maps JavaScript API" from the dropdown
7. Click "SAVE"

### Option 2: API Restriction Only (Less Secure but Simpler)
1. In the API key popup, click "RESTRICT KEY" (or find your key in Credentials and click on it)
2. Under "Application restrictions", leave it as "None" 
3. Under "API restrictions", select "Restrict key"
4. Select "Maps JavaScript API" from the dropdown
5. Click "SAVE"

## Step 5: Update Your Website Code
1. Open `c:\Users\mahni\Desktop\Šola\4. letnik\Matura\Izdelek\O nas\o-nas.html`
2. Find this code section:
```html
<script async defer
    src="https://maps.googleapis.com/maps/api/js?key=REPLACE_WITH_YOUR_ACTUAL_API_KEY&callback=initMap"
    onerror="handleMapScriptError()">
</script>
```
3. Replace `AIzaSyDjQjGwU0QXo_VxQfuGvYJvHsuUgPbaqsU` with the API key you copied
4. Save the file

## Step 6: Testing with the Node.js Server
1. Start the server if it's not already running:
