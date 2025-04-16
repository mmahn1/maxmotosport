const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🚀 Setting up your project server...');

if (!fs.existsSync('package.json')) {
  console.log('📦 Creating package.json...');
  
  const packageJson = {
    "name": "maxmotosport-website",
    "version": "1.0.0",
    "description": "Max MotoSport Website",
    "main": "server.js",
    "scripts": {
      "start": "node server.js"
    },
    "dependencies": {
      "express": "^4.18.2"
    }
  };
  
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  console.log('✅ package.json created');
} else {
  console.log('✅ package.json already exists');
}

const slikeDir = path.join(__dirname, 'Slike');
if (!fs.existsSync(slikeDir)) {
  console.log('📁 Creating Slike directory for images...');
  fs.mkdirSync(slikeDir);
  console.log('✅ Slike directory created');
} else {
  console.log('✅ Slike directory already exists');
}

const mapFallbackPath = path.join(slikeDir, 'location-map.png');
if (!fs.existsSync(mapFallbackPath)) {
  console.log('🗺️ Creating a placeholder map image...');

  const placeholderContent = `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="400" fill="#f8f8f8"/>
    <text x="300" y="200" font-family="Arial" font-size="20" text-anchor="middle" fill="#999">
      Map Placeholder
    </text>
    <text x="300" y="230" font-family="Arial" font-size="16" text-anchor="middle" fill="#666">
      Replace with your Google Maps static image
    </text>
  </svg>`;
  
  try {
    fs.writeFileSync(mapFallbackPath.replace('.png', '.svg'), placeholderContent);
    console.log('✅ Created SVG placeholder. To create a real map image, follow the instructions in GoogleMaps-Setup.md');
  } catch (e) {
    console.log('⚠️ Could not create placeholder image:', e.message);
  }
}

console.log('📦 Installing dependencies...');
exec('npm install', (error, stdout, stderr) => {
  if (error) {
    console.error(`⚠️ Error installing dependencies: ${error}`);
    return;
  }
  
  console.log('✅ Dependencies installed successfully');
  console.log('\n🚀 Setup complete!');
  console.log('\nTo start the server:');
  console.log('1. Run: npm start');
  console.log('2. Open: http://localhost:3000/O%20nas/o-nas.html');
  console.log('\nFor Google Maps setup:');
  console.log('- Follow instructions in GoogleMaps-Setup.md');
});
