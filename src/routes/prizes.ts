import { Router, Request, Response } from 'express'
import { query } from '../config/database.js'
import type { ApiResponse, CreatePrizeDto, UpdatePrizeDto } from '../types/index.js'
import type { Prize } from '../types/models.js'

const router = Router()

interface PrizeRow {
  id: number
  name: string
  level: string
  quantity: number
  remaining: number
  image_url: string | null
  created_at: Date
}

interface PrizeWithIdResult {
  insertId: number
}

// 获取所有奖品
router.get('/', async (req: Request, res: Response<ApiResponse<PrizeRow[]>>) => {
  try {
    const results = await query<PrizeRow[]>(
      'SELECT * FROM prizes ORDER BY FIELD(level, "特等奖", "一等奖", "二等奖", "三等奖", "参与奖"), id'
    )
    res.json({ success: true, data: results })
  } catch (err) {
    const error = err as Error
    res.status(500).json({ success: false, message: error.message })
  }
})

// 添加奖品
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, level, quantity, image_url } = req.body as CreatePrizeDto
    if (!name) {
      return res.status(400).json({ success: false, message: '奖品名称不能为空' })
    }
    
    const qty = quantity || 1
    const result = await query<PrizeWithIdResult[]>(
      'INSERT INTO prizes (name, level, quantity, remaining, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, level || '参与奖', qty, qty, image_url || null]
    )
    
    const [prize] = await query<PrizeRow[]>(
      'SELECT * FROM prizes WHERE id = ?',
      [result[0].insertId]
    )
    res.json({ success: true, data: prize })
  } catch (err) {
    const error = err as Error
    res.status(500).json({ success: false, message: error.message })
  }
})

// 更新奖品
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, level, quantity, image_url } = req.body as UpdatePrizeDto
    
    const [oldPrize] = await query<PrizeRow[]>(
      'SELECT * FROM prizes WHERE id = ?',
      [id]
    )
    
    if (!oldPrize) {
      return res.status(404).json({ success: false, message: '奖品不存在' })
    }
    
    // 如果修改了数量，同步更新剩余数量
    const newQuantity = quantity ?? oldPrize.quantity
    const diff = newQuantity - oldPrize.quantity
    const newRemaining = oldPrize.remaining + diff
    
    await query(
      'UPDATE prizes SET name = ?, level = ?, quantity = ?, remaining = ?, image_url = ? WHERE id = ?',
      [name || oldPrize.name, level || oldPrize.level, newQuantity, Math.max(0, newRemaining), image_url, id]
    )
    
    const [prize] = await query<PrizeRow[]>(
      'SELECT * FROM prizes WHERE id = ?',
      [id]
    )
    res.json({ success: true, data: prize })
  } catch (err) {
    const error = err as Error
    res.status(500).json({ success: false, message: error.message })
  }
})

// 删除奖品
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await query('DELETE FROM prizes WHERE id = ?', [id])
    res.json({ success: true, message: '删除成功' })
  } catch (err) {
    const error = err as Error
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
