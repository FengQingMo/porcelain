import React, { useState, useEffect, useRef } from 'react';
import { TextField, Button, Paper, Typography, CircularProgress, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';

// 自定义消息容器样式
const MessageContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  marginBottom: theme.spacing(2),
  alignItems: 'flex-start',
  '&.user': {
    flexDirection: 'row-reverse',
  }
}));

const MessageBubble = styled('div')(({ theme }) => ({
  maxWidth: '70%',
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  marginLeft: theme.spacing(1),
  marginRight: theme.spacing(1),
  position: 'relative',
  '&.user': {
    backgroundColor: '#1a4b8c',
    color: '#ffffff',
    borderTopRightRadius: 0,
  },
  '&.assistant': {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    color: '#1a4b8c',
    borderTopLeftRadius: 0,
    border: '1px solid rgba(26, 75, 140, 0.2)',
    boxShadow: '0 2px 4px rgba(26, 75, 140, 0.1)',
  }
}));

const Container = styled('div')(({ theme }) => ({
  maxWidth: 800,
  margin: '0 auto',
  padding: theme.spacing(2),
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  minHeight: '90vh',
  '&::before': {
    content: '""',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `url('/images/qinghua_bg.png') repeat`,
    backgroundSize: '400px',
    opacity: 0.1,
    zIndex: -1,
  },
  '&::after': {
    content: '""',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 248, 255, 0.9) 100%)',
    zIndex: -1,
  }
}));

const MessageList = styled('div')(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  marginBottom: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
}));

const InputContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  position: 'sticky',
  bottom: 0,
  background: 'rgba(255, 255, 255, 0.9)',
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
  zIndex: 1,
}));

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    { 
      role: "system", 
      content: "你是一个名叫'青瓷'的AI助手，精通中国陶瓷艺术和制作工艺。你的使命是帮助人们了解瓷器的历史、工艺和鉴赏。请用一句话向用户介绍你自己。" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const hasInitializedRef = useRef(false);

  // 初始欢迎消息
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      const welcomeMessage = {
        role: "assistant",
        content: "你好！我是青瓷，一位专注于中国陶瓷艺术的AI助手。有什么我可以帮你的吗？"
      };
      setMessages(prev => [...prev, welcomeMessage]);
    }
  }, []);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSend = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setStreamingContent('');

    try {
      const response = await fetch(
        'http://47.93.216.125:7777/api/chat',
        // 'http://192.168.133.251:7777/api/chat',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
          },
          body: JSON.stringify({
            messages: [...messages, userMessage]
          })
        }
      );

      const reader = response.body?.getReader();
      if (!reader) throw new Error('无法读取响应流');

      let accumulatedContent = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setMessages(prev => [...prev, { role: "assistant", content: accumulatedContent }]);
              setStreamingContent('');
            } else {
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices[0]?.delta?.content || '';
                accumulatedContent += content;
                setStreamingContent(accumulatedContent);
              } catch (e) {
                console.error('解析响应数据失败:', e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('AI响应失败:', error);
      alert('AI响应失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom align="center" sx={{ 
        color: '#1a4b8c', 
        fontFamily: "'Ma Shan Zheng', cursive",
        textShadow: '2px 2px 4px rgba(26, 75, 140, 0.2)'
      }}>
        青瓷 AI 助手
      </Typography>

      <MessageList>
        <Paper sx={{ 
          flex: 1,
          overflow: 'auto', 
          p: 2, 
          bgcolor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          border: '1px solid rgba(26, 75, 140, 0.1)',
          boxShadow: '0 4px 20px rgba(26, 75, 140, 0.1)'
        }}>
          {messages.slice(1).map((message, index) => (
            <MessageContainer key={index} className={message.role === 'user' ? 'user' : ''}>
              <Avatar
                sx={{
                  bgcolor: message.role === 'user' ? 'primary.main' : '#a8d8ea',
                  width: 32,
                  height: 40
                }}
                src={message.role === 'assistant' ? '/images/qingci.webp' : undefined}
              >
                {message.role === 'user' ? '我' : '青'}
              </Avatar>
              <MessageBubble className={message.role}>
                <Typography variant="body1">
                  {message.content}
                </Typography>
              </MessageBubble>
            </MessageContainer>
          ))}
          {streamingContent && (
            <MessageContainer>
              <Avatar
                sx={{
                  bgcolor: '#a8d8ea',
                  width: 40,
                  height: 40
                }}
                src="/images/qingci.webp"
              >
                青
              </Avatar>
              <MessageBubble className="assistant">
                <Typography variant="body1">
                  {streamingContent}
                </Typography>
              </MessageBubble>
            </MessageContainer>
          )}
          <div ref={messagesEndRef} />
        </Paper>
      </MessageList>

      <InputContainer>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="请输入您的问题..."
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(26, 75, 140, 0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: 'rgba(26, 75, 140, 0.4)',
                bgcolor: 'rgba(255, 255, 255, 0.95)',
              },
              '&.Mui-focused': {
                borderColor: '#1a4b8c',
                boxShadow: '0 0 0 2px rgba(26, 75, 140, 0.2)',
              }
            }
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          sx={{
            bgcolor: '#1a4b8c',
            borderRadius: 3,
            minWidth: '120px',
            '&:hover': {
              bgcolor: '#143a70'
            }
          }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : '发送'}
        </Button>
      </InputContainer>
    </Container>
  );
};

export default AIChat;