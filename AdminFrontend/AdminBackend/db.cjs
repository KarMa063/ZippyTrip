const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://ZippyTrip_owner:npg_iX4GFVa3QKZt@ep-fragrant-bar-a1v8zqru-pooler.ap-southeast-1.aws.neon.tech/ZippyTrip?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

module.exports = pool;