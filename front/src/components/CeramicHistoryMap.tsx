import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, IconButton, Slider, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import * as echarts from 'echarts';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ReferenceLine, Label, LineChart, Line, Brush, Legend
} from 'recharts';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import { chinaJson } from '../assets/china.ts';

// Define the GeoJSON type
interface GeoJSONFeature {
  type: 'Feature';
  properties: {
    id: string;
    size: string;
    name: string;
    cp: number[];
    childNum: number;
  };
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

interface GeoJSONData {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

// 在GeoJSONData接口定义之后添加
interface KilnSite {
  name: string;
  dynasty: string;
  type: string;
  coordinates: [number, number];
}

// 添加窑址数据
const kilnSites: KilnSite[] = [
  {
    name: "邢窑",
    dynasty: "唐",
    type: "白瓷",
    coordinates: [114.504844, 37.070834]
  },
  {
    name: "越窑",
    dynasty: "唐",
    type: "青瓷",
    coordinates: [121.543990, 29.868336]
  },
  {
    name: "汝窑",
    dynasty: "北宋",
    type: "天青釉",
    coordinates: [112.983398, 34.167557]
  },
  {
    name: "景德镇窑",
    dynasty: "宋-清",
    type: "青白瓷",
    coordinates: [117.178222, 29.268945]
  },
  {
    name: "龙泉窑",
    dynasty: "元",
    type: "青瓷",
    coordinates: [119.647445, 28.069176]
  },
  {
    name: "德化窑",
    dynasty: "明",
    type: "白瓷",
    coordinates: [118.242986, 25.491864]
  }
];

// 历史数据
const historicalData = [
  { 
    year: -8000, 
    dynasty: '新石器时代', 
    event: '陶器起源', 
    production: 100, 
    glaze: '无釉',
    decoration: '素面、绳纹',
    shape: {
      main: '简单实用',
      features: ['圜底器型为主', '泥条盘筑成型', '手工捏制', '厚重朴实'],
      types: ['罐', '钵', '盆', '釜']
    },
    regions: ['豫', '陕', '甘']
  },
  { 
    year: -2070, 
    dynasty: '夏商周', 
    event: '原始瓷器出现', 
    production: 500, 
    glaze: '原始青瓷',
    decoration: '几何纹、动物纹',
    shape: {
      main: '礼器为主',
      features: ['器型规整', '轮制成型', '仿铜礼器', '造型庄重'],
      types: ['鼎', '尊', '爵', '鬲', '豆']
    },
    regions: ['豫', '陕', '浙']
  },
  { 
    year: -202, 
    dynasty: '汉', 
    event: '青瓷成熟', 
    production: 1000, 
    glaze: '青瓷',
    decoration: '刻花、堆贴',
    shape: {
      main: '实用器皿',
      features: ['造型浑厚', '胎体致密', '器型多样', '比例协调'],
      types: ['壶', '罐', '盘', '碗', '仓']
    },
    regions: ['浙', '苏', '豫']
  },
  { 
    year: 618, 
    dynasty: '唐', 
    event: '瓷器发展初期', 
    production: 2000, 
    glaze: '青瓷、白瓷',
    decoration: '三彩、彩绘',
    shape: {
      main: '丰满圆润',
      features: ['器型丰满', '造型优美', '比例和谐', '风格开放'],
      types: ['盘', '碗', '壶', '枕', '俑']
    },
    regions: ['浙', '豫', '冀']
  },
  { 
    year: 960, 
    dynasty: '宋', 
    event: '瓷器鼎盛', 
    production: 5000, 
    glaze: '青瓷、汝窑、官窑',
    decoration: '简约素雅',
    shape: {
      main: '简洁优雅',
      features: ['造型含蓄', '线条流畅', '比例精准', '器型规整'],
      types: ['碗', '盘', '瓶', '炉', '洗']
    },
    regions: ['浙', '豫', '赣']
  },
  { 
    year: 1271, 
    dynasty: '元', 
    event: '青花瓷兴起', 
    production: 8000, 
    glaze: '青花釉',
    decoration: '青花图案',
    shape: {
      main: '端庄大气',
      features: ['器型硕大', '造型稳重', '胎体厚实', '风格豪放'],
      types: ['梅瓶', '大罐', '大盘', '大碗', '观音瓶']
    },
    regions: ['赣', '浙', '闽']
  },
  { 
    year: 1368, 
    dynasty: '明', 
    event: '官窑设立', 
    production: 12000, 
    glaze: '青花、釉里红、斗彩',
    decoration: '青花、斗彩、五彩',
    shape: {
      main: '多样化发展',
      features: ['造型规范', '器型精致', '比例标准', '风格典雅'],
      types: ['碗', '盘', '瓶', '罐', '杯']
    },
    regions: ['赣', '浙', '闽', '粤']
  },
  { 
    year: 1644, 
    dynasty: '清', 
    event: '瓷器工艺巅峰', 
    production: 15000, 
    glaze: '粉彩、珐琅彩、青花',
    decoration: '粉彩、珐琅彩、青花',
    shape: {
      main: '精致华丽',
      features: ['造型复杂', '工艺精湛', '器型创新', '风格奢华'],
      types: ['瓶', '碗', '盘', '尊', '瓯']
    },
    regions: ['赣', '浙', '闽', '粤', '苏']
  },
  { 
    year: 2023, 
    dynasty: '现代', 
    event: '传统与创新融合', 
    production: 50000, 
    glaze: '传统釉色与现代工艺结合',
    decoration: '传统纹样与现代设计融合',
    shape: {
      main: '艺术创新与实用并重',
      features: ['设计多元', '功能创新', '传统传承', '现代审美'],
      types: ['艺术瓷', '日用瓷', '建筑瓷', '工业瓷', '创意瓷']
    },
    regions: ['赣', '浙', '闽', '粤', '苏', '冀', '鲁', '川']
  }
];

// 添加陶瓷烧制技术数据库
const ceramicFiringTechData = [
  { 
    dynasty: '新石器时代', 
    kilnType: '坑窑/馒头窑', 
    temperatureRange: '800-950', 
    shrinkageRate: '5-8', 
    representative: '彩陶/黑陶', 
    bodyComposition: '原始黏土'
  },
  { 
    dynasty: '夏商周', 
    kilnType: '坑窑/馒头窑', 
    temperatureRange: '900-1000', 
    shrinkageRate: '6-10', 
    representative: '原始青瓷/釉陶', 
    bodyComposition: '粗制黏土+石英'
  },
  { 
    dynasty: '汉', 
    kilnType: '龙窑', 
    temperatureRange: '950-1100', 
    shrinkageRate: '8-12', 
    representative: '灰陶/铅釉陶', 
    bodyComposition: '高岭土+石英'
  },
  { 
    dynasty: '唐', 
    kilnType: '邢窑/越窑', 
    temperatureRange: '1200-1280', 
    shrinkageRate: '10-15', 
    representative: '邢窑白瓷/越窑青瓷', 
    bodyComposition: '瓷石+长石'
  },
  { 
    dynasty: '宋', 
    kilnType: '汝窑/定窑', 
    temperatureRange: '1250-1300', 
    shrinkageRate: '12-18', 
    representative: '天青釉/白釉刻花', 
    bodyComposition: '高岭土+骨灰'
  },
  { 
    dynasty: '元', 
    kilnType: '景德镇馒头窑', 
    temperatureRange: '1280-1320', 
    shrinkageRate: '15-20', 
    representative: '青花瓷/釉里红', 
    bodyComposition: '瓷石+高岭土二元配方'
  },
  { 
    dynasty: '明', 
    kilnType: '官窑葫芦窑', 
    temperatureRange: '1300-1350', 
    shrinkageRate: '18-22', 
    representative: '斗彩/甜白釉', 
    bodyComposition: '精炼高岭土'
  },
  { 
    dynasty: '清', 
    kilnType: '镇窑', 
    temperatureRange: '1320-1400', 
    shrinkageRate: '20-25', 
    representative: '粉彩/珐琅彩', 
    bodyComposition: '高纯度瓷土'
  },
  { 
    dynasty: '现代', 
    kilnType: '电窑/气窑', 
    temperatureRange: '800-1450', 
    shrinkageRate: '5-30', 
    representative: '实验陶瓷/工业陶瓷', 
    bodyComposition: '氧化铝/碳化硅等'
  }
];

// 温度热力图数据
const temperatureHeatmapData = ceramicFiringTechData.map(item => {
  const [min, max] = item.temperatureRange.split('-').map(Number);
  return {
    dynasty: item.dynasty,
    minTemp: min,
    maxTemp: max,
    avgTemp: Math.round((min + max) / 2),
    kilnType: item.kilnType
  };
});

// 收缩率数据
const shrinkageRateData = ceramicFiringTechData.map(item => {
  const [min, max] = item.shrinkageRate.split('-').map(Number);
  return {
    dynasty: item.dynasty,
    minRate: min,
    maxRate: max,
    avgRate: (min + max) / 2
  };
});

// 主要胎体成分数据 - 用于饼图
const bodyCompositionData = (dynasty) => {
  const data = ceramicFiringTechData.find(item => item.dynasty === dynasty);
  if (!data) return [];
  
  const compositions = data.bodyComposition.split('+').map(comp => comp.trim());
  // 为每个成分分配权重 (这里是模拟数据，实际应根据真实数据调整)
  return compositions.map((comp, index) => ({
    name: comp,
    value: compositions.length === 1 ? 100 : (index === 0 ? 60 : 40)
  }));
};

// 添加陶瓷主题配色
const ceramicTheme = {
  // 青瓷色系
  celadon: {
    light: '#E3EBE3',
    main: '#A4C8C1',
    dark: '#6A9E95'
  },
  // 青花色系
  blueAndWhite: {
    white: '#F8F9FC',
    blue: '#2774AE',
    lightBlue: '#A4CAED'
  },
  // 胎体色系
  clay: {
    light: '#F5EFE8',
    main: '#E8DFD2',
    dark: '#D1C5B4'
  },
  // 釉色
  glaze: {
    teadust: '#68705A',
    copper: '#B87D55',
    redCopper: '#C13E34'
  }
};

// 定义温度相关颜色
const TEMP_COLORS = ['#FFD700', '#FF9F00', '#FF6B00', '#FF4500', '#8B0000'];
const COMP_COLORS = ['#4682B4', '#6495ED', '#87CEEB', '#ADD8E6', '#B0E0E6'];

const Container = styled('div')({
  position: 'relative',
  width: '95vw',
  height: 'calc(100vh - 60px)',
  padding: '24px 15px 32px 15px',
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
  backgroundColor: ceramicTheme.clay.light,
  boxSizing: 'border-box',
  margin: '64px auto 0',
  maxWidth: '100%',
  overflow: 'hidden',
  '& .MuiBox-root': {
    width: '100%',
    maxWidth: '100%'
  }
});

const ContentContainer = styled('div')({
  display: 'flex',
  flex: 1,
  gap: '15px',
  marginBottom: '15px',
  width: '100%',
  padding: '0 15px',
  maxHeight: 'calc(100vh - 40px)',  // 增加内容容器高度
  maxWidth: '100%',
  boxSizing: 'border-box',
  overflow: 'hidden'
});

const SideSection = styled('div')({
  width: '28%',  // 减少宽度
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  overflow: 'hidden',
  '&:last-child': {
    width: '28%'  // 减少宽度
  }
});

const MapContainer = styled('div')({
  width: '44%',
  position: 'relative',
  backgroundColor: ceramicTheme.blueAndWhite.white,
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(161, 146, 130, 0.15)',
  overflow: 'hidden',
  opacity: 0,
  transform: 'translateY(20px)',
  transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
  height: 'calc(100vh - 160px)',
  paddingBottom: '48px',
  border: `1px solid ${ceramicTheme.clay.main}`,
  '&.visible': {
    opacity: 1,
    transform: 'translateY(0)'
  }
});

// 添加图例容器样式
const LegendContainer = styled('div')({
  position: 'absolute',
  top: '10px',
  right: '10px',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  padding: '8px',
  borderRadius: '4px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  zIndex: 10,
  fontSize: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
});

const LegendItem = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '6px'
});

