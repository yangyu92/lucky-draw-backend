import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import participantsRouter from './routes/participants.js'
import prizesRouter from './routes/prizes.js'
import lotteryRouter from './routes/lottery.js'
import wechatRouter from './routes/wechat.js'

dotenv.config()

const app = express()
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
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' })
})

// 错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ success: false, message: err.message || 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

export default app
