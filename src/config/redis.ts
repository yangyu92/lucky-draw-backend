import { createClient, RedisClientType } from 'redis'

let client: RedisClientType | null = null

export const getClient = async (): Promise<RedisClientType> => {
  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    })
    
    client.on('error', (err: Error) => console.error('Redis Client Error', err))
    await client.connect()
  }
  return client
}

export default { getClient }
