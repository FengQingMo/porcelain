import React, { useEffect, useRef } from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import CeramicCharacter from './CeramicCharacter.tsx';

// 样式化组件
const StyledAppBar = styled(AppBar)({
  background: 'linear-gradient(135deg, #FFF6F0 0%, #FFE4D6 50%, #FFD4C2 100%)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  position: 'relative',
  zIndex: 1100,
});

const StyledToolbar = styled(Toolbar)({
  justifyContent: 'space-between',
  padding: '0.5rem 2rem',
  minHeight: '70px',
});

const Logo = styled(Typography)({
  color: '#1a4b8c',
  fontWeight: 600,
  fontSize: '1.4rem',
  whiteSpace: 'nowrap',
  position: 'relative',
  zIndex: 1200,
  marginRight: '2rem',
});

const NavContainer = styled(Box)({
  position: 'relative',
  display: 'flex',
  gap: '1rem',
  padding: '0.5rem',
});

const StyledRouterLink = styled(RouterLink)({
  color: '#1a4b8c',
  padding: '0.5rem 1.5rem',
  borderRadius: '1.5rem',
  fontSize: '1rem',
  fontWeight: 500,
  transition: 'all 0.3s ease',
  zIndex: 2,
  textDecoration: 'none',
  display: 'inline-block',
  '&:hover': {
    background: 'transparent',
    textDecoration: 'none',
  },
});

interface NavButtonProps {
  to: string;
  children: React.ReactNode;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ to, children, onMouseEnter, onMouseLeave }) => (
  <StyledRouterLink
    to={to}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    {children}
  </StyledRouterLink>
);

const Slider = styled('div')({
  position: 'absolute',
  height: '85%',
  borderRadius: '1.5rem',
  transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1.05)',
  background: 'linear-gradient(45deg, rgba(26, 75, 140, 0.15), rgba(26, 75, 140, 0.25))',
  boxShadow: '0 2px 8px rgba(26, 75, 140, 0.1)',
  zIndex: 1,
});

const Navigation: React.FC = () => {
  const location = useLocation();
  const sliderRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const routes = [
    { path: '/', label: '时空脉络' },
    { path: '/catalog', label: '陶瓷图鉴' },
    { path: '/explore', label: '陶瓷3D展示' },
    { path: '/kiln', label: '窑炉模拟' },
    { path: '/ai-chat', label: 'AI 对话' },
  ];

  // 更新滑块位置
  const updateSliderPosition = (element: HTMLElement | null) => {
    if (element && sliderRef.current) {
      const { offsetLeft, offsetWidth } = element;
      sliderRef.current.style.left = `${offsetLeft}px`;
      sliderRef.current.style.width = `${offsetWidth}px`;
    }
  };

  // 初始化和路由变化时更新滑块
  useEffect(() => {
    if (navRef.current) {
      const activeButton = navRef.current.querySelector(`a[href="${location.pathname}"]`);
      updateSliderPosition(activeButton as HTMLElement);
    }
  }, [location.pathname]);

  return (
    <>
      <StyledAppBar position="static">
        <StyledToolbar>
          <Logo variant="h6">
            瓷语千年--陶瓷技艺数字化图谱
          </Logo>
          <NavContainer ref={navRef}>
            <Slider ref={sliderRef} />
            {routes.map((route) => (
              <NavButton
                key={route.path}
                to={route.path}
                onMouseEnter={(e) => {
                  const button = e.currentTarget as HTMLElement;
                  updateSliderPosition(button);
                }}
                onMouseLeave={() => {
                  const activeButton = (navRef.current?.querySelector(`a[href="${location.pathname}"]`) as HTMLElement) || null;
                  updateSliderPosition(activeButton);
                }}
              >
                {route.label}
              </NavButton>
            ))}
          </NavContainer>
        </StyledToolbar>
      </StyledAppBar>
      <CeramicCharacter />
    </>
  );
};

export default Navigation; 