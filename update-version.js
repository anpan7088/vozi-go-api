// experimental not tested yet
// automatic version update

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get current commit ID
const commitId = execSync('git rev-parse --short HEAD').toString().trim();

// Get the latest commit message
let commitMessage = execSync('git log -1 --pretty=%B').toString().trim();

// Sanitize the commit message to remove characters that are not allowed in semver
commitMessage = commitMessage.replace(/[^a-zA-Z0-9-_]/g, '-').substr(0, 20);

// Read package.json
const packageJsonPath = path.resolve(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Regex to match the version with a commit ID appended
const versionPattern = /^(\d+\.\d+\.\d+)(-.+)?$/;
const match = packageJson.version.match(versionPattern);

// Extract the base version
let baseVersion;
if (match) {
  baseVersion = match[1];
} else {
  console.error('Invalid version format in package.json');
  process.exit(1);
}

// Append the new commit ID and commit message to the base version
packageJson.version = `${baseVersion}-${commitId}`;
packageJson.verFullText = packageJson.version + `-${commitMessage}`;

// Write updated package.json back to file
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');

console.log(`Updated version to ${packageJson.version}`);
