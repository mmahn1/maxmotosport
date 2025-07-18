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

## Step 4: CRITICAL - Secure Your API Key (MANDATORY)
⚠️ **SECURITY WARNING**: Never use unrestricted API keys - they can lead to unauthorized charges!

### For Production (RECOMMENDED):
1. In the API key popup, click "RESTRICT KEY" (or find your key in Credentials and click on it)
2. Under "Application restrictions", select "HTTP referrers (websites)"
3. Under "Website restrictions", click "ADD AN ITEM"
4. Add your production domain: `*.yourdomain.com/*`
5. Under "API restrictions", select "Restrict key"
6. Select only the APIs you need: "Maps JavaScript API" and "Geocoding API"
7. Click "SAVE"

### For Local Development Only:
1. Create a SEPARATE API key for development
2. Under "Application restrictions", select "HTTP referrers (websites)"
3. Under "Website restrictions", add:
   - `*localhost*`
   - `*127.0.0.1*`
   - `*file://*` (for local file testing)
4. Under "API restrictions", select "Restrict key"
5. Select only: "Maps JavaScript API" and "Geocoding API"
6. Click "SAVE"

### Best Practices:
- ✅ **Always use separate keys** for development and production
- ✅ **Never commit API keys** to version control
- ✅ **Monitor usage** regularly in Google Cloud Console
- ✅ **Set up billing alerts** to prevent unexpected charges

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

## Step 6: Environment Variables Setup (RECOMMENDED)

### Create Environment File:
1. Create a `.env` file in your project root (never commit this to Git!)
```
GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

2. Add `.env` to your `.gitignore` file:
```
# Environment variables
.env
.env.local
.env.production
```

### Update Your Code to Use Environment Variables:
Instead of hardcoding the API key in HTML, use server-side rendering or a build process to inject it:

```javascript
// In your server.js or build process
const apiKey = process.env.GOOGLE_MAPS_API_KEY;
```

### Alternative: Use a Configuration File (NOT in Git):
```javascript
// config.js (add to .gitignore)
const config = {
    googleMapsApiKey: 'your_actual_api_key_here'
};
```

---

## Security Checklist ✅

Before deploying to production:
- [ ] API key is restricted to your domain only
- [ ] Separate development and production keys
- [ ] API key is not in any committed code
- [ ] `.env` files are in `.gitignore`
- [ ] Billing alerts are set up in Google Cloud
- [ ] Only necessary APIs are enabled for the key
- [ ] Regular monitoring of API usage
