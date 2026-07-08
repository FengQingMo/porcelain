import React, { useState, Suspense, lazy, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Button, Fade, CircularProgress, Backdrop } from '@mui/material';
import { styled } from '@mui/material/styles';
// import CeramicHistoryMap from './CeramicHistoryMap.tsx';
// import Timeline from './Timeline.tsx';
const CeramicHistoryMap = lazy(() => import('./CeramicHistoryMap.tsx'));
const Timeline = lazy(() => import('./Timeline.tsx'));

const Container = styled('div')({
  position: 'relative',
  width: '100%',
  height: '100vh',
  overflow: 'hidden',
  backgroundColor: '#f5f5f5'
});

const ContentContainer = styled('div')({
  position: 'absolute',
  top: -50,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 1
});

const OverlayContainer = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 2,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  color: '#fff',
  textAlign: 'center',
  padding: '20px'
});

const OverlayContent = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
});

const Title = styled(Typography)({
  fontSize: '3rem',
  fontWeight: 'bold',
  marginBottom: '20px',
  textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
});

const Subtitle = styled(Typography)({
  fontSize: '1.5rem',
  marginBottom: '40px',
  maxWidth: '800px',
  margin: '0 auto 40px'
});

const StartButton = styled(Button)({
  padding: '15px 40px',
  fontSize: '1.2rem',
  backgroundColor: '#1976d2',
  '&:hover': {
    backgroundColor: '#1565c0'
  }
});

const LoadingContainer = styled('div')({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  color: '#fff',
  zIndex: 1000
});

const CeramicHistory: React.FC = () => {
  const [showOverlay, setShowOverlay] = useState(() => {
    const hasVisited = localStorage.getItem('hasVisitedCeramicHistory');
    return !hasVisited;
  });
  const [exploreStarted, setExploreStarted] = useState(() => {
    const hasVisited = localStorage.getItem('hasVisitedCeramicHistory');
    return !!hasVisited;
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = () => {
    setIsLoading(true);
    setShowOverlay(false);
    localStorage.setItem('hasVisitedCeramicHistory', 'true');
    setTimeout(() => {
      setExploreStarted(true);
      setIsLoading(false);
    }, 300);
  };

  return (
    <Container>
      <ContentContainer>
        {!showOverlay && exploreStarted && (
          <Suspense fallback={
            <LoadingContainer>
              <CircularProgress color="inherit" />
              <Typography variant="h6" sx={{ mt: 2 }}>正在加载地图...</Typography>
            </LoadingContainer>
          }>
            <CeramicHistoryMap />
          </Suspense>
        )}
      </ContentContainer>
      <Fade in={showOverlay}>
        <OverlayContainer>
          <OverlayContent>
            <Title variant="h1">
              探索中国陶瓷发展史
            </Title>
            <Subtitle variant="h2">
              从新石器时代的陶器起源，到明清时期的瓷器工艺巅峰，
              让我们一起穿越时空，见证中国陶瓷艺术的辉煌历程。
              {/* <Box component="span" sx={{ display: 'block', fontSize: '1rem', mt: 2, color: '#FFD4A4' }}>
                探索地图上的著名窑址标记，点击可查看详细信息。
              </Box> */}
            </Subtitle>
            <StartButton
              variant="contained"
              size="large"
              onClick={handleStart}
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                '开始探索'
              )}
            </StartButton>
          </OverlayContent>
        </OverlayContainer>
      </Fade>
    </Container>
  );
};

export default CeramicHistory; 