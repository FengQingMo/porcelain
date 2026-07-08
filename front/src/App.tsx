import React, { Suspense, lazy, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation.tsx';
import DefaultLayout from './components/DefaultLayout.tsx';
import { CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

// 懒加载组件
const CeramicHistory = lazy(() => import('./components/CeramicHistory.tsx'));
const KilnSimulator = lazy(() => import('./components/KilnSimulator.tsx'));
const Craftsmanship = lazy(() => import('./components/Craftsmanship.tsx'));
const AIChat = lazy(() => import('./components/AIChat.tsx'));
const CeramicExploration = lazy(() => import('./components/CeramicExploration.tsx'));
const CeramicDetail = lazy(() => import('./components/CeramicDetail.tsx'));
const CeramicGallery = lazy(() => import('./components/CeramicGallery.tsx'));

// Styled components
const LoadingContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh'
});

// Loading 组件
const LoadingFallback = () => (
  <LoadingContainer>
    <CircularProgress />
  </LoadingContainer>
);

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#8B4513',
    },
    secondary: {
      main: '#D2691E',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Noto Serif SC", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      textAlign: 'center',
      marginBottom: '2rem',
    },
  },
  components: {}
});

// 预加载其他路由
const prefetchRoutes = () => {
  // 定义需要预加载的组件
  const components = {
    CeramicGallery: () => import('./components/CeramicGallery.tsx'),
    CeramicExploration: () => import('./components/CeramicExploration.tsx'),
    KilnSimulator: () => import('./components/KilnSimulator.tsx'),
    AIChat: () => import('./components/AIChat.tsx'),
    CeramicDetail: () => import('./components/CeramicDetail.tsx'),
    Craftsmanship: () => import('./components/Craftsmanship.tsx')
  };
  
  // 当首页加载完成后，预加载其他组件
  setTimeout(() => {
    Object.values(components).forEach(importFn => {
      importFn().catch(console.error);
    });
  }, 2000);
};

// 预加载资源
const prefetchResources = () => {
  const resources = [
    '/images/logo.png',
    '/images/banner.jpg',
    '/images/gallery-bg.jpg',
    // Add more resources as needed
  ];

  resources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = resource;
    document.head.appendChild(link);
  });
};

function App() {
  useEffect(() => {
    prefetchRoutes();
    prefetchResources();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navigation />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<CeramicHistory />} />
          <Route path="/catalog" element={<CeramicGallery />} />
          <Route path="/kiln" element={<DefaultLayout><KilnSimulator /></DefaultLayout>} />
          <Route path="/craftsmanship" element={<DefaultLayout><Craftsmanship /></DefaultLayout>} />
          <Route path="/ai-chat" element={<AIChat />} />
          <Route path="/explore" element={<DefaultLayout><CeramicExploration /></DefaultLayout>} />
          <Route path="/ceramic/:id" element={<DefaultLayout><CeramicDetail /></DefaultLayout>} />
        </Routes>
      </Suspense>
    </ThemeProvider>
  );
}

export default App; 