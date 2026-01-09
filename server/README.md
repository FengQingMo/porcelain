# Ceramic Culture Server

陶瓷文化数字平台后端服务器

## 本地开发

1. 安装依赖：

```bash
npm install
```

2. 启动服务器：

```bash
npm start
```

## Docker部署

1. 构建镜像：

```bash
docker build -t ceramic-server .
```

2. 使用docker-compose启动：

```bash
docker-compose up -d
```

3. 查看日志：

```bash
docker-compose logs -f
```

4. 停止服务：

```bash
docker-compose down
```

## API端点

- GET `/api/ceramics` - 获取所有陶瓷数据
- GET `/api/ceramics/:id` - 获取特定陶瓷数据
- POST `/api/v1/services/aigc/text2image/image-synthesis` - 图片生成
- GET `/api/v1/tasks/:taskId` - 任务状态查询
- POST `/api/chat` - AI对话接口
