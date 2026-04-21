import mysql, { Pool, PoolResultSet } from 'mysql2/promise'

const pool: Pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'password',
  database: process.env.MYSQL_DATABASE || 'lucky_draw',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

export const query = async <T extends PoolResultSet = PoolResultSet>(
  sql: string, 
  params?: unknown[]
): Promise<T> => {
  const [results] = await pool.execute<T>(sql, params)
  return results
}

export default pool
