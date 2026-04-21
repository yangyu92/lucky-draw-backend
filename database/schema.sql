-- 参与人员表
CREATE TABLE IF NOT EXISTS participants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL COMMENT '姓名',
  phone VARCHAR(20) COMMENT '手机号',
  avatar VARCHAR(255) COMMENT '头像URL',
  openid VARCHAR(100) UNIQUE COMMENT '微信openid',
  status ENUM('pending', 'joined', 'won') DEFAULT 'pending' COMMENT '状态：pending-未签到 joined-已签到 won-已中奖',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_openid (openid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='参与人员表';

-- 奖品表
CREATE TABLE IF NOT EXISTS prizes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT '奖品名称',
  image_url VARCHAR(255) COMMENT '奖品图片',
  level ENUM('特等奖', '一等奖', '二等奖', '三等奖', '参与奖') DEFAULT '参与奖' COMMENT '奖品等级',
  quantity INT DEFAULT 1 COMMENT '奖品总数',
  remaining INT DEFAULT 1 COMMENT '剩余数量',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_level (level),
  INDEX idx_remaining (remaining)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='奖品表';

-- 中奖记录表
CREATE TABLE IF NOT EXISTS winners (
  id INT PRIMARY KEY AUTO_INCREMENT,
  participant_id INT NOT NULL COMMENT '参与者ID',
  prize_id INT NOT NULL COMMENT '奖品ID',
  draw_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '抽奖时间',
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
  FOREIGN KEY (prize_id) REFERENCES prizes(id) ON DELETE CASCADE,
  INDEX idx_participant (participant_id),
  INDEX idx_prize (prize_id),
  INDEX idx_draw_time (draw_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='中奖记录表';

-- 主题配置表
CREATE TABLE IF NOT EXISTS themes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL COMMENT '主题名称',
  background_image VARCHAR(255) COMMENT '背景图片URL',
  primary_color VARCHAR(20) DEFAULT '#667eea' COMMENT '主色调',
  secondary_color VARCHAR(20) DEFAULT '#764ba2' COMMENT '次要色调',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='主题配置表';

-- 初始化默认主题
INSERT INTO themes (name, primary_color, secondary_color) VALUES ('默认主题', '#667eea', '#764ba2');
