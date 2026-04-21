import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import participantsRouter from './routes/participants'
import prizesRouter from './routes/prizes'
import lotteryRouter from './routes/lottery'
import wechatRouter from './routes/wechat'
import type { ApiResponse } from './types'

dotenv.config()

const app: Express = express()
const PORT = process.env.PORT || 8080

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 路由
app.use('/api/participants', participantsRouter)
app.use('/api/prizes', prizesRouter)
app.use('/api/lottery', lotteryRouter)
app.use('/api/wechat', wechatRouter)

// 健康检查
app.get('/api/health', (req: Request, res: Response<ApiResponse>) => {
  res.json({ success: true, message: 'Server is running' })
})

// 错误处理
app.use((err: Error, req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  console.error('Error:', err)
  res.status(500).json({ success: false, message: err.message || 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

export default app
