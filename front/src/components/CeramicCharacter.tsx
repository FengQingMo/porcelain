import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

const CharacterContainer = styled('div')({
  position: 'fixed',
  bottom: '20px',
  right: '20px',
  width: '200px',
  height: '200px',
  zIndex: 1000,
  cursor: 'pointer',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)'
  }
});

const StyledCanvas = styled(Canvas)({
  width: '100%',
  height: '100%',
  background: 'transparent'
});

const MessageDisplay = styled('div')<{ isVisible: boolean }>(({ isVisible }) => ({
  position: 'absolute',
  bottom: '100%',
  right: '0',
  backgroundColor: 'rgba(26, 75, 140, 0.9)',
  color: 'white',
  padding: '15px 20px',
  borderRadius: '12px',
  marginBottom: '15px',
  maxWidth: '400px',
  minWidth: '300px',
  fontSize: '15px',
  lineHeight: '1.6',
  opacity: isVisible ? 1 : 0,
  visibility: isVisible ? 'visible' : 'hidden',
  transition: 'opacity 0.8s ease-in-out, visibility 0.8s ease-in-out, transform 0.8s ease-in-out',
  pointerEvents: 'auto',
  whiteSpace: 'pre-line',
  wordWrap: 'break-word',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  transform: `translateY(${isVisible ? '0' : '-20px'})`,
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-10px',
    right: '30px',
    width: '0',
    height: '0',
    borderLeft: '10px solid transparent',
    borderRight: '10px solid transparent',
    borderTop: '10px solid rgba(26, 75, 140, 0.9)'
  }
}));

const ChatButton = styled(IconButton)({
  position: 'absolute',
  top: '10px',
  right: '10px',
  backgroundColor: 'rgba(26, 75, 140, 0.9)',
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(26, 75, 140, 1)'
  }
});

const CloseButton = styled(IconButton)({
  position: 'absolute',
  top: '5px',
  right: '5px',
  color: 'white',
  padding: '4px',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  }
});

const ModelViewer: React.FC = () => {
  const { scene } = useGLTF('/role/qingci.glb');

  return (
    <primitive 
      object={scene} 
      scale={[0.8, 0.8, 0.8]}
      position={[0, 0, 0]}
      rotation={[0, Math.PI / 4, 0]}
    />
  );
};

// 修改路由相关的消息映射，将每个页面的消息合并成一个字符串
const pageMessages: { [key: string]: string[] } = {
  '/': [  // 时空脉络（首页）
    '欢迎来到陶瓷历史长廊！在这里你可以探索中国陶瓷的发展历程。\n\n通过左右按钮或时间轴，你可以穿越不同的朝代，了解各个时期的陶瓷特点。\n\n地图上的高亮区域显示了重要的制瓷中心，图表展示了各个时期的工艺特征。'
  ],
  '/explore': [  // 陶瓷3D展示
    '欢迎来到陶瓷3D展示区！\n\n这里收藏了各个时期的精美瓷器，你可以近距离欣赏它们的釉色和纹样，感受匠人的智慧。'
  ],
  '/kiln': [  // 窑炉模拟
    '这里是窑炉模拟器，你可以亲自体验制瓷的过程！\n\n选择瓷器的类型和形状，调整烧制温度，让我们一起创作独特的作品。\n\n注意观察火候的掌控，这关系到瓷器的成败哦！\n\n期待看到你的杰作！'
  ],
  '/ceramic-gallery': [  // 陶瓷图鉴
    '欢迎进入沉浸式陶瓷图鉴！\n\n在这里，每一次滚动都是一次穿越时空的艺术之旅。\n\n让我们一起探索中国陶瓷艺术的瑰宝，感受科技与传统的完美融合。'
  ],
  '/ai-chat': [  // AI 对话
    '有任何关于陶瓷的问题都可以问我哦！\n\n我知道很多有趣的陶瓷知识，让我们开始聊天吧！\n\n期待和你进行有趣的交流！'
  ]
};

// 鼠标悬停消息
const hoverMessages = [
  '你好！我是青瓷，很高兴认识你！',
  '想了解更多关于陶瓷的知识吗？',
  '点击我，我们可以聊聊陶瓷的故事。',
  '陶瓷艺术博大精深，让我们一起探索吧！'
];

const CeramicCharacter: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [hasShownIntro, setHasShownIntro] = useState(false);
  const [currentPath, setCurrentPath] = useState(location.pathname);
  const hideTimeoutRef = useRef<number>();

  // 清理函数
  const clearMessageTimeout = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = undefined;
    }
  };

  // 设置消息显示
  const showMessageWithTimeout = (text: string, duration: number = 6000) => {
    clearMessageTimeout();
    setMessage(text);
    setShowMessage(true);

    hideTimeoutRef.current = setTimeout(() => {
      setShowMessage(false);
    }, duration);
  };

  // 当路径改变时重置状态
  useEffect(() => {
    if (currentPath !== location.pathname) {
      clearMessageTimeout();
      setCurrentPath(location.pathname);
      setHasShownIntro(false);
    }
  }, [location.pathname, currentPath]);

  // 显示页面介绍
  useEffect(() => {
    const currentPageMessages = pageMessages[location.pathname];
    if (currentPageMessages && !hasShownIntro) {
      showMessageWithTimeout(currentPageMessages[0]);
      setHasShownIntro(true);
    }
  }, [location.pathname, hasShownIntro]);

  // 清理副作用
  useEffect(() => {
    return () => {
      clearMessageTimeout();
    };
  }, []);

  const handleMouseEnter = () => {
    if (hasShownIntro && !hideTimeoutRef.current) {
      showMessageWithTimeout(
        hoverMessages[Math.floor(Math.random() * hoverMessages.length)],
        2000
      );
    }
  };

  const handleMouseLeave = () => {
    if (!hideTimeoutRef.current) {
      setShowMessage(false);
    }
  };

  const handleClick = () => {
    navigate('/ai-chat');
  };

  // 添加调试日志
  useEffect(() => {
    console.log('Current pathname:', location.pathname);
    console.log('Has messages for this path:', !!pageMessages[location.pathname]);
  }, [location.pathname]);

  const handleCloseMessage = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    setShowMessage(false);
    clearMessageTimeout();
  };

  return (
    <CharacterContainer onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={handleClick}>
      <StyledCanvas camera={{ position: [0, 0, 1.5], fov: 45 }}>
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <directionalLight position={[-5, 5, -5]} intensity={0.8} />
        <directionalLight position={[0, -5, 0]} intensity={0.5} />
        <pointLight position={[0, 0, 2]} intensity={0.8} />
        <ModelViewer />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          minPolarAngle={Math.PI / 2} 
          maxPolarAngle={Math.PI / 2}
          autoRotate
          autoRotateSpeed={2}
        />
      </StyledCanvas>
      <MessageDisplay isVisible={showMessage}>
        <CloseButton size="small" onClick={handleCloseMessage}>
          <CloseIcon fontSize="small" />
        </CloseButton>
        {message}
      </MessageDisplay>
      <ChatButton size="small" onClick={handleClick}>
        <ChatIcon />
      </ChatButton>
    </CharacterContainer>
  );
};

export default CeramicCharacter; 