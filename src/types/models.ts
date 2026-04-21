/**
 * 数据模型类型定义
 */

// 参与者状态
export type ParticipantStatus = 'pending' | 'joined' | 'won'

// 奖品等级
export type PrizeLevel = '特等奖' | '一等奖' | '二等奖' | '三等奖' | '参与奖'

/**
 * 参与者模型
 */
export interface Participant {
  id: number
  name: string
  phone: string | null
  openid: string | null
  avatar: string | null
  status: ParticipantStatus
  created_at: Date
}

/**
 * 奖品模型
 */
export interface Prize {
  id: number
  name: string
  level: PrizeLevel
  quantity: number
  remaining: number
  image_url: string | null
  created_at: Date
}

/**
 * 中奖记录模型
 */
export interface Winner {
  id: number
  participant_id: number
  prize_id: number
  draw_time: Date
}

/**
 * 中奖记录（含关联信息）
 */
export interface WinnerWithDetails {
  id: number
  participant_id: number
  participantName: string
  phone: string | null
  prize_id: number
  prizeName: string
  prizeLevel: string
  draw_time: Date
}

/**
 * 微信二维码状态
 */
export interface WechatQRStatus {
  status: 'pending' | 'scanned'
  openid?: string
  unionid?: string
  created?: number
  scanned?: number
}
