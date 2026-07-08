import React from 'react';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import { PageTransitionContainer, CeramicDisplayContainer } from '../components/AnimatedContainer';
import { animationStyles, ceramicAnimations } from '../styles/animations';

// Create a styled component for the ceramic image container
const CeramicImageContainer = styled.div({
  position: 'relative' as const,
  overflow: 'hidden' as const,
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
    position: 'absolute' as const,
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
});

// 示例陶瓷数据
const ceramicItems = [
  {
    id: 1,
    name: '青花瓷花瓶',
    image: '/images/vase1.jpg',
    description: '典型的青花瓷器，展现传统工艺之美'
  },
  {
    id: 2,
    name: '汝窑天青釉盘',
    image: '/images/plate1.jpg',
    description: '天青釉的独特韵味'
  },
  // 可以添加更多陶瓷项目
];

const CeramicShowcase: React.FC = () => {
  return (
    <PageTransitionContainer>
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          陶瓷艺术展示
        </h1>
        
        {/* 网格布局展示陶瓷作品 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ceramicItems.map((item) => (
            <CeramicDisplayContainer key={item.id}>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* 使用动画样式的图片容器 */}
                <CeramicImageContainer>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-64 object-cover"
                  />
                </CeramicImageContainer>
                
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            </CeramicDisplayContainer>
          ))}
        </div>

        {/* 3D展示区域 */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-8 text-center">
            3D 展示效果
          </h2>
          <motion.div
            className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center"
            animate={{
              rotateY: 360,
              transition: {
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }
            }}
          >
            <div className="w-64 h-64 bg-blue-500 rounded-lg">
              {/* 这里可以放置实际的3D模型 */}
            </div>
          </motion.div>
        </div>

        {/* 滚动视差效果区域 */}
        <div className="mt-16 space-y-8">
          <h2 className="text-3xl font-bold mb-8 text-center">
            视差滚动效果
          </h2>
          
          <motion.div
            className="p-8 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-2xl font-semibold mb-4">传统工艺</h3>
            <p className="text-gray-700">
              陶瓷艺术是中国传统文化的重要组成部分，
              数千年来的传承与创新造就了独特的审美价值。
            </p>
          </motion.div>

          <motion.div
            className="p-8 bg-gradient-to-r from-green-50 to-green-100 rounded-lg"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="text-2xl font-semibold mb-4">现代演绎</h3>
            <p className="text-gray-700">
              当代陶瓷艺术在保持传统工艺精髓的同时，
              也在不断探索新的表现形式和艺术语言。
            </p>
          </motion.div>
        </div>
      </div>
    </PageTransitionContainer>
  );
};

export default CeramicShowcase; 