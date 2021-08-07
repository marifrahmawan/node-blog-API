const crypto = require('crypto');

const buf = crypto.randomBytes(30).toString('hex');
console.log(`${buf.length} bytes of random data: ${buf}`);
