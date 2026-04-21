import express from 'express'
import { query } from '../config/database.js'

const router = express.Router()

// 获取所有奖品
router.get('/', async (req, res) => {
  try {
    const results = await query('SELECT * FROM prizes ORDER BY FIELD(level, "特等奖", "一等奖", "二等奖", "三等奖", "参与奖"), id')
    res.json({ success: true, data: results })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// 添加奖品
router.post('/', async (req, res) => {
  try {
    const { name, level, quantity, image_url } = req.body
    if (!name) return res.status(400).json({ success: false, message: '奖品名称不能为空' })
    
    const qty = quantity || 1
    const result = await query(
      'INSERT INTO prizes (name, level, quantity, remaining, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, level || '参与奖', qty, qty, image_url || null]
    )
    
    const [prize] = await query('SELECT * FROM prizes WHERE id = ?', [result.insertId])
    res.json({ success: true, data: prize })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// 更新奖品
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, level, quantity, image_url } = req.body
    
    const [oldPrize] = await query('SELECT * FROM prizes WHERE id = ?', [id])
    if (!oldPrize) return res.status(404).json({ success: false, message: '奖品不存在' })
    
    // 如果修改了数量，同步更新剩余数量
    const newQuantity = quantity ?? oldPrize.quantity
    const diff = newQuantity - oldPrize.quantity
    const newRemaining = oldPrize.remaining + diff
    
    await query(
      'UPDATE prizes SET name = ?, level = ?, quantity = ?, remaining = ?, image_url = ? WHERE id = ?',
      [name || oldPrize.name, level || oldPrize.level, newQuantity, Math.max(0, newRemaining), image_url, id]
    )
    
    const [prize] = await query('SELECT * FROM prizes WHERE id = ?', [id])
    res.json({ success: true, data: prize })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// 删除奖品
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    await query('DELETE FROM prizes WHERE id = ?', [id])
    res.json({ success: true, message: '删除成功' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
