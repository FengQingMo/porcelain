import React from 'react';
import { motion } from 'framer-motion';
import { pageTransitions, parallaxEffects } from '../styles/animations';

interface AnimatedContainerProps {
  children: React.ReactNode;
  animation?: keyof typeof pageTransitions;
  parallax?: keyof typeof parallaxEffects;
  className?: string;
}

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  animation = 'fadeIn',
  parallax,
  className
}) => {
  const animationProps = pageTransitions[animation];
  const parallaxProps = parallax ? parallaxEffects[parallax] : {};

  return (
    <motion.div
      {...animationProps}
      {...parallaxProps}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 陶瓷展示容器组件
export const CeramicDisplayContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <AnimatedContainer
      animation="slideUp"
      parallax="basic"
      className={className}
    >
      {children}
    </AnimatedContainer>
  );
};

// 页面过渡容器组件
export const PageTransitionContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <AnimatedContainer
      animation="fadeIn"
      className={className}
    >
      {children}
    </AnimatedContainer>
  );
}; 