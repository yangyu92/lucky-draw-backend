# lucky-draw-backend

年会抽奖系统后端，基于 Node.js + Express + MySQL + Redis

## 技术栈

- Node.js 18+
- Express 4
- MySQL 8.0
- Redis 7
- 微信公众号 OAuth2

## 环境变量

创建 `.env` 文件（可选，Docker 启动时有默认值）：

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

## 本地开发

### 1. 用 Docker 启动 MySQL 和 Redis

```bash
docker-compose up -d mysql redis
```

等待数据库就绪（首次启动会自动初始化表结构和示例数据）：

```bash
docker-compose ps   # 确认 mysql 和 redis 状态为 healthy
```

### 2. 创建 `.env` 文件

```bash
cp .env.example .env   # 或手动创建，内容见上方「环境变量」部分
```

### 3. 安装依赖并启动

```bash
npm install
npm run dev    # 开发模式，支持热重载
```

服务启动后访问 http://localhost:8080/api/health 验证。

## Docker 部署（推荐）

使用 Docker Compose 一键启动所有服务（MySQL + Redis + Backend）：

```bash
# 构建并启动
docker-compose up -d --build

# 查看容器状态
docker-compose ps

# 验证服务是否正常
curl http://localhost:8080/api/health
# 预期返回: {"success":true,"message":"Server is running"}
```

启动后的服务端口：

| 服务 | 端口 |
|---|---|
| Backend API | `localhost:8080` |
| MySQL | `localhost:3306` |
| Redis | `localhost:6379` |

### 常用命令

```bash
# 查看后端日志
docker-compose logs -f backend

# 停止所有服务
docker-compose down

# 停止并清除数据（重新初始化数据库）
docker-compose down -v

# 仅重新构建后端（不影响数据库数据）
docker-compose up -d --build backend
```

## API 接口

- `GET  /api/health` — 健康检查
- `GET  /api/participants` — 获取所有参与者
- `POST /api/participants` — 添加参与者
- `POST /api/participants/batch` — 批量添加参与者
- `GET  /api/prizes` — 获取所有奖品
- `POST /api/prizes` — 添加奖品
- `GET  /api/lottery/winners` — 获取中奖记录
- `POST /api/lottery/draw` — 执行抽奖
- `POST /api/lottery/reset` — 重置抽奖
- `GET  /api/wechat/qrcode` — 获取微信签到二维码
- `POST /api/wechat/checkin` — 手动签到（测试用）
