import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'password',
  database: process.env.MYSQL_DATABASE || 'lucky_draw',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

export const query = async (sql, params) => {
  const [results] = await pool.execute(sql, params)
  return results
}

export default pool
