/**
 * Script to handle npm package vulnerabilities
 * This is safer than directly running `npm audit fix --force`
 * as it allows manual review of the changes
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

async function backupPackageJson() {
  console.log('Backing up package.json and package-lock.json...');
  
  try {
    // Create backups directory if it doesn't exist
    const backupDir = path.join(__dirname, 'backups');
    await fs.mkdir(backupDir, { recursive: true });
    
    // Get timestamp for backup filenames
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Backup package.json
    await fs.copyFile(
      path.join(__dirname, 'package.json'),
      path.join(backupDir, `package-${timestamp}.json`)
    );
    
    // Backup package-lock.json if it exists
    try {
      await fs.copyFile(
        path.join(__dirname, 'package-lock.json'),
        path.join(backupDir, `package-lock-${timestamp}.json`)
      );
    } catch (err) {
      console.log('No package-lock.json found to backup');
    }
    
    console.log('Backups created successfully in ./backups directory');
    return true;
  } catch (err) {
    console.error('Error creating backups:', err);
    return false;
  }
}

async function runNpmAudit() {
  console.log('\nRunning npm audit to check vulnerabilities...');
  
  return new Promise((resolve) => {
    const audit = spawn('npm', ['audit', '--json']);
    let output = '';
    
    audit.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    audit.stderr.on('data', (data) => {
      console.error('stderr:', data.toString());
    });
    
    audit.on('close', (code) => {
      console.log(`npm audit completed with code ${code}`);
      
      try {
        // Parse JSON output to get vulnerability details
        const auditData = JSON.parse(output);
        resolve(auditData);
      } catch (err) {
        console.error('Error parsing npm audit output:', err);
        resolve(null);
      }
    });
  });
}

async function displayVulnerabilities(auditData) {
  if (!auditData || !auditData.vulnerabilities) {
    console.log('No vulnerability data available');
    return;
  }
  
  console.log('\n=== VULNERABILITY REPORT ===');
  
  // Count vulnerabilities by severity
  const counts = { critical: 0, high: 0, moderate: 0, low: 0 };
  
  Object.entries(auditData.vulnerabilities).forEach(([name, info]) => {
    counts[info.severity] = (counts[info.severity] || 0) + 1;
    
    console.log(`\nPackage: ${name} (${info.severity} severity)`);
    console.log(`  Vulnerable versions: ${info.range}`);
    if (info.nodes && info.nodes.length > 0) {
      console.log(`  Installed version: ${info.nodes[0].split('@')[1]}`);
    }
    console.log(`  Fixed version: ${info.fixAvailable ? info.fixAvailable.version : 'not available'}`);
    console.log(`  Dependency of: ${info.via[0].source || 'direct'}`);
    console.log(`  Title: ${info.via[0].title}`);
    console.log(`  URL: ${info.via[0].url}`);
  });
  
  console.log('\n=== SUMMARY ===');
  console.log(`Critical: ${counts.critical || 0}`);
  console.log(`High: ${counts.high || 0}`);
  console.log(`Moderate: ${counts.moderate || 0}`);
  console.log(`Low: ${counts.low || 0}`);
  
  return Object.values(counts).reduce((a, b) => a + b, 0) > 0;
}

async function fixVulnerabilities() {
  console.log('\nAttempting to fix vulnerabilities...');
  
  return new Promise((resolve) => {
    // Use --no-audit to prevent recursive auditing
    const fix = spawn('npm', ['audit', 'fix', '--no-audit']);
    
    fix.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    
    fix.stderr.on('data', (data) => {
      console.error(data.toString());
    });
    
    fix.on('close', (code) => {
      if (code === 0) {
        console.log('Successfully fixed vulnerabilities that could be addressed safely');
      } else {
        console.log('Some vulnerabilities could not be fixed automatically');
        console.log('For remaining issues, consider the following options:');
        console.log('1. Update the affected packages manually');
        console.log('2. Run `npm audit fix --force` (may cause breaking changes)');
        console.log('3. Add package overrides in package.json');
      }
      resolve();
    });
  });
}

async function main() {
  console.log('=== Vulnerability Management Script ===');
  
  // Backup current package files
  const backupSuccess = await backupPackageJson();
  if (!backupSuccess) {
    console.log('Exiting due to backup failure');
    return;
  }
  
  // Check current vulnerabilities
  const auditData = await runNpmAudit();
  const hasVulnerabilities = await displayVulnerabilities(auditData);
  
  if (!hasVulnerabilities) {
    console.log('No vulnerabilities found. Your project is secure!');
    return;
  }
  
  // Get user confirmation before fixing
  console.log('\nReady to attempt fixing vulnerabilities. This will modify your dependencies.');
  console.log('The script will use npm audit fix (not with --force) to avoid breaking changes.');
  console.log('Your original package.json and package-lock.json have been backed up.');
  
  // Ask user to manually confirm (in a real script, we'd add user input)
  console.log('\nTo proceed, please run: node fix-vulnerabilities.js --fix');
  
  // Check if --fix flag is provided
  if (process.argv.includes('--fix')) {
    await fixVulnerabilities();
    
    // Check remaining vulnerabilities
    console.log('\nChecking for remaining vulnerabilities...');
    const remainingAuditData = await runNpmAudit();
    const hasRemainingVulnerabilities = await displayVulnerabilities(remainingAuditData);
    
    if (hasRemainingVulnerabilities) {
      console.log('\nSome vulnerabilities remain. Review the report above for more information.');
    } else {
      console.log('\nAll vulnerabilities have been successfully fixed!');
    }
  }
}

main().catch((error) => {
  console.error('Error:', error);
});
