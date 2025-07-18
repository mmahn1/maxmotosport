# 🗺️ Quick Setup Guide for Google Maps

## 📋 **Summary:**
- **Local testing**: Use restricted development key for localhost
- **Production**: Use restricted production key for maxmotosport.eu
- **Both keys are safely restricted** to prevent unauthorized usage

---

## 🏠 **For Local Testing (Development)**

### Step 1: Create Development API Key
```
1. Go to: https://console.cloud.google.com/
2. Navigate to: APIs & Services → Credentials
3. Click: + CREATE CREDENTIALS → API key
4. Name: "MaxMotoSport-Development"
```

### Step 2: Restrict Development Key
```
Application restrictions: HTTP referrers (websites)
Add these referrers:
  *localhost*
  *127.0.0.1*
  *localhost:3000*
  *localhost:8000*
  *localhost:5000*
  *file://*

API restrictions: Restrict key
Select: Maps JavaScript API, Geocoding API
```

### Step 3: Update Your Code
```javascript
// In O_nas/google-maps-config.js, line 12:
development: 'YOUR_DEVELOPMENT_API_KEY_HERE',
// Replace with your actual development key
```

---

## 🌐 **For Production (maxmotosport.eu)**

### Step 1: Create Production API Key
```
1. In Google Cloud Console → Credentials
2. Click: + CREATE CREDENTIALS → API key
3. Name: "MaxMotoSport-Production"
```

### Step 2: Restrict Production Key
```
Application restrictions: HTTP referrers (websites)
Add these referrers:
  *.maxmotosport.eu/*
  *maxmotosport.eu/*
  https://maxmotosport.eu/*
  https://*.maxmotosport.eu/*

API restrictions: Restrict key
Select: Maps JavaScript API, Geocoding API
```

### Step 3: Update Your Code
```javascript
// In O_nas/google-maps-config.js, line 13:
production: 'YOUR_PRODUCTION_API_KEY_HERE',
// Replace with your actual production key
```

---

## 🔄 **How It Works Automatically:**

The code automatically detects your environment:
- **localhost/127.0.0.1** → Uses development key
- **maxmotosport.eu** → Uses production key
- **Error handling** → Shows fallback static image

---

## 🛡️ **Security Features:**

✅ **Separate keys** for development and production  
✅ **Domain restrictions** prevent unauthorized usage  
✅ **API restrictions** limit to only needed services  
✅ **Automatic fallback** if maps fail to load  
✅ **No hardcoded keys** in repository  

---

## 🚀 **Testing Steps:**

### Local Testing:
1. Replace development key in `google-maps-config.js`
2. Open `o-nas.html` in browser
3. Should see interactive map with MaX Motosport marker

### Production Testing:
1. Replace production key in `google-maps-config.js`
2. Deploy to maxmotosport.eu
3. Verify map loads correctly on live site

---

## ⚠️ **Important Notes:**

- **Never commit real API keys** to Git
- **Test both keys** before going live
- **Monitor usage** in Google Cloud Console
- **Set up billing alerts** to prevent surprises