const LegendSymbol = styled('div')({
  width: '14px',
  height: '14px',
  borderRadius: '50%'
});

const ChartContainer = styled('div')({
  flex: 1,
  minHeight: '220px',
  height: 'auto',
  padding: '15px',
  backgroundColor: ceramicTheme.blueAndWhite.white,
  backgroundImage: `radial-gradient(circle at 90% 10%, ${ceramicTheme.celadon.light}55, transparent 60%)`,
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(161, 146, 130, 0.15)',
  opacity: 0,
  transform: 'translateX(20px)',
  transition: 'opacity 0.8s ease-out 0.6s, transform 0.8s ease-out 0.6s',
  border: `1px solid ${ceramicTheme.clay.main}`,
  '&.visible': {
    opacity: 1,
    transform: 'translateX(0)'
  },
  '@media (max-width: 600px)': {
    minHeight: '180px',
    height: 'auto',
    padding: '10px'
  }
});

const SliderContainer = styled('div')({
  padding: '10px 20px 5px',
  opacity: 0,
  transform: 'translateY(20px)',
  transition: 'opacity 0.8s ease-out 0.9s, transform 0.8s ease-out 0.9s',
  width: '95%',
  maxWidth: '1600px',
  marginTop: 'auto',
  marginLeft: 'auto',
  marginRight: 'auto',
  boxSizing: 'border-box',
  '& .MuiSlider-root': {
    width: '100%',
    maxWidth: '100%',
    color: ceramicTheme.celadon.dark // 滑块颜色
  },
  '& .MuiSlider-mark': {
    width: '2px',
    height: '8px',
    marginTop: '4px',
    backgroundColor: ceramicTheme.clay.dark
  },
  '& .MuiSlider-markLabel': {
    fontSize: '0.9rem',
    lineHeight: '1.1',  // 减小行高，原来是 1.2
    whiteSpace: 'pre-line',
    marginTop: '6px',  // 减少与滑块的距离，原来是 8px
    width: 'auto',
    textAlign: 'center',
    color: ceramicTheme.glaze.teadust // 标签文字颜色
  },
  '&.visible': {
    opacity: 1,
    transform: 'translateY(0)'
  }
});

