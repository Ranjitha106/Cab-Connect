const { Pool } = require("pg")

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "uber_clone",
  password: "India123",
  port: 5432,
})

module.exports = pool