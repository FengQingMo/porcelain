import { keyframes } from '@emotion/react';

// 页面过渡动画
export const pageTransitions = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.5 }
  },
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
    transition: { duration: 0.5, ease: 'easeOut' }
  },
  slideInRight: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 },
    transition: { duration: 0.5, ease: 'easeOut' }
  }
};

// 陶瓷展示载入动画
export const ceramicAnimations = {
  // 淡入上升效果
  fadeInUp: keyframes`
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  `,
  // 3D旋转展示效果
  rotate3D: keyframes`
    from {
      transform: perspective(1000px) rotateY(0deg);
    }
    to {
      transform: perspective(1000px) rotateY(360deg);
    }
  `,
  // 釉面光泽效果
  glazeShine: keyframes`
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  `
};

// 视差滚动效果
export const parallaxEffects = {
  // 基础视差
  basic: {
    translateY: [0, -50],
    opacity: [1, 0.8],
    scale: [1, 0.95],
    transition: { duration: 0.5 }
  },
  // 深度视差
  depth: {
    translateY: [0, -80],
    opacity: [1, 0.7],
    scale: [1, 0.9],
    transition: { duration: 0.8 }
  },
  // 3D视差
  perspective: {
    translateZ: [0, -100],
    rotateX: [0, 10],
    opacity: [1, 0.6],
    transition: { duration: 1 }
  }
};

// 自定义动画组件样式
export const animationStyles = {
  // 陶瓷图片容器
  ceramicImageContainer: {
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      '& img': {
        transform: 'scale(1.05)',
        transition: 'transform 0.5s ease'
      },
      '&::after': {
        opacity: 1
      }
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '200%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
      transform: 'skewX(-25deg)',
      opacity: 0,
      transition: 'opacity 0.5s ease',
      animation: `${ceramicAnimations.glazeShine} 1.5s infinite`
    }
  },
  // 加载中状态
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
    animation: `${ceramicAnimations.fadeInUp} 0.5s ease-out`
  }
}; 