import { createClient } from 'redis'

let client = null

export const getClient = async () => {
  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    })
    client.on('error', err => console.error('Redis Client Error', err))
    await client.connect()
  }
  return client
}

export default { getClient }
