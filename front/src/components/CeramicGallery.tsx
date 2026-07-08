import React, { useEffect, useRef, useState } from 'react';
import { styled } from '@mui/material/styles';
import { Typography, Box, Fab, FormControl, InputLabel, Select, MenuItem, IconButton } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import ceramicsData from '../assets/ceramics_data.json';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const GalleryContainer = styled('div')({
  width: '100vw',
  backgroundColor: '#FFF6F0',
  color: '#4A3B34',
  overflowX: 'hidden',
  margin: 0,
  position: 'relative',
  minHeight: '100vh',
  paddingTop: '80px',
  background: 'linear-gradient(135deg, #FFF6F0 0%, #FFE4D6 50%, #FFD4C2 100%)',
  '&::before': {
    content: '""',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, rgba(255, 246, 240, 0.8), rgba(255, 212, 194, 0.9))',
    backdropFilter: 'blur(8px)',
    zIndex: 0,
  }
});

const Section = styled('section')({
  minHeight: '90vh',
  width: '100vw',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  padding: '30px 0',
  perspective: '1000px',
  willChange: 'transform',
  '&:first-of-type': {
    marginTop: '10px',
  },
  '&:nth-of-type(odd)': {
    justifyContent: 'flex-start',
    '& .content': {
      marginLeft: '10%',
    }
  },
  '&:nth-of-type(even)': {
    justifyContent: 'flex-end',
    '& .content': {
      marginRight: '10%',
    }
  }
});

const ScrollPrompt = styled('div')({
  position: 'fixed',
  bottom: '40px',
  left: '50%',
  transform: 'translateX(-50%)',
  color: '#B98067',
  fontSize: '14px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '10px',
  zIndex: 100,
  '&::after': {
    content: '""',
    width: '20px',
    height: '30px',
    border: '2px solid #B98067',
    borderRadius: '10px',
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '5px',
  },
  '&::before': {
    content: '""',
    width: '4px',
    height: '8px',
    backgroundColor: '#B98067',
    borderRadius: '2px',
    position: 'absolute',
    bottom: '22px',
    animation: 'scrollPrompt 1.5s infinite',
  },
  '@keyframes scrollPrompt': {
    '0%': { transform: 'translateY(-5px)', opacity: 0 },
    '50%': { transform: 'translateY(0)', opacity: 1 },
    '100%': { transform: 'translateY(5px)', opacity: 0 },
  },
});

const Content = styled('div')({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: '40px',
  opacity: 0,
  transform: 'translateY(50px) rotateX(10deg)',
  transformStyle: 'preserve-3d',
  width: '80%',
  maxWidth: '1000px',
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.4))',
  padding: '40px',
  borderRadius: '20px',
  boxShadow: '0 10px 30px rgba(185, 128, 103, 0.15)',
  '&.right': {
    flexDirection: 'row-reverse'
  }
});

const ImageContainer = styled('div')({
  flex: '0 0 50%',
  position: 'relative',
  transformStyle: 'preserve-3d',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.2))',
    transform: 'translateZ(-10px)',
    borderRadius: '8px',
  }
});

const CeramicImage = styled('img')({
  width: '100%',
  height: 'auto',
  borderRadius: '8px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
  transform: 'translateZ(20px)',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateZ(30px)',
  }
});

const TextContent = styled('div')({
  flex: '1',
  transform: 'translateZ(10px)',
});

const ScrollToTopButton = styled(Fab)({
  position: 'fixed',
  top: '80px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 1000,
  backgroundColor: 'rgba(185, 128, 103, 0.9)',
  color: '#fff',
  width: '48px',
  height: '48px',
  minHeight: 'unset',
  '&:hover': {
    backgroundColor: 'rgba(185, 128, 103, 1)',
  },
  transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
});

const FullscreenButton = styled(IconButton)({
  position: 'fixed',
  top: '100px',
  left: '40px',
  zIndex: 1000,
  backgroundColor: 'rgba(185, 128, 103, 0.9)',
  color: '#fff',
  width: '48px',
  height: '48px',
  '&:hover': {
    backgroundColor: 'rgba(185, 128, 103, 1)',
  },
  transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
});

const ImmersiveContent = styled('div')({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: '#000',
  zIndex: 2000,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  visibility: 'hidden',
  transition: 'opacity 0.5s ease-in-out, visibility 0.5s ease-in-out',
  '&.active': {
    opacity: 1,
    visibility: 'visible',
  }
});

