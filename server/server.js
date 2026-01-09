require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const axios = require('axios');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 7777;

// 创建日志写入函数
const writeLog = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(path.join(__dirname, 'server.log'), logMessage);
};

// Middleware
app.use(express.json());
app.use(express.static('public'));

// 允许所有来源的跨域请求
app.use(cors());

// Handle preflight requests
app.options('*', cors());

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: 'sk-GgHhVId7SF',
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
});

// 图片生成接口
app.post('/api/v1/services/aigc/text2image/image-synthesis', async (req, res) => {
  writeLog('收到图片生成请求');
  writeLog(`请求头: ${JSON.stringify(req.headers)}`);
  writeLog(`请求体: ${JSON.stringify(req.body)}`);

  try {
    const response = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
      req.body,
      {
        headers: {
          'Authorization': 'Bearersk-GgHhVId7SF',
          'Content-Type': 'application/json',
          'X-DashScope-Async': 'enable'
        },
        timeout: 30000
      }
    );

    writeLog(`DashScope响应: ${JSON.stringify(response.data)}`);
    res.json(response.data);
  } catch (error) {
    writeLog(`图片生成失败: ${error.response?.data || error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// 任务状态查询接口
app.get('/api/v1/tasks/:taskId', async (req, res) => {
  writeLog('收到任务状态查询请求');
  writeLog(`任务ID: ${req.params.taskId}`);
  writeLog(`请求头: ${JSON.stringify(req.headers)}`);

  try {
    const response = await axios.get(
      `https://dashscope.aliyuncs.com/api/v1/tasks/${req.params.taskId}`,
      {
        headers: {
          'Authorization': `Bearer sk-GgHhVId7SF`,
          'Content-Type': 'application/json; charset=UTF-8'
        },
        timeout: 30000
      }
    );

    writeLog(`DashScope响应: ${JSON.stringify(response.data)}`);
    res.json(response.data);
  } catch (error) {
    writeLog(`任务状态查询失败: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// AI对话接口
app.post('/api/chat', async (req, res) => {
  writeLog('收到AI对话请求');
  writeLog(`请求头: ${JSON.stringify(req.headers)}`);
  writeLog(`请求体: ${JSON.stringify(req.body)}`);

  // 设置响应头以支持SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const completion = await openai.chat.completions.create({
      model: "qwen-max-0428",
      messages: req.body.messages,
      stream: true,
    });

    // 流式发送响应
    for await (const chunk of completion) {
      const data = JSON.stringify(chunk);
      res.write(`data: ${data}\n\n`);
    }

    // 发送完成标记
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    writeLog(`AI对话失败: ${error.message}`);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

app.listen(port, () => {
  writeLog(`服务器运行在 http://localhost:${port}`);
}); 