-- 初始化数据库
CREATE DATABASE IF NOT EXISTS lucky_draw DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lucky_draw;

-- 执行schema.sql
SOURCE schema.sql;

-- 插入示例奖品数据
INSERT INTO prizes (name, level, quantity, remaining, image_url) VALUES
('iPhone 15 Pro Max', '特等奖', 1, 1, NULL),
('iPad Pro 2024', '一等奖', 3, 3, NULL),
('AirPods Pro', '二等奖', 5, 5, NULL),
('小米手环8', '三等奖', 10, 10, NULL),
('定制马克杯', '参与奖', 50, 50, NULL);

-- 插入示例参与人员（用于测试）
INSERT INTO participants (name, phone, status) VALUES
('张三', '13800138001', 'pending'),
('李四', '13800138002', 'pending'),
('王五', '13800138003', 'pending'),
('赵六', '13800138004', 'pending'),
('钱七', '13800138005', 'pending'),
('孙八', '13800138006', 'pending'),
('周九', '13800138007', 'pending'),
('吴十', '13800138008', 'pending');
