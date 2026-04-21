import express from 'express'
import { query } from '../config/database.js'

const router = express.Router()

// 获取所有参与者
router.get('/', async (req, res) => {
  try {
    const results = await query('SELECT * FROM participants ORDER BY created_at DESC')
    res.json({ success: true, data: results })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// 添加参与者
router.post('/', async (req, res) => {
  try {
    const { name, phone, openid, avatar } = req.body
    if (!name) return res.status(400).json({ success: false, message: '姓名不能为空' })
    
    const result = await query(
      'INSERT INTO participants (name, phone, openid, avatar, status) VALUES (?, ?, ?, ?, ?)',
      [name, phone || null, openid || null, avatar || null, openid ? 'joined' : 'pending']
    )
    
    const [newParticipant] = await query('SELECT * FROM participants WHERE id = ?', [result.insertId])
    res.json({ success: true, data: newParticipant })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// 更新参与者
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, phone, avatar } = req.body
    
    await query('UPDATE participants SET name = ?, phone = ?, avatar = ? WHERE id = ?', 
      [name, phone, avatar, id])
    
    const [participant] = await query('SELECT * FROM participants WHERE id = ?', [id])
    res.json({ success: true, data: participant })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// 删除参与者
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    await query('DELETE FROM participants WHERE id = ?', [id])
    res.json({ success: true, message: '删除成功' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// 批量添加参与者
router.post('/batch', async (req, res) => {
  try {
    const { participants } = req.body
    if (!Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ success: false, message: '请提供有效的参与者列表' })
    }
    
    const values = participants.map(p => [p.name, p.phone || null, p.openid || null, p.avatar || null, 'pending'])
    await query('INSERT INTO participants (name, phone, openid, avatar, status) VALUES ?', [values])
    
    res.json({ success: true, message: `成功添加 ${participants.length} 名参与者` })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