const SliderBox = styled(Box)({
  width: '100%',
  maxWidth: '100%',
  padding: '0',
  display: 'flex',
  justifyContent: 'center',
  marginTop: '10px'  // 减少顶部边距，原来是 20px
});

const ChartBox = styled('div')({
  marginTop: '16px',
  height: '140px',
  display: 'flex',
  alignItems: 'center'
});

const COLORS = ['#FF9F7F', '#FFB98E', '#FFD4A4', '#FFDFB8', '#E8C5B2'];

// 修改导航按钮样式，减小高度
const NavButton = styled(Button)({
  position: 'fixed',
  top: '50%',
  transform: 'translateY(-50%)',
  minWidth: '36px',  // 减小宽度，原来是 40px
  height: '70px',    // 减小高度，原来是 80px
  backgroundColor: `${ceramicTheme.celadon.main}22`, // 使用青瓷色系，增加透明度
  color: ceramicTheme.celadon.dark,
  '&:hover': {
    backgroundColor: `${ceramicTheme.celadon.main}44`, // 悬停时增加不透明度
  },
  '&.left': {
    left: '10px',  // 减小边距，原来是 20px
    borderRadius: '0 20px 20px 0',
  },
  '&.right': {
    right: '10px',  // 减小边距，原来是 20px
    borderRadius: '20px 0 0 20px',
  },
  '&.Mui-disabled': {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    color: 'rgba(0, 0, 0, 0.2)',
  }
});

// 删除之前的 containerStyle 常量，改用 styled 组件
const StyledContainer = styled(Box)({
  position: 'relative',
  width: '100%',
  height: '100%'
});

const KilnInfoCard = styled(Paper)({
  position: 'absolute',
  bottom: '20px',
  left: '20px',
  width: '220px',
  padding: '12px',
  zIndex: 10,
  backgroundColor: 'rgba(248, 249, 252, 0.95)', // 青花瓷的白色，稍微透明
  boxShadow: '0 4px 12px rgba(161, 146, 130, 0.2)',
  borderRadius: '6px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  transform: 'translateY(0)',
  opacity: 1,
  transition: 'transform 0.3s ease, opacity 0.3s ease',
  border: `1px solid ${ceramicTheme.celadon.main}`,
  '&.hidden': {
    transform: 'translateY(20px)',
    opacity: 0
  }
});

const KilnInfoHeader = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
});

const KilnInfoTitle = styled(Typography)({
  fontWeight: 'bold',
  color: ceramicTheme.glaze.redCopper // 使用釉色中的红铜色
});

const KilnInfoText = styled(Typography)({
  fontSize: '0.875rem'
});

const KilnInfoCaption = styled(Typography)({
  marginTop: '8px',
  fontSize: '0.75rem',
  color: ceramicTheme.glaze.teadust
});

// 创建单独的KilnInfoCardComponent组件，以避免内联创建导致的类型问题
interface KilnInfoCardProps {
  kiln: KilnSite;
  onClose: () => void;
}

