const { comparePassword } = require('./backend/auth');

// Test the authentication with the hash from database
const storedHash = 'db60f0dcba0024438e4139f7c4415f2402a58c885535cc536b53476ae5ac4f7bf7856d89452b1ce628944c0efacdc48927425fde81df7aba0f04d823674fb9cd';
const testPassword = 'password123';

console.log('Testing authentication...');
console.log('Password:', testPassword);
console.log('Stored hash:', storedHash);
console.log('Match result:', comparePassword(testPassword, storedHash));

// Test with wrong password
console.log('Wrong password test:', comparePassword('wrongpassword', storedHash));