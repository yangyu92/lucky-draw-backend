import { Router, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import QRCode from 'qrcode'
import axios from 'axios'
import { getClient } from '../config/redis'
import { query } from '../config/database'
import type { ApiResponse, CheckinRequest, QRCodeData } from '../types'
import type { ParticipantRow, WechatQRStatus } from '../types/models'
import type { RedisClientType } from 'redis'

const router = Router()

const WECHAT_APPID = process.env.WECHAT_APPID || 'wx22a171f2ccde86a8'
const WECHAT_APPSECRET = process.env.WECHAT_APPSECRET || 'd6049cb54fa1a1e921a46fc60019361b'

// 获取微信授权二维码
router.get('/qrcode', async (req: Request, res: Response<ApiResponse<QRCodeData>>) => {
  try {
    const sceneStr = uuidv4()
    const client: RedisClientType = await getClient()
    
    // 存储场景字符串，设置5分钟过期
    await client.setEx(
      `wechat:qr:${sceneStr}`, 
      300, 
      JSON.stringify({ status: 'pending', created: Date.now() } as WechatQRStatus)
    )
    
    // 生成授权URL（实际项目中应该是微信授权回调地址）
    const callbackUrl = process.env.WECHAT_CALLBACK_URL || 
      `${req.protocol}://${req.get('host')}/api/wechat/callback`
    const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${WECHAT_APPID}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=snsapi_base&state=${sceneStr}#wechat_redirect`
    
    // 生成二维码
    const qrCodeDataUrl = await QRCode.toDataURL(authUrl, {
      width: 200,
      margin: 2,
      color: { dark: '#333333', light: '#ffffff' }
    })
    
    const data: QRCodeData = { sceneStr, qrCode: qrCodeDataUrl, authUrl }
    res.json({ success: true, data })
  } catch (err) {
    console.error('QRCode error:', err)
    res.status(500).json({ success: false, message: '生成二维码失败' })
  }
})

// 检查扫码状态
router.get('/check/:sceneStr', async (req: Request, res: Response) => {
  try {
    const { sceneStr } = req.params
    const client: RedisClientType = await getClient()
    const data = await client.get(`wechat:qr:${sceneStr}`)
    
    if (!data) {
      return res.status(404).json({ success: false, message: '二维码已过期' })
    }
    
    const status: WechatQRStatus = JSON.parse(data)
    res.json({ success: true, data: status })
  } catch (err) {
    const error = err as Error
    res.status(500).json({ success: false, message: error.message })
  }
})

// 微信授权回调
router.get('/callback', async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query
    if (!code || !state) {
      res.status(400).send('Invalid callback')
      return
    }
    
    // 通过code获取openid
    const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${WECHAT_APPID}&secret=${WECHAT_APPSECRET}&code=${code}&grant_type=authorization_code`
    const response = await axios.get(url)
    const { openid, unionid } = response.data as { openid?: string; unionid?: string }
    
    if (openid) {
      // 更新Redis状态
      const client: RedisClientType = await getClient()
      await client.setEx(
        `wechat:qr:${state}`, 
        300, 
        JSON.stringify({ 
          status: 'scanned', 
          openid,
          unionid,
          scanned: Date.now() 
        } as WechatQRStatus)
      )
      
      // 更新或创建参与者
      const existing = await query<ParticipantRow[]>(
        'SELECT * FROM participants WHERE openid = ?', 
        [openid]
      )
      
      if (existing.length > 0) {
        await query(
          'UPDATE participants SET status = ? WHERE openid = ?', 
          ['joined', openid]
        )
      }
    }
    
    // 返回简单页面
    res.send('<html><body><h1>签到成功</h1><p>请关闭此页面</p><script>window.close()</script></body></html>')
  } catch (err) {
    console.error('Callback error:', err)
    res.status(500).send('Error')
  }
})

// 手动签到（用于测试）
router.post('/checkin', async (req: Request, res: Response) => {
  try {
    const { name, phone, openid } = req.body as CheckinRequest
    if (!name) {
      return res.status(400).json({ success: false, message: '姓名不能为空' })
    }
    
    // 检查是否已签到
    const existing = openid 
      ? await query<ParticipantRow[]>('SELECT * FROM participants WHERE openid = ?', [openid])
      : []
    
    if (existing.length > 0) {
      await query(
        'UPDATE participants SET status = ? WHERE openid = ?', 
        ['joined', openid]
      )
      res.json({ success: true, data: existing[0], message: '签到成功' })
      return
    }
    
    // 创建新参与者
    const result = await query<{ insertId: number }[]>(
      'INSERT INTO participants (name, phone, openid, status) VALUES (?, ?, ?, ?)',
      [name, phone || null, openid || null, 'joined']
    )
    
    const [participant] = await query<ParticipantRow[]>(
      'SELECT * FROM participants WHERE id = ?',
      [result[0].insertId]
    )
    res.json({ success: true, data: participant, message: '签到成功' })
  } catch (err) {
    const error = err as Error
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
