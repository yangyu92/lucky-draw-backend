# lucky-draw-backend

年会抽奖系统后端，基于 Node.js + Express + MySQL + Redis

## 技术栈

- Node.js 18+
- Express 4
- MySQL 8.0
- Redis 7
- 微信公众号 OAuth2

## 环境变量

创建 `.env` 文件：

```env
PORT=8080
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=lucky_draw
REDIS_URL=redis://localhost:6379
WECHAT_APPID=your_appid
WECHAT_APPSECRET=your_appsecret
```

## 安装运行

```bash
npm install
npm run dev    # 开发模式
npm start       # 生产模式
```

## Docker部署

```bash
docker-compose up -d
```
