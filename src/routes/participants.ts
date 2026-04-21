import { Router, Request, Response } from 'express'
import { query } from '../config/database.js'
import type { ApiResponse, CreateParticipantDto, UpdateParticipantDto } from '../types/index.js'
import type { Participant } from '../types/models.js'

const router = Router()

interface ParticipantRow {
  id: number
  name: string
  phone: string | null
  openid: string | null
  avatar: string | null
  status: 'pending' | 'joined' | 'won'
  created_at: Date
}

type ResultSet = { insertId: number }[] | ParticipantRow[]

// 获取所有参与者
router.get('/', async (req: Request, res: Response<ApiResponse<ParticipantRow[]>>) => {
  try {
    const results = await query<ParticipantRow[]>(
      'SELECT * FROM participants ORDER BY created_at DESC'
    )
    res.json({ success: true, data: results })
  } catch (err) {
    const error = err as Error
    res.status(500).json({ success: false, message: error.message })
  }
})

// 添加参与者
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, phone, openid, avatar } = req.body as CreateParticipantDto
    if (!name) {
      return res.status(400).json({ success: false, message: '姓名不能为空' })
    }
    
    const status = openid ? 'joined' : 'pending'
    const result = await query<{ insertId: number }[]>(
      'INSERT INTO participants (name, phone, openid, avatar, status) VALUES (?, ?, ?, ?, ?)',
      [name, phone || null, openid || null, avatar || null, status]
    )
    
    const [newParticipant] = await query<ParticipantRow[]>(
      'SELECT * FROM participants WHERE id = ?',
      [result[0].insertId]
    )
    res.json({ success: true, data: newParticipant })
  } catch (err) {
    const error = err as Error
    res.status(500).json({ success: false, message: error.message })
  }
})

// 更新参与者
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, phone, avatar } = req.body as UpdateParticipantDto
    
    await query(
      'UPDATE participants SET name = ?, phone = ?, avatar = ? WHERE id = ?', 
      [name, phone, avatar, id]
    )
    
    const [participant] = await query<ParticipantRow[]>(
      'SELECT * FROM participants WHERE id = ?',
      [id]
    )
    res.json({ success: true, data: participant })
  } catch (err) {
    const error = err as Error
    res.status(500).json({ success: false, message: error.message })
  }
})

// 删除参与者
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await query('DELETE FROM participants WHERE id = ?', [id])
    res.json({ success: true, message: '删除成功' })
  } catch (err) {
    const error = err as Error
    res.status(500).json({ success: false, message: error.message })
  }
})

// 批量添加参与者
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { participants } = req.body as { participants: CreateParticipantDto[] }
    if (!Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ success: false, message: '请提供有效的参与者列表' })
    }
    
    const values = participants.map(p => [
      p.name, 
      p.phone || null, 
      p.openid || null, 
      p.avatar || null, 
      'pending'
    ])
    
    await query(
      'INSERT INTO participants (name, phone, openid, avatar, status) VALUES ?', 
      [values]
    )
    
    res.json({ success: true, message: `成功添加 ${participants.length} 名参与者` })
  } catch (err) {
    const error = err as Error
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
