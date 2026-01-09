import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import { 
  Box, Typography, Grid, Card, CardContent, CardMedia, 
  TextField, Select, MenuItem, FormControl, InputLabel,
  IconButton, InputAdornment, CardActionArea,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Pagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useNavigate } from 'react-router-dom';
import Ceramic3DViewer from './Ceramic3DViewer.tsx';
import ceramicsData from '../assets/ceramics_data_3d.json';

interface CeramicItem {
  id: number;
  name: string;
  period: string;
  location: string;
  style: string;
  image: string;
  description: string;
  modelPath: string;
  year: string;
  glaze: string;
  technique: string;
}

const Container = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3)
}));

const ViewerContainer = styled(Box)({
  height: 'calc(100% - 20px)',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  margin: 0,
  padding: 0
});

const PaginationContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  marginTop: '32px'
});

// 创建样式化组件，避免内联样式导致的类型复杂性
const ModelContainer = styled('div')({
  width: '100%', 
  height: '100%', 
  position: 'relative',
  display: 'flex'
});

const CeramicExploration: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCeramic, setSelectedCeramic] = useState<CeramicItem | null>(null);
  const [show3DViewer, setShow3DViewer] = useState(false);
  const [page, setPage] = useState(1);
  const [ceramicData, setCeramicData] = useState<CeramicItem[]>(ceramicsData.ceramics);
  const itemsPerPage = 6;

  // 优化过滤逻辑
  const filteredCeramics = useMemo(() => 
    ceramicData.filter(ceramic =>
      ceramic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ceramic.period.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ceramic.location.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [ceramicData, searchQuery]
  );

  // 计算总页数
  const totalPages = useMemo(() => 
    Math.ceil(filteredCeramics.length / itemsPerPage),
    [filteredCeramics.length, itemsPerPage]
  );

  // 优化分页数据
  const paginatedCeramics = useMemo(() => 
    filteredCeramics.slice(
      (page - 1) * itemsPerPage,
      page * itemsPerPage
    ),
    [filteredCeramics, page, itemsPerPage]
  );

  // 添加模型预加载
  useEffect(() => {
    // 预加载当前页面的模型
    paginatedCeramics.forEach(ceramic => {
      if (ceramic.modelPath) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'fetch';
        link.href = ceramic.modelPath;
        document.head.appendChild(link);
      }
    });
  }, [paginatedCeramics]);

  // 优化模型加载处理
  const handleCeramicClick = useCallback((ceramic: CeramicItem) => {
    // 预加载模型
    if (ceramic.modelPath) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'fetch';
      link.href = ceramic.modelPath;
      document.head.appendChild(link);
    }
    setSelectedCeramic(ceramic);
    setShow3DViewer(true);
  }, []);

  // 优化搜索处理
  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1);
  }, []);

  // 优化分页处理
  const handlePageChange = useCallback((event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  }, []);

  const handleCardClick = (id: number) => {
    navigate(`/ceramic/${id}`);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom align="center" sx={{
        color: '#1a4b8c',
        fontWeight: 'bold',
        textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
        mb: 4
      }}>
        陶瓷3D展示
      </Typography>

      {/* 搜索栏 */}
      <Box component="div" sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="搜索瓷器名称、朝代或产地..."
          value={searchQuery}
          onChange={handleSearch}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: '#1a4b8c',
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#1a4b8c' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* 瓷器卡片网格 */}
      <Grid container spacing={3}>
        {paginatedCeramics.map((ceramic) => (
          <Grid item xs={12} sm={6} md={4} key={ceramic.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(26, 75, 140, 0.1)',
                boxShadow: '0 4px 20px rgba(26, 75, 140, 0.1)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 24px rgba(26, 75, 140, 0.2)',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)'
                }
              }}
              onClick={() => handleCeramicClick(ceramic)}
            >
              <CardMedia
                component="img"
                height="200"
                image={ceramic.image}
                alt={ceramic.name}
                sx={{
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="div" sx={{ color: '#1a4b8c' }}>
                  {ceramic.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {ceramic.period} · {ceramic.location} · {ceramic.style}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOnIcon fontSize="small" sx={{ color: '#1a4b8c' }} />
                  {ceramic.location}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {ceramic.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 分页控件 */}
      {totalPages > 1 && (
        <PaginationContainer>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
            sx={{
              '& .MuiPaginationItem-root': {
                color: '#1a4b8c',
                '&.Mui-selected': {
                  backgroundColor: '#1a4b8c',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#1a4b8c',
                  },
                },
              },
            }}
          />
        </PaginationContainer>
      )}

      {/* 3D查看器对话框 */}
      <Dialog
        open={show3DViewer}
        onClose={() => setShow3DViewer(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#f5f9ff',
            overflow: 'hidden',
            padding: 0,
            margin: 0
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            color: '#1a4b8c',
            padding: '10px 24px',
            borderBottom: '1px solid rgba(26, 75, 140, 0.1)',
            minHeight: '10px',
            flex: '0 0 auto'
          }}
        >
          {selectedCeramic?.name} - 3D模型查看
        </DialogTitle>
        <DialogContent 
          sx={{ 
            flex: '1 1 auto',
            padding: '0 !important',
            display: 'flex',
            overflow: 'hidden'
          }}
        >
          {selectedCeramic?.modelPath && (
            <div style={{ 
              width: '100%', 
              height: '100%', 
              position: 'relative',
              display: 'flex' 
            }}>
              <Ceramic3DViewer modelPath={selectedCeramic.modelPath} />
            </div>
          )}
        </DialogContent>
        <DialogActions 
          sx={{ 
            padding: '6px 24px',
            borderTop: '1px solid rgba(26, 75, 140, 0.1)',
            minHeight: '10px',
            flex: '0 0 auto'
          }}
        >
          <Button onClick={() => setShow3DViewer(false)} sx={{ color: '#1a4b8c' }}>
            关闭
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CeramicExploration; 