/**
 * API 相关类型定义
 */
import type { Request, Response, NextFunction } from 'express'

/**
 * 通用API响应
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
}

/**
 * 创建参与者 DTO
 */
export interface CreateParticipantDto {
  name: string
  phone?: string
  openid?: string
  avatar?: string
}

/**
 * 更新参与者 DTO
 */
export interface UpdateParticipantDto {
  name?: string
  phone?: string
  avatar?: string
}

/**
 * 创建奖品 DTO
 */
export interface CreatePrizeDto {
  name: string
  level?: string
  quantity?: number
  image_url?: string
}

/**
 * 更新奖品 DTO
 */
export interface UpdatePrizeDto {
  name?: string
  level?: string
  quantity?: number
  image_url?: string
}

/**
 * 抽奖请求
 */
export interface DrawRequest {
  prizeId: number
  count?: number
}

/**
 * 抽奖结果
 */
export interface DrawResult {
  winners: import('./models').WinnerWithDetails[]
}

/**
 * 微信签到请求
 */
export interface CheckinRequest {
  name: string
  phone?: string
  openid?: string
}

/**
 * 微信二维码数据
 */
export interface QRCodeData {
  sceneStr: string
  qrCode: string
  authUrl: string
}

/**
 * 路由处理器类型
 */
export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>

/**
 * 扩展 Express Request
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number
        openid?: string
      }
    }
  }
}