const KilnInfoCardComponent: React.FC<KilnInfoCardProps> = ({ kiln, onClose }) => {
  return (
    <KilnInfoCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" style={{ fontWeight: 'bold', color: ceramicTheme.glaze.redCopper }}>
          {kiln.name}
        </Typography>
        <IconButton size="small" onClick={onClose} style={{ padding: '2px' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </div>
      <Typography variant="body2">
        <b>朝代:</b> {kiln.dynasty}
      </Typography>
      <Typography variant="body2">
        <b>类型:</b> {kiln.type}
      </Typography>
      <Typography variant="body2">
        <b>坐标:</b> [{kiln.coordinates[0].toFixed(2)}, {kiln.coordinates[1].toFixed(2)}]
      </Typography>
      <Typography variant="caption" style={{ marginTop: '8px', display: 'block', color: ceramicTheme.glaze.teadust }}>
        点击窑址标记可查看详细信息
      </Typography>
    </KilnInfoCard>
  );
};

// 添加釉色到颜色的映射函数
const getGlazeColor = (glazeName: string): string => {
  // 映射釉色名称到实际颜色
  const glazeColorMap: {[key: string]: string} = {
    // 白色系
    '白瓷': '#f5f5f5',
    '邢窑白瓷': '#f8f8f8',
    '甜白釉': '#fffaf0',
    '影青釉': '#e8f4f8',
    // 青色系
    '青瓷': '#a4c8c1',
    '汝窑': '#b0e0e6',
    '龙泉窑青瓷': '#88c0a8',
    '原始青瓷': '#a9c0b5',
    '天青釉': '#b0d0e0',
    // 蓝色系
    '青花釉': '#4682b4',
    '青花': '#2774ae',
    // 绿色系
    '豆青釉': '#8fbc8f',
    '冬青釉': '#7cad7c',
    // 黑色系
    '乌金釉': '#2f4f4f',
    '黑釉': '#2c3539',
    // 红色系
    '釉里红': '#c13e34',
    '霁红釉': '#b22222',
    '祭红': '#cb4154',
    // 黄色系
    '黄釉': '#f0c75f',
    '琉璃釉': '#fcc200',
    // 多彩系
    '三彩': '#d4af37',
    '彩绘': '#daa520',
    '斗彩': '#e49b0f',
    '五彩': '#fa8072',
    '粉彩': '#ffc0cb',
    '珐琅彩': '#ff69b4',
    // 综合现代
    '传统釉色与现代工艺结合': '#7289da',
    // 默认颜色
    '无釉': '#d3cfbe'
  };

  // 查找完整匹配
  if (glazeColorMap[glazeName]) {
    return glazeColorMap[glazeName];
  }

  // 查找部分匹配
  for (const key in glazeColorMap) {
    if (glazeName.includes(key)) {
      return glazeColorMap[key];
    }
  }

  // 默认返回褐色
  return '#a67d5d';
};

// 添加海上丝绸之路陶瓷贸易数据
const maritimeSilkRoadData = [
  { 
    dynasty: '汉代', 
    year: -206, 
    southSeaRoute: 3, 
    eastSeaRoute: 1, 
    westOceanRoute: 0, 
    event: '《汉书·地理志》载徐闻、合浦航线，出口灰陶为主',
    archaeologicalEvidence: '合浦汉墓群出土西亚玻璃与陶器共存，印证早期南海贸易'
  },
  { 
    dynasty: '唐代', 
    year: 618, 
    southSeaRoute: 8, 
    eastSeaRoute: 5, 
    westOceanRoute: 2, 
    event: '"黑石号"沉船载6.5万件瓷器（长沙窑为主）',
    archaeologicalEvidence: '印尼"黑石号"沉船（9世纪）载长沙窑瓷器5.5万件'
  },
  { 
    dynasty: '宋代', 
    year: 960, 
    southSeaRoute: 7, 
    eastSeaRoute: 9, 
    westOceanRoute: 6, 
    event: '《萍洲可谈》载"货多陶器，大小相套"',
    archaeologicalEvidence: '南海I号沉船（12世纪）载龙泉青瓷、德化窑瓷器；斯里兰卡阿莱皮蒂遗址出土北宋西村窑瓷片600余片'
  },
  { 
    dynasty: '元代', 
    year: 1271, 
    southSeaRoute: 5, 
    eastSeaRoute: 4, 
    westOceanRoute: 12, 
    event: '泉州港极盛，汪大渊《岛夷志略》记西洋航线运量激增',
    archaeologicalEvidence: '韩国新安沉船载龙泉青瓷1.2万件（占总量60%）'
  },
  { 
    dynasty: '明代', 
    year: 1368, 
    southSeaRoute: 10, 
    eastSeaRoute: 7, 
    westOceanRoute: 8, 
    event: '郑和七下西洋，景德镇瓷器大量外销；《东西洋考》记载"瓷器之利，岁取百万"',
    archaeologicalEvidence: '马来西亚马六甲出土明代青花瓷碎片；菲律宾圣地亚哥沉船载景德镇青花瓷6,000件'
  }
];

// 将原始指数转换为年出口量（万件）的函数
const getExportVolume = (standardIndex: number): number => {
  // 根据考古发现和文献记载的比例转换
  // 标准化指数1对应约2万件年出口量
  return standardIndex * 2;
};

// 转换后的陶瓷贸易数据（带实际年出口量）
const ceramicTradeData = maritimeSilkRoadData.map(item => ({
  ...item,
  southSeaExport: getExportVolume(item.southSeaRoute),
  eastSeaExport: getExportVolume(item.eastSeaRoute),
  westOceanExport: getExportVolume(item.westOceanRoute)
}));

// 季风数据
const monsoonData = {
  southSeaRoute: {
    summer: {direction: "西南→东北", months: "4-9月", speed: "15节"},
    winter: {direction: "东北→西南", months: "10-3月", speed: "12节"}
  },
  westOceanRoute: {
    note: "需在印度奎隆（故临）换小船并候风，全程需1-2年"
  }
};

const CeramicHistoryMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mapChart, setMapChart] = useState<echarts.ECharts | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedKiln, setSelectedKiln] = useState<KilnSite | null>(null);
  const [pageHeight, setPageHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => setPageHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 更新地图的函数
  const updateCharts = (index: number) => {
    if (!mapChart) return;

    const currentData = historicalData[index];
    const mapData = currentData.regions.map(name => ({
      name,
      value: 1
    }));

    // 修改朝代匹配逻辑
    let relevantKilns: KilnSite[] = [];

    // 根据当前朝代和年份匹配窑址
    const dynastyYear = currentData.year;

    if (dynastyYear >= -8000 && dynastyYear < -220) {
      // 新石器时代到夏商周时期不显示窑址
      relevantKilns = [];
    } else if (dynastyYear >= -220 && dynastyYear < 581) {
      // 秦汉时期，暂无著名窑址数据
      relevantKilns = [];
    } else if (dynastyYear >= 581 && dynastyYear < 960) {
      // 唐代 (618-907)
      relevantKilns = kilnSites.filter(kiln => 
        kiln.dynasty === '唐' || 
        kiln.dynasty.includes('唐')
      );
    } else if (dynastyYear >= 960 && dynastyYear < 1271) {
      // 宋代 (960-1279)
      relevantKilns = kilnSites.filter(kiln => 
        kiln.dynasty === '北宋' || 
        kiln.dynasty === '南宋' || 
        kiln.dynasty === '宋' ||
        kiln.dynasty.includes('宋')
      );
    } else if (dynastyYear >= 1271 && dynastyYear < 1368) {
      // 元代 (1271-1368)
      relevantKilns = kilnSites.filter(kiln => 
        kiln.dynasty === '元' || 
        kiln.dynasty.includes('元') ||
        kiln.dynasty.includes('宋-清')  // 景德镇等跨朝代窑址
      );
    } else if (dynastyYear >= 1368 && dynastyYear < 1644) {
      // 明代 (1368-1644)
      relevantKilns = kilnSites.filter(kiln => 
        kiln.dynasty === '明' || 
        kiln.dynasty.includes('明') ||
        kiln.dynasty.includes('宋-清')  // 景德镇等跨朝代窑址
      );
    } else if (dynastyYear >= 1644 && dynastyYear < 1912) {
      // 清代 (1644-1912)
      relevantKilns = kilnSites.filter(kiln => 
        kiln.dynasty === '清' || 
        kiln.dynasty.includes('清') ||
        kiln.dynasty.includes('宋-清')  // 景德镇等跨朝代窑址
      );
    } else if (dynastyYear >= 1912) {
      // 现代 (1912-)
      relevantKilns = kilnSites; // 展示所有历史窑址
    }

    // 添加调试日志
    console.log('当前朝代:', currentData.dynasty, '年份:', dynastyYear);
    console.log('匹配到的窑址:', relevantKilns);

    // 转换窑址数据为散点图数据格式
    const kilnData = relevantKilns.map(kiln => ({
      name: `${kiln.name}（${kiln.type}）`,
      value: [kiln.coordinates[0], kiln.coordinates[1], 1], // 确保坐标格式为 [经度, 纬度, 值]
      // 添加额外数据以供tooltip和点击使用
      dynasty: kiln.dynasty,
      type: kiln.type
    }));

    // 添加日志便于调试
    console.log('窑址数据已转换:', kilnData);

    const mapOption = {
      title: {
        text: `${currentData.dynasty} - ${currentData.year > 0 ? currentData.year : '公元前' + Math.abs(currentData.year)}年`,
        left: 'center',
        top: 20,
        textStyle: {
          fontSize: 20,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'item',
        enterable: true, // 允许鼠标移入提示框
        formatter: (params: any) => {
          // 窑址散点图的提示
          if (params.seriesType === 'effectScatter' || params.seriesType === 'scatter') {
            // 从数据中直接获取信息
            const name = params.name.split('（')[0];
            const type = params.name.includes('（') ? params.name.split('（')[1].replace('）', '') : '';
            const dynasty = params.data.dynasty || '';
            const coordinates = params.value;
            
            return `<div style="font-weight:bold;margin-bottom:5px;font-size:14px;color:#FF4500">${name}</div>` + 
                   `<div style="margin-bottom:3px;"><span style="font-weight:bold;">朝代:</span> ${dynasty}</div>` +
                   `<div style="margin-bottom:3px;"><span style="font-weight:bold;">类型:</span> ${type}</div>` +
                   `<div><span style="font-weight:bold;">坐标:</span> [${coordinates[0].toFixed(2)}, ${coordinates[1].toFixed(2)}]</div>` +
                   `<div style="margin-top:5px;font-size:12px;color:#666;">点击查看详细信息</div>`;
          }
          
          // 地图区域的提示
          if (currentData.regions.includes(params.name)) {
            return `<div style="font-weight:bold;color:#FF9F7F">${params.name}</div>瓷器生产中心`;
          }
          
          return `${params.name}`;
        }
      },
      visualMap: {
        min: 0,
        max: 1,
        inRange: {
          color: ['#f5f5f5', '#FF9F7F']
        },
        left: 'left',
        bottom: '10%',
        text: ['生产中心', '非生产中心'],
        textStyle: {
          color: '#000'
        }
      },
      series: [
        {
          name: '陶瓷生产中心',
          type: 'map',
          map: 'china',
          roam: 'move', // 允许拖动但不缩放，避免缩放问题
          zoom: 1.2,
          center: [104, 35], // 调整中心点
          aspectScale: 0.75, // 调整地图宽高比
          scaleLimit: {
            min: 1,  // 限制最小缩放级别
            max: 3   // 限制最大缩放级别
          },
          data: mapData,
          label: {
            show: true,
            fontSize: 12,
            color: '#000'
          },
          itemStyle: {
            areaColor: '#f5f5f5',
            borderColor: '#E8C5B2',
            borderWidth: 1
          },
          emphasis: {
            itemStyle: {
              areaColor: '#FF9F7F',
              borderColor: '#FF9F7F',
              borderWidth: 2
            },
            label: {
              color: '#fff'
            }
          }
        },
        // 修改散点图配置，确保窑址标记能够正确显示
        {
          name: '著名窑址',
          type: 'effectScatter',  // 使用effectScatter效果更明显
          coordinateSystem: 'geo',
          data: kilnData,
          symbol: 'pin',
          symbolSize: 24,
          showEffectOn: 'render',
          rippleEffect: {
            brushType: 'stroke',
            scale: 2.5,
            period: 4
          },
          hoverAnimation: true,
          label: {
            show: true,  // 始终显示标签
            formatter: function(param: any) {
              return param.name.split('（')[0]; // 只显示窑址名称，不显示类型
            },
            position: 'right',
            offset: [5, 0],
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            padding: [3, 5],
            borderRadius: 3,
            color: '#333',
            fontSize: 12
          },
          itemStyle: {
            color: '#FF4500',  // 醒目的红色
            borderColor: '#fff',
            borderWidth: 1,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowBlur: 5
          },
          emphasis: {
            label: {
              show: true,
              color: '#000',
              fontWeight: 'bold',
              backgroundColor: 'rgba(255, 255, 255, 0.9)'
            },
            itemStyle: {
              color: '#FF6B4A',
              borderWidth: 2,
              shadowBlur: 10
            }
          },
          zlevel: 3 // 确保在最上层
        }
      ]
    };

    mapChart.setOption(mapOption, true);
  };

  // 修改useEffect依赖和初始化逻辑，确保地图和窑址正确加载
  useEffect(() => {
    if (mapChart) {
      console.log('地图实例已创建，准备显示数据');
      
      // 先注册地图基础数据
      try {
        if (!echarts.getMap('china')) {
          echarts.registerMap('china', chinaJson as any);
          console.log('中国地图数据已注册');
        }
      } catch (error) {
        console.error('注册地图数据出错:', error);
      }
      
      // 更新地图数据
      updateCharts(currentIndex);
      
      // 延迟显示动画，确保地图数据和窑址标记都已加载
      setTimeout(() => {
        setIsVisible(true);
        // 再次更新图表，确保窑址显示
        updateCharts(currentIndex);
        console.log('动画显示和数据更新完成');
      }, 300);
    }
  }, [mapChart, currentIndex]);

  // 修改初始化地图的useEffect，确保只初始化一次并正确加载
  useEffect(() => {
    if (!mapRef.current) {
      console.log('地图容器尚未准备好');
      return;
    }
    
    console.log('初始化地图...');
    
    // 使用try-catch包装初始化逻辑，避免出错
    try {
      // 初始化地图
      const map = echarts.init(mapRef.current, null, {
        renderer: 'canvas',  // 明确指定渲染器
        useDirtyRect: false  // 禁用脏矩形优化以避免渲染问题
      });
      
      // 设置地图实例
      setMapChart(map);
      console.log('地图实例已创建');
      
      // 注册地图数据
      echarts.registerMap('china', chinaJson as any);
      console.log('地图数据已注册');
      
      // 添加点击事件处理
      map.on('click', (params) => {
        console.log('地图点击事件:', params);
        
        // 检查是否点击了窑址标记
        if (params.seriesType === 'effectScatter' || params.seriesType === 'scatter') {
          try {
            // 获取窑址名称
            const kilnName = params.name.split('（')[0];
            console.log('点击的窑址名称:', kilnName);
            
            // 查找对应的窑址数据
            const kiln = kilnSites.find(k => k.name === kilnName);
            if (kiln) {
              console.log('找到匹配的窑址数据:', kiln);
              setSelectedKiln(kiln);
            } else {
              console.log('未找到匹配的窑址数据');
            }
          } catch (error) {
            console.error('处理窑址点击事件时出错:', error);
          }
        } else {
          // 点击其他区域关闭窑址信息
          setSelectedKiln(null);
        }
      });
      
      // 处理窗口大小变化
      const handleResize = () => {
        console.log('窗口大小变化，调整地图大小');
        map.resize();
        // 重新渲染数据
        updateCharts(currentIndex);
      };
      
      window.addEventListener('resize', handleResize);
      
      // 初始化加载完成后更新一次图表
      setTimeout(() => {
        updateCharts(currentIndex);
        console.log('初始化后更新地图数据');
      }, 200);
      
      return () => {
        console.log('地图组件卸载，清理资源');
        window.removeEventListener('resize', handleResize);
        map.dispose();
      };
    } catch (error) {
      console.error('初始化地图时出错:', error);
    }
  }, []);

  const handleSliderChange = (_event: Event | React.ChangeEvent<unknown>, newValue: number | number[]) => {
    const index = Array.isArray(newValue) ? newValue[0] : newValue;
    setCurrentIndex(index);
    updateCharts(index);
  };

  const sliderMarks: { value: number; label: string }[] = historicalData.map((_, index) => ({
    value: index,
    label: `${historicalData[index].dynasty}\n${historicalData[index].year > 0 ? historicalData[index].year : '公元前' + Math.abs(historicalData[index].year)}年`
  }));

  // 准备图表数据
  const currentData = historicalData[currentIndex];
  const glazeData = currentData.glaze.split('、').map(item => ({
    name: item,
    value: 1
  }));

  const decorationData = currentData.decoration.split('、').map(item => ({
    name: item,
    value: 1
  }));

  // 修改导航按钮的处理函数
  const handlePrevDynasty = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    updateCharts(Math.max(0, currentIndex - 1));
  };

  const handleNextDynasty = () => {
    setCurrentIndex((prev) => Math.min(historicalData.length - 1, prev + 1));
    updateCharts(Math.min(historicalData.length - 1, currentIndex + 1));
  };

  // 添加关闭窑址信息的处理函数
  const handleCloseKilnInfo = () => {
    setSelectedKiln(null);
  };

  return (
    <StyledContainer>
      <Container style={{ height: pageHeight - 60 }}>
        <ContentContainer style={{ maxHeight: pageHeight - 40 }}>
          <SideSection>
            <ChartContainer className={isVisible ? 'visible' : ''}>
              <Typography variant="h6" gutterBottom align="center" sx={{ mb: 3, color: ceramicTheme.glaze.teadust }}>
                海上丝绸之路陶瓷贸易
              </Typography>
              <Typography variant="body2" gutterBottom align="center" sx={{ fontSize: '0.75rem', mb: 2 }}>
                {historicalData[currentIndex].year > 1368 || historicalData[currentIndex].year < -206 
                  ? ''
                  : maritimeSilkRoadData.find(d => 
                      historicalData[currentIndex].year >= d.year && 
                      (historicalData[currentIndex].year < (maritimeSilkRoadData[maritimeSilkRoadData.findIndex(item => item.year === d.year) + 1]?.year || 10000))
                    )?.event || '无重要贸易事件记载'}
              </Typography>
              <div style={{ height: '190px', marginTop: '20px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={ceramicTradeData}
                    margin={{ top: 25, right: 10, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8C5B2" />
                    <XAxis 
                      dataKey="dynasty" 
                      tick={{ fontSize: 11 }} 
                    />
                    <YAxis 
                      domain={[0, 24]} 
                      tickCount={5} 
                      label={{ 
                        value: '年出口量(万件)', 
                        position: 'top', 
                        offset: 10,
                        style: { fontSize: 10, fill: ceramicTheme.glaze.teadust, fontWeight: 500 }
                      }} 
                    />
                    <Tooltip 
                      formatter={(value, name) => {
                        const nameMap = {
                          southSeaExport: '南海航线',
                          eastSeaExport: '东海航线',
                          westOceanExport: '西洋航线'
                        };
                        return [`${value}万件`, nameMap[name as keyof typeof nameMap] || name];
                      }}
                      labelFormatter={(label) => `${label}陶瓷贸易量`}
                    />
                    <Legend 
                      align="center" 
                      verticalAlign="bottom" 
                      iconSize={8} 
                      wrapperStyle={{ fontSize: '15px', paddingTop: '5px' }}
                      formatter={(value) => {
                        const nameMap = {
                          southSeaExport: '南海航线',
                          eastSeaExport: '东海航线',
                          westOceanExport: '西洋航线'
                        };
                        return nameMap[value as keyof typeof nameMap] || value;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="southSeaExport" 
                      stroke="#3A5FCD" 
                      strokeWidth={2} 
                      dot={{ r: 4 }} 
                      activeDot={{ r: 6 }} 
                      name="southSeaExport"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="eastSeaExport" 
                      stroke="#88c0a8" 
                      strokeWidth={2} 
                      dot={{ r: 4 }} 
                      activeDot={{ r: 6 }} 
                      name="eastSeaExport"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="westOceanExport" 
                      stroke="#c13e34" 
                      strokeWidth={2} 
                      dot={{ r: 4 }} 
                      activeDot={{ r: 6 }} 
                      name="westOceanExport"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {historicalData[currentIndex].year <= 1368 && historicalData[currentIndex].year >= -206 && (
                <Typography variant="caption" align="center" display="block" sx={{ fontSize: '15px', mt: 0.5, color: '#666' }}>
                
                </Typography>
              )}
            </ChartContainer>
            <ChartContainer className={isVisible ? 'visible' : ''}>
              <Typography variant="h6" gutterBottom align="center" sx={{ mb: 3, color: ceramicTheme.glaze.teadust }}>
                窑炉温度变化
              </Typography>
              <div style={{ height: '190px', marginTop: '20px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={temperatureHeatmapData}
                    margin={{ top: 30, right: 45, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dynasty" tick={{ fontSize: 11 }} />
                    <YAxis 
                      domain={[700, 1500]} 
                      label={{ 
                        value: '温度(°C)', 
                        position: 'top', 
                        offset: 10,
                        style: { fontSize: 15, fill: ceramicTheme.glaze.teadust, fontWeight: 500 }
                      }} 
                      tickFormatter={(value) => `${value}°C`}
                    />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'minTemp') return [`${value}°C`, '最低温度'];
                        if (name === 'maxTemp') return [`${value}°C`, '最高温度'];
                        return [value, name];
                      }}
                      labelFormatter={(label) => `${label}朝代窑炉温度`}
                    />
                    <Bar dataKey="minTemp" stackId="a" fill={TEMP_COLORS[0]} name="最低温度" />
                    <Bar dataKey="maxTemp" stackId="a" fill={TEMP_COLORS[3]} name="温度范围" />
                    <ReferenceLine y={1200} stroke="red" strokeDasharray="3 3">
                      <Label value="瓷化温度线" position="insideBottomLeft" fill="red" fontSize={11} />
                    </ReferenceLine>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <Typography variant="caption" align="center" display="block" style={{ fontSize: '13px', marginTop: '5px', paddingRight: '15px', fontWeight: 'bold' }}>
                <b>当前窑型:</b> {ceramicFiringTechData.find(item => item.dynasty === currentData.dynasty)?.kilnType || '-'}
              </Typography>
            </ChartContainer>
          </SideSection>

          <MapContainer ref={mapRef} className={isVisible ? 'visible' : ''} style={{ height: pageHeight - 160 }}>
            <LegendContainer>
              <Typography variant="caption" sx={{ fontWeight: 'bold', mb: 1, color: ceramicTheme.glaze.teadust }}>
                图例
              </Typography>
              <LegendItem>
                <LegendSymbol sx={{ backgroundColor: ceramicTheme.glaze.redCopper }} />
                <Typography variant="caption">著名窑址</Typography>
              </LegendItem>
              <LegendItem>
                <LegendSymbol sx={{ backgroundColor: ceramicTheme.celadon.main }} />
                <Typography variant="caption">陶瓷生产中心</Typography>
              </LegendItem>
            </LegendContainer>
            
            {selectedKiln && (
              <KilnInfoCardComponent kiln={selectedKiln} onClose={handleCloseKilnInfo} />
            )}
          </MapContainer>

          <SideSection>
            <ChartContainer className={isVisible ? 'visible' : ''}>
              <Typography variant="h6" gutterBottom align="center" sx={{ mb: 3, color: ceramicTheme.glaze.teadust }}>
                釉色分布
              </Typography>
              <div style={{ height: '240px', marginTop: '-30px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={glazeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={55}
                      fill="#8884d8"
                      dataKey="value"
                      labelLine={{ strokeWidth: 1, stroke: '#666' }}
                      label={({
                        cx,
                        cy,
                        midAngle,
                        innerRadius,
                        outerRadius,
                        percent,
                        name
                      }) => {
                        const RADIAN = Math.PI / 180;
                        // 根据角度确定标签位置，让标签在扇形的外部
                        const radius = outerRadius * 1.3;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        
                        // 简短的釉色名和百分比
                        const shortName = name.length > 5 ? name.substring(0, 5) + '...' : name;
                        const percentValue = (percent * 100).toFixed(0);
                        
                        return (
                          <text
                            x={x}
                            y={y}
                            fill="#333"
                            textAnchor={x > cx ? 'start' : 'end'}
                            dominantBaseline="central"
                            fontSize="15"
                          >
                            {`${shortName} ${percentValue}%`}
                          </text>
                        );
                      }}
                    >
                      {glazeData.map((entry, index) => {
                        // 使用映射函数获取釉色对应的真实颜色
                        const color = getGlazeColor(entry.name);
                        return <Cell key={`cell-${index}`} fill={color} stroke="#fff" strokeWidth={1} />;
                      })}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any, name: any) => {
                        // 计算百分比
                        const total = glazeData.reduce((sum, item) => sum + item.value, 0);
                        const percent = ((value / total) * 100).toFixed(1);
                        const nameStr = String(name);
                        return [`${percent}%`, nameStr];
                      }} 
                      contentStyle={{ fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {currentData.dynasty === '现代' && (
                <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                  {currentData.glaze}
                </Typography>
              )}
            </ChartContainer>
            <ChartContainer className={isVisible ? 'visible' : ''}>
              <Typography variant="h6" gutterBottom align="center" sx={{ mb: 3, color: ceramicTheme.glaze.teadust }}>
                收缩率与代表作
              </Typography>
              <div style={{ height: '160px', marginTop: '20px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={shrinkageRateData}
                    margin={{ top: 30, right: 40, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dynasty" tick={{ fontSize: 11 }} />
                    <YAxis 
                      domain={[0, 30]} 
                      label={{ 
                        value: '收缩率(%)', 
                        position: 'top', 
                        offset: 10,
                        style: { fontSize: 13, fill: ceramicTheme.glaze.teadust, fontWeight: 500 }
                      }} 
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      formatter={(value) => [`${value}%`, '平均收缩率']}
                      labelFormatter={(label) => `${label}朝代陶瓷`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avgRate" 
                      stroke="#FF6B4A" 
                      activeDot={{ r: 8 }} 
                      strokeWidth={2}
                      name="平均收缩率"
                    />
                    <Brush dataKey="dynasty" height={20} stroke="#FF9F7F" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ marginTop: '10px', paddingRight: '16px', boxSizing: 'border-box', width: '100%' }}>
                <Typography variant="caption" align="left" display="block" style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 'bold' }}>
                  <b>收缩率范围:</b> {ceramicFiringTechData.find(item => item.dynasty === currentData.dynasty)?.shrinkageRate || '-'}%
                </Typography>
                <Typography variant="caption" align="left" display="block" style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 'bold' }}>
                  <b>代表作品:</b> {ceramicFiringTechData.find(item => item.dynasty === currentData.dynasty)?.representative || '-'}
                </Typography>
              </div>
            </ChartContainer>
          </SideSection>
        </ContentContainer>

        <Typography 
          variant="caption" 
          align="center" 
          sx={{ 
            display: 'block', 
            mb: 1, // 减小底部边距，原来是 2
            color: '#666',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s ease-out 0.9s, transform 0.8s ease-out 0.9s'
          }}
        >
          地图数据来自高德开放平台 审图号 GS(2024)1158号
        </Typography>

        <SliderBox>
          <SliderContainer className={isVisible ? 'visible' : ''}>
            <Slider
              value={currentIndex}
              onChange={handleSliderChange}
              min={0}
              max={historicalData.length - 1}
              marks={sliderMarks}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${historicalData[value].dynasty} (${historicalData[value].year > 0 ? historicalData[value].year : '公元前' + Math.abs(historicalData[value].year)}年)`}
              step={1}
              track={false}
              aria-label="历史时期选择"
              sx={{ width: '100%' }}
            />
          </SliderContainer>
        </SliderBox>
      </Container>

      {/* 修改导航按钮 */}
      <NavButton 
        className="left"
        onClick={handlePrevDynasty}
        disabled={currentIndex === 0}
      >
        <ChevronLeftIcon />
      </NavButton>
      
      <NavButton 
        className="right"
        onClick={handleNextDynasty}
        disabled={currentIndex === historicalData.length - 1}
      >
        <ChevronRightIcon />
      </NavButton>
    </StyledContainer>
  );
};

export default CeramicHistoryMap;