const ImmersiveImage = styled('img')({
  maxWidth: '90vw',
  maxHeight: '90vh',
  objectFit: 'contain',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
  }
});

const ImmersiveInfo = styled('div')({
  position: 'absolute',
  bottom: '20px',
  left: '20px',
  color: '#fff',
  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
  maxWidth: '50%',
});

interface CeramicData {
  title: string;
  dynasty: string;
  author: string | null;
  dimensions: {
    height?: number;
    diameter?: number;
  } | null;
  image_url: string;
  local_image: string;
  description: string;
  source_url: string;
}

const dynasties = [
  '全部',
  '现代',
  '近代',
  '古代',
] as const;

const DynastySelect = styled(FormControl)({
  position: 'fixed',
  top: '100px',
  right: '40px',
  width: '200px',
  zIndex: 1000,
  background: 'rgba(255, 255, 255, 0.9)',
  borderRadius: '8px',
  backdropFilter: 'blur(8px)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
});

const CeramicGallery: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedDynasty, setSelectedDynasty] = useState<string>('全部');
  const [filteredCeramics, setFilteredCeramics] = useState<CeramicData[]>([]);
  const [allCeramics, setAllCeramics] = useState<CeramicData[]>([]);
  const [isImmersive, setIsImmersive] = useState(false);
  const [immersiveCeramic, setImmersiveCeramic] = useState<CeramicData | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // 加载数据
    const loadCeramics = async () => {
      try {
        const ceramicsData = (await import('../assets/ceramics_data.json')).default;
        setAllCeramics(ceramicsData);
      } catch (error) {
        console.error('Failed to load ceramics data:', error);
      }
    };
    loadCeramics();
  }, []);

  useEffect(() => {
    // 根据选择的朝代筛选数据
    const filtered = selectedDynasty === '全部'
      ? allCeramics
      : allCeramics.filter(item => {
          if (selectedDynasty === '古代') {
            return !['现代', '近代'].includes(item.dynasty);
          }
          return item.dynasty === selectedDynasty;
        });
    
    setFilteredCeramics(filtered);
  }, [selectedDynasty, allCeramics]);

  useEffect(() => {
    window.scrollTo(0, 0);

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const sections = document.querySelectorAll('section');
    
    sections.forEach((section, index) => {
      const content = section.querySelector('.content');
      
      if (content) {
        gsap.fromTo(
          content,
          {
            opacity: 0,
            y: 100,
            rotateX: 10,
          },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: 'top center',
              end: 'bottom center',
              toggleActions: 'play none none reverse',
              onEnter: () => setCurrentIndex(index),
              onEnterBack: () => setCurrentIndex(index),
              markers: false,
              fastScrollEnd: true,
            }
          }
        );
      }
    });

    // 优化视差滚动效果
    const images = document.querySelectorAll('.ceramic-image');
    images.forEach((image) => {
      gsap.to(image, {
        y: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: image,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.5,
          fastScrollEnd: true,
        }
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      window.removeEventListener('scroll', handleScroll);
    };
  }, [filteredCeramics]);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleImmersiveView = (ceramic: CeramicData) => {
    setImmersiveCeramic(ceramic);
    setIsImmersive(true);
    document.body.style.overflow = 'hidden';
  };

  const exitImmersiveView = () => {
    setIsImmersive(false);
    setImmersiveCeramic(null);
    document.body.style.overflow = 'auto';
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isImmersive) {
        exitImmersiveView();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isImmersive]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <GalleryContainer ref={containerRef}>
      <FullscreenButton
        onClick={toggleFullscreen}
        sx={{
          opacity: 1,
          transform: 'translateY(0)',
        }}
      >
        {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
      </FullscreenButton>

      <DynastySelect>
        <InputLabel id="dynasty-select-label">选择朝代</InputLabel>
        <Select
          labelId="dynasty-select-label"
          value={selectedDynasty}
          label="选择朝代"
          onChange={(e) => setSelectedDynasty(e.target.value)}
        >
          {dynasties.map((dynasty) => (
            <MenuItem key={dynasty} value={dynasty}>
              {dynasty}
            </MenuItem>
          ))}
        </Select>
      </DynastySelect>

      {filteredCeramics.map((ceramic, index) => (
        <Section key={ceramic.title + index} className="section">
          <Content className={`content ${index % 2 === 0 ? '' : 'right'}`}>
            <ImageContainer>
              <CeramicImage 
                src={ceramic.local_image}
                alt={ceramic.title}
                className="ceramic-image"
                onClick={() => handleImmersiveView(ceramic)}
                style={{ cursor: 'pointer' }}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  console.error(`Failed to load image: ${ceramic.local_image}`);
                }}
              />
            </ImageContainer>
            <TextContent>
              <Typography 
                variant="h1" 
                sx={{ 
                  fontSize: '4rem',
                  fontWeight: 'bold',
                  marginBottom: '2rem',
                  background: 'linear-gradient(45deg, #4A3B34, #B98067)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: index % 2 === 0 ? 'left' : 'right',
                }}
              >
                {ceramic.title}
              </Typography>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontSize: '2rem',
                  marginBottom: '1rem',
                  color: '#8B6B5D',
                  textAlign: index % 2 === 0 ? 'left' : 'right',
                }}
              >
                {ceramic.dynasty}
              </Typography>
              {ceramic.author && (
                <Typography 
                  variant="h4"
                  sx={{ 
                    fontSize: '1.5rem',
                    marginBottom: '1rem',
                    color: '#8B6B5D',
                    textAlign: index % 2 === 0 ? 'left' : 'right',
                  }}
                >
                  作者：{ceramic.author}
                </Typography>
              )}
              {ceramic.dimensions && (
                <Typography 
                  variant="h5"
                  sx={{ 
                    fontSize: '1.2rem',
                    marginBottom: '1rem',
                    color: '#8B6B5D',
                    textAlign: index % 2 === 0 ? 'left' : 'right',
                  }}
                >
                  尺寸：
                  {ceramic.dimensions.height && `高 ${ceramic.dimensions.height}cm`}
                  {ceramic.dimensions.diameter && ` 直径 ${ceramic.dimensions.diameter}cm`}
                </Typography>
              )}
              <Typography 
                variant="body1"
                sx={{ 
                  fontSize: '1.2rem',
                  lineHeight: 1.8,
                  color: '#4A3B34',
                  textAlign: index % 2 === 0 ? 'left' : 'right',
                }}
              >
                {ceramic.description}
              </Typography>
            </TextContent>
          </Content>
        </Section>
      ))}

      <ScrollPrompt>
        向下滚动探索更多
      </ScrollPrompt>

      <ScrollToTopButton
        onClick={handleScrollToTop}
        sx={{
          opacity: showScrollTop ? 1 : 0,
          transform: showScrollTop ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-100%)',
          pointerEvents: showScrollTop ? 'auto' : 'none',
        }}
      >
        <KeyboardArrowUpIcon />
      </ScrollToTopButton>

      {isImmersive && immersiveCeramic && (
        <ImmersiveContent className="active" onClick={exitImmersiveView}>
          <ImmersiveImage 
            src={immersiveCeramic.local_image} 
            alt={immersiveCeramic.title}
            onClick={(e) => e.stopPropagation()}
          />
          <ImmersiveInfo onClick={(e) => e.stopPropagation()}>
            <Typography variant="h4" sx={{ color: '#fff', mb: 1 }}>
              {immersiveCeramic.title}
            </Typography>
            <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
              {immersiveCeramic.dynasty}
            </Typography>
            {immersiveCeramic.author && (
              <Typography variant="body1" sx={{ color: '#fff', mb: 1 }}>
                作者：{immersiveCeramic.author}
              </Typography>
            )}
            {immersiveCeramic.dimensions && (
              <Typography variant="body1" sx={{ color: '#fff', mb: 1 }}>
                尺寸：
                {immersiveCeramic.dimensions.height && `高 ${immersiveCeramic.dimensions.height}cm`}
                {immersiveCeramic.dimensions.diameter && ` 直径 ${immersiveCeramic.dimensions.diameter}cm`}
              </Typography>
            )}
            <Typography variant="body2" sx={{ color: '#fff' }}>
              {immersiveCeramic.description}
            </Typography>
          </ImmersiveInfo>
        </ImmersiveContent>
      )}
    </GalleryContainer>
  );
};

export default CeramicGallery; 