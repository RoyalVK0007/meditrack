const crypto = require('crypto');

// Using Node.js built-in crypto for password hashing
function hashPassword(password) {
  return crypto.pbkdf2Sync(password, 'meditrack_salt', 10000, 64, 'sha512').toString('hex');
}

// Generate hashes for password123
const hash = hashPassword('password123');
console.log('Hash for password123:', hash);

// Test the hash
function comparePassword(password, hash) {
  return hashPassword(password) === hash;
}

console.log('Test comparison:', comparePassword('password123', hash));