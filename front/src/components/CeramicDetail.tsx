import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Grid, Card, CardContent,
  Tabs, Tab, IconButton
} from '@mui/material';
import { useParams } from 'react-router-dom';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { styled } from '@mui/material/styles';

// 示例数据
const ceramicDetails = {
  id: 1,
  name: '青花瓷瓶',
  images: [
    '/images/qinghua_1.jpg',
    '/images/qinghua_2.jpg',
    '/images/qinghua_3.jpg',
  ],
  period: '明朝',
  location: '景德镇',
  style: '青花',
  material: '瓷土',
  technique: '青花釉下彩',
  height: '45cm',
  diameter: '20cm',
  story: '这件青花瓷瓶是明代景德镇官窑的代表作品，体现了当时最高水平的制瓷工艺。瓶身绘制的花鸟纹样精美绝伦，青花发色纯正，胎体洁白细腻。',
  temperatureData: [
    { stage: '素坯', temperature: 800 },
    { stage: '釉下彩', temperature: 1000 },
    { stage: '高温烧成', temperature: 1300 },
    { stage: '冷却', temperature: 100 },
  ],
  composition: [
    { name: '瓷土', value: 60 },
    { name: '石英', value: 20 },
    { name: '长石', value: 15 },
    { name: '其他', value: 5 },
  ],
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanelContainer = styled('div')({
  padding: '24px'
});

const DetailContainer = styled('div')({
  padding: '24px'
});

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <TabPanelContainer>
          {children}
        </TabPanelContainer>
      )}
    </div>
  );
};

const CeramicDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [tabValue, setTabValue] = useState(0);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? ceramicDetails.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === ceramicDetails.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <DetailContainer>
      <Typography variant="h4" gutterBottom>
        {ceramicDetails.name}
      </Typography>

      <Grid container spacing={3}>
        {/* 图片展示区 */}
        <Grid item xs={12} md={6}>
          <Card sx={{ position: 'relative' }}>
            <Box
              component="img"
              sx={{
                width: '100%',
                height: 400,
                objectFit: 'contain',
                bgcolor: '#f5f5f5',
              }}
              src={ceramicDetails.images[currentImageIndex]}
              alt={ceramicDetails.name}
            />
            <IconButton
              sx={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
              }}
              onClick={handlePrevImage}
            >
              <ArrowBackIosNewIcon />
            </IconButton>
            <IconButton
              sx={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
              }}
              onClick={handleNextImage}
            >
              <ArrowForwardIosIcon />
            </IconButton>
          </Card>
        </Grid>

        {/* 基本信息区 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>基本信息</Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography color="text.secondary">年代</Typography>
                  <Typography>{ceramicDetails.period}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography color="text.secondary">产地</Typography>
                  <Typography>{ceramicDetails.location}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography color="text.secondary">风格</Typography>
                  <Typography>{ceramicDetails.style}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography color="text.secondary">材质</Typography>
                  <Typography>{ceramicDetails.material}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography color="text.secondary">高度</Typography>
                  <Typography>{ceramicDetails.height}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography color="text.secondary">直径</Typography>
                  <Typography>{ceramicDetails.diameter}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 详细信息标签页 */}
        <Grid item xs={12}>
          <Paper>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
              <Tab label="历史故事" />
              <Tab label="工艺特点" />
              <Tab label="数据分析" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Typography>{ceramicDetails.story}</Typography>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>制作工艺</Typography>
              <Typography paragraph>{ceramicDetails.technique}</Typography>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>烧制温度曲线</Typography>
                  <div style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={ceramicDetails.temperatureData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="stage" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="temperature" 
                          stroke="#8884d8" 
                          name="温度(°C)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>材料成分比例</Typography>
                  <div style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={ceramicDetails.composition}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {ceramicDetails.composition.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </DetailContainer>
  );
};

export default CeramicDetail; 