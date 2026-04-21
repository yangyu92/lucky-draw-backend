import express from 'express'
import { query } from '../config/database.js'
import { getClient } from '../config/redis.js'

const router = express.Router()

// 获取所有中奖记录
router.get('/winners', async (req, res) => {
  try {
    const results = await query(`
      SELECT w.*, p.name as participantName, p.phone, pr.name as prizeName, pr.level as prizeLevel
      FROM winners w
      LEFT JOIN participants p ON w.participant_id = p.id
      LEFT JOIN prizes pr ON w.prize_id = pr.id
      ORDER BY w.draw_time DESC
    `)
    res.json({ success: true, data: results })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// 执行抽奖
router.post('/draw', async (req, res) => {
  try {
    const { prizeId, count = 1 } = req.body
    if (!prizeId) return res.status(400).json({ success: false, message: '请指定奖品' })
    
    // 获取奖品信息
    const [prize] = await query('SELECT * FROM prizes WHERE id = ?', [prizeId])
    if (!prize) return res.status(404).json({ success: false, message: '奖品不存在' })
    if (prize.remaining < count) {
      return res.status(400).json({ success: false, message: `奖品剩余数量不足，当前剩余 ${prize.remaining}` })
    }
    
    // 获取可参与抽奖的人员（已签到且未中奖）
    const candidates = await query(`
      SELECT * FROM participants 
      WHERE status = 'joined' 
      AND id NOT IN (SELECT participant_id FROM winners)
    `)
    
    if (candidates.length === 0) {
      return res.status(400).json({ success: false, message: '没有可参与抽奖的人员' })
    }
    
    // 随机抽取
    const shuffled = candidates.sort(() => Math.random() - 0.5)
    const winners = shuffled.slice(0, Math.min(count, prize.remaining, shuffled.length))
    
    // 记录中奖
    for (const winner of winners) {
      await query(
        'INSERT INTO winners (participant_id, prize_id) VALUES (?, ?)',
        [winner.id, prizeId]
      )
    }
    
    // 更新奖品剩余数量
    await query('UPDATE prizes SET remaining = remaining - ? WHERE id = ?', [winners.length, prizeId])
    
    // 更新中奖者状态
    for (const winner of winners) {
      await query('UPDATE participants SET status = ? WHERE id = ?', ['won', winner.id])
    }
    
    // 获取完整的中奖信息
    const winnerIds = winners.map(w => w.id)
    const winnerRecords = await query(`
      SELECT w.*, p.name as participantName, p.phone, pr.name as prizeName, pr.level as prizeLevel
      FROM winners w
      LEFT JOIN participants p ON w.participant_id = p.id
      LEFT JOIN prizes pr ON w.prize_id = pr.id
      WHERE w.participant_id IN (?)
      ORDER BY w.draw_time DESC
    `, [winnerIds])
    
    res.json({ success: true, data: { winners: winnerRecords } })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// 重置抽奖
router.post('/reset', async (req, res) => {
  try {
    // 清空中奖记录
    await query('DELETE FROM winners')
    // 重置奖品剩余数量
    await query('UPDATE prizes SET remaining = quantity')
    // 重置参与者状态
    await query("UPDATE participants SET status = 'pending' WHERE status = 'joined'")
    await query("UPDATE participants SET status = 'joined' WHERE status = 'won' AND openid IS NOT NULL")
    
    res.json({ success: true, message: '抽奖已重置' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
