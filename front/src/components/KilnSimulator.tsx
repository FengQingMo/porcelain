import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Slider, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button, 
  CircularProgress, 
  Grid,
  Stepper,
  Step,
  StepLabel,
  styled,
  SxProps,
  Theme
} from '@mui/material';
import CeramicPreview from './CeramicPreview.tsx';
import axios from 'axios';
import WarningIcon from '@mui/icons-material/Warning';

// 定义颜色选项
const CERAMIC_COLORS = [
  { 
    value: 'qingbai', 
    label: '青白瓷',
    description: '青白瓷是宋代最具代表性的瓷器之一，釉色清雅含蓄，介于青白之间，呈现出玉质感。其特点是釉层薄而均匀，胎体细腻，造型优美，是宋代瓷器工艺的巅峰之作。'
  },
  { 
    value: 'blue', 
    label: '青花瓷',
    description: '青花瓷是中国瓷器最具代表性的装饰技法，以钴料在瓷胎上绘画，施以透明釉，经高温烧制而成。蓝白相间，典雅大方，是元明清时期最受欢迎的瓷器品种。'
  },
  { 
    value: 'celadon', 
    label: '青瓷',
    description: '青瓷釉色温润如玉，是中国传统瓷器的重要代表。其特点是釉色青翠，釉层厚实，胎体细腻，具有独特的"玉质感"，是中国瓷器发展史上的重要里程碑。'
  },
  { 
    value: 'white', 
    label: '白瓷',
    description: '白瓷是中国瓷器的基础品种，以胎体洁白、釉色纯净著称。唐代邢窑白瓷、宋代定窑白瓷都是白瓷中的精品，展现了瓷器最本真的美感。'
  },
  { 
    value: 'red', 
    label: '红瓷',
    description: '红瓷以铜红釉为特色，釉色鲜艳夺目。明代宣德红釉瓷器最为著名，其釉色红艳如血，釉层肥厚，是高温红釉瓷器的代表。'
  }
];

// 定义形状选项
const CERAMIC_SHAPES = [
  { value: 'vase', label: '花瓶' },
  { value: 'bowl', label: '碗' },
  { value: 'plate', label: '盘子' },
  { value: 'teapot', label: '茶壶' },
  { value: 'cup', label: '茶杯' },
  { value: 'jar', label: '罐子' },
  { value: 'dish', label: '碟子' },
  { value: 'statue', label: '摆件' }
];

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
}));

const FeedbackBox = styled('div')({
  marginTop: '20px',
  padding: '15px',
  backgroundColor: 'rgba(255, 159, 127, 0.1)',
  borderRadius: '8px',
  border: '1px solid rgba(255, 159, 127, 0.3)',
});

const WarningText = styled('span')({
  color: '#d32f2f',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
});

const ButtonContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '24px',
});

const StatusContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  padding: '16px',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  borderRadius: '8px',
  border: '1px solid rgba(0, 0, 0, 0.1)',
});

const StatusItem = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const steps = [
  '选择瓷器类型',
  '设置烧制参数',
  '开始烧制',
  '完成'
];

const getTemperatureEffect = (temp: number): string => {
  if (temp >= 1300) {
    return '高温区间(1300-1400°C)：适合烧制高温瓷器，釉面会呈现出晶莹剔透的效果，但需要严格控制升温速度以防止变形。青花瓷和青白瓷在此温度下釉色最为理想。';
  } else if (temp >= 1200) {
    return '中高温区间(1200-1300°C)：最适合烧制各类瓷器，釉料充分熔融，可以形成理想的釉面效果。白瓷和青瓷在此温度下会形成均匀细腻的釉层。';
  } else if (temp >= 1000) {
    return '中温区间(1000-1200°C)：适合烧制低温釉瓷器，釉面会呈现出柔和的效果。红瓷在此温度下可以形成稳定的釉色。';
  } else {
    return '低温区间(800-1000°C)：主要用于陶器烧制，釉面较为朴素，保持了陶土的自然质感。适合制作素烧或低温釉陶器。';
  }
};

const getHeatingRateEffect = (rate: number): string => {
  if (rate >= 80) {
    return '快速升温(80-100°C/小时)：升温速度快，可以提高生产效率，但风险较大，容易造成瓷器开裂或变形。仅适用于小型或壁薄均匀的器物。';
  } else if (rate >= 50) {
    return '中速升温(50-80°C/小时)：较为理想的升温速度，可以确保瓷器均匀受热，适合大多数瓷器的烧制。';
  } else {
    return '慢速升温(20-50°C/小时)：升温稳定，可以充分确保瓷器的安全，特别适合大型器物或壁厚不均的瓷器，但耗时较长。';
  }
};

const getHoldingTimeEffect = (time: number): string => {
  if (time >= 90) {
    return '长时间保温(90-120分钟)：可以确保釉料充分熔融并与胎体结合，适合高温瓷器和釉层较厚的器物。会形成更加细腻的釉面效果。';
  } else if (time >= 60) {
    return '中等保温(60-90分钟)：适合大多数瓷器，可以确保釉面均匀，胎釉结合良好。';
  } else {
    return '短时保温(30-60分钟)：适用于低温瓷器和小型器物，可以节省时间和能源，但需要确保温度已经充分作用。';
  }
};

const getCoolingRateEffect = (rate: number): string => {
  if (rate >= 80) {
    return '快速冷却(80-100°C/小时)：冷却速度快，可以提高生产效率，但可能导致釉面开片或产生细小裂纹。仅适用于部分低温瓷器。';
  } else if (rate >= 50) {
    return '中速冷却(50-80°C/小时)：较为安全的冷却速度，可以在保证质量的同时兼顾效率。适合大多数瓷器。';
  } else {
    return '慢速冷却(20-50°C/小时)：冷却过程最为安全，可以避免瓷器因温差应力产生裂纹。特别适合高温瓷器和大型器物。';
  }
};

const StyledBox = styled(Box)({
  position: 'relative',
  textAlign: 'center',
  marginTop: '24px',
  marginBottom: '24px'
});

const PulseTypography = styled(Typography)({
  color: '#FF9F7F',
  fontSize: '1.1rem'
});

const StyledStatusContainer = styled(StatusContainer)({
  background: 'rgba(255,159,127,0.05)',
  borderRadius: '12px',
  padding: '24px',
  boxShadow: '0 4px 12px rgba(255,159,127,0.1)'
});

const StatusCircularProgress = styled(CircularProgress)({
  color: '#FFB98E'
});

const StatusTypography = styled(Typography)({
  color: '#666',
  marginLeft: '16px'
});

const SuccessBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  '& .MuiTypography-root': {
    animation: 'none'
  }
});

const SuccessTitle = styled(Typography)({
  color: '#FF6B4A',
  fontWeight: 'bold',
  textShadow: '2px 2px 4px rgba(255,159,127,0.3)'
});

const SuccessPoem = styled(Typography)({
  color: '#FF9F7F',
  fontStyle: 'italic',
  textAlign: 'center',
  margin: '16px 0'
});

const SuccessSubtitle = styled(Typography)({
  color: '#666',
  fontWeight: 500,
  textAlign: 'center',
  background: 'linear-gradient(45deg, #FFB98E, #FF9F7F)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent'
});

const FailureBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  padding: '24px',
  background: 'linear-gradient(to bottom, rgba(255,159,127,0.05), rgba(255,159,127,0.1))',
  borderRadius: '12px',
  border: '1px solid rgba(255,159,127,0.2)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
});

const FailureTitle = styled(Typography)({
  color: '#FF6B4A',
  textAlign: 'center',
  fontWeight: 500,
  textShadow: '1px 1px 2px rgba(255,159,127,0.2)'
});

const FailureSubtitle = styled(Typography)({
  color: '#666',
  marginTop: '8px',
  textAlign: 'center',
  fontStyle: 'italic'
});

// 修改背景颜色为更柔和的暖色调
const KilnBackground = styled('div')({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: -2,
  background: 'radial-gradient(circle at center, #fff 20%, #fff6f2 60%, #fff0e8 100%)',
  overflow: 'hidden'
});

// 修改火焰效果组件
const Flames = styled('div')({
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
  height: '200px',
  pointerEvents: 'none',
  zIndex: -1,
  '& .flame': {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(to top, rgba(255,140,0,0.4) 0%, rgba(255,100,0,0.2) 50%, transparent 100%)',
    filter: 'blur(8px)',
    '&::before': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '100%',
      background: 'linear-gradient(to top, rgba(255,160,0,0.6) 0%, rgba(255,120,0,0.3) 40%, transparent 100%)',
      clipPath: 'url(#flamePath)',
    }
  },
  '& svg': {
    position: 'absolute',
    width: 0,
    height: 0,
  }
});

const KilnSimulator: React.FC = () => {
  const [temperature, setTemperature] = useState(1260);
  const [heatingRate, setHeatingRate] = useState(50);
  const [holdingTime, setHoldingTime] = useState(75);
  const [coolingRate, setCoolingRate] = useState(40);
  const [selectedColor, setSelectedColor] = useState('qingbai');
  const [selectedShape, setSelectedShape] = useState('vase');
  const [isFiring, setIsFiring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const progressRef = useRef<NodeJS.Timeout>();
  const taskIdRef = useRef<string | null>(null);
  const statusCheckRef = useRef<NodeJS.Timeout>();
  const [activeStep, setActiveStep] = useState(0);
  const [feedback, setFeedback] = useState<string>('');
  const [taskStatus, setTaskStatus] = useState<string>('');

  const checkTaskStatus = async (taskId: string) => {
    try {
      const response = await axios.get(`http://47.93.216.125:7777/api/v1/tasks/${taskId}`);
      const taskStatus = response.data.output?.task_status;
      setTaskStatus(taskStatus);
      
      if (taskStatus === 'SUCCEEDED') {
        setGeneratedImage(response.data.output?.results?.[0]?.url);
        setIsFiring(false);
        setActiveStep(3);
        
        // 检查是否是高风险参数组合
        const isHighRisk = (temperature > 1300 && heatingRate >= 80) || 
                          (heatingRate >= 80 && coolingRate >= 80);
        
        // 根据风险状态设置不同的反馈信息和完成状态
        if (isHighRisk) {
          setIsComplete(false); // 设置为失败状态
          setFeedback('啊呀，这次烧制似乎不太成功呢...(。•́︿•̀。)\n\n温度和速度的配合出现了一些问题，导致瓷器出现了裂纹。不过没关系，让我们调整一下参数再试试吧！\n\n建议：可以尝试降低升温速度或冷却速度，这样瓷器会更加完整哦~\n\n小贴士：匠人们常说"欲速则不达"，烧制瓷器也是如此呢~');
        } else {
          setIsComplete(true); // 设置为成功状态
          const colorInfo = CERAMIC_COLORS.find(c => c.value === selectedColor);
          const shapeInfo = CERAMIC_SHAPES.find(s => s.value === selectedShape);
          setFeedback(`哇！太棒啦！(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧\n\n这次烧制简直完美呢！${colorInfo?.label}的${shapeInfo?.label}釉色和质地都恰到好处，就像一件艺术品一样呢！您真是个超有天赋的陶艺师！\n\n让我们一起欣赏这件精美的作品吧~\n\n小贴士：这样的参数组合真的很棒哦，建议记录下来，说不定下次还能创作出更美的作品呢！(◍•ᴗ•◍)❤`);
        }
        
        if (statusCheckRef.current) {
          clearInterval(statusCheckRef.current);
        }
      } else if (taskStatus === 'FAILED') {
        setIsComplete(false);
        setFeedback('啊呀，真是太遗憾了...(╥﹏╥)\n\n这次烧制似乎出了一些小问题。但是没关系哦，失败是成功之母，让我们调整参数再试一次吧！\n\n我会一直陪着您，相信下一次一定会成功的！加油！٩(◕‿◕｡)۶\n\n小贴士：要不要我们先喝杯茶，休息一下再继续呢？');
        throw new Error('任务失败');
      }
    } catch (error) {
      console.error('检查任务状态失败:', error);
      setTaskStatus('FAILED');
      setIsComplete(false);
      setFeedback('哎呀，出了一些技术上的小问题呢...(。•́︿•̀。)\n\n让我们休息一下下，稍后再试试看吧！我相信技术的小问题很快就会解决的！\n\n要不要先去看看其他有趣的瓷器知识呢？🌸');
      alert('检查任务状态失败，请重试');
      setIsFiring(false);
      if (statusCheckRef.current) {
        clearInterval(statusCheckRef.current);
      }
    }
  };

  const handleStartFiring = async () => {
    setIsFiring(true);
    setProgress(0);
    setIsComplete(false);
    setGeneratedImage(null);
    setTaskStatus('PENDING');
    handleNext();
    
    try {
      const colorInfo = CERAMIC_COLORS.find(c => c.value === selectedColor);
      const shapeInfo = CERAMIC_SHAPES.find(s => s.value === selectedShape);
      
      // 获取各个参数的反馈信息
      const temperatureEffect = getTemperatureEffect(temperature);
      const heatingRateEffect = getHeatingRateEffect(heatingRate);
      const holdingTimeEffect = getHoldingTimeEffect(holdingTime);
      const coolingRateEffect = getCoolingRateEffect(coolingRate);

      // 检查是否存在高风险参数组合
      const isHighRisk = (temperature > 1300 && heatingRate >= 80) || 
                        (heatingRate >= 80 && coolingRate >= 80);
      
      let prompt;
      if (isHighRisk) {
        // 高风险参数组合的提示词
        prompt = `生成一张${colorInfo?.label}的${shapeInfo?.label}图片，但需要表现出烧制失败的效果。烧制参数：温度${temperature}°C（${temperatureEffect}），升温速率${heatingRate}°C/小时（${heatingRateEffect}），保温时间${holdingTime}分钟（${holdingTimeEffect}），冷却速率${coolingRate}°C/小时（${coolingRateEffect}）。瓷器表面应该出现以下问题：釉面开裂、变形、气泡、釉色不均匀、胎体开裂等现象，整体呈现出烧制失败的效果。`;
      } else {
        // 正常参数组合的提示词
        prompt = `生成一张${colorInfo?.label}的${shapeInfo?.label}图片。烧制参数：温度${temperature}°C（${temperatureEffect}），升温速率${heatingRate}°C/小时（${heatingRateEffect}），保温时间${holdingTime}分钟（${holdingTimeEffect}），冷却速率${coolingRate}°C/小时（${coolingRateEffect}）。瓷器表面应该呈现出典型的${colorInfo?.label}釉面效果，整体造型优美，具有传统中国瓷器特色。`;
      }
      
      const requestData = {
        model: "wanx2.1-t2i-turbo",
        input: {
          prompt: prompt
        },
        parameters: {
          size: "1024*1024",
          n: 1
        }
      };

      setTaskStatus('RUNNING');
      const response = await axios.post(
        'http://47.93.216.125:7777/api/v1/services/aigc/text2image/image-synthesis',
        requestData,
        {
          headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'X-DashScope-Async': 'enable'
          }
        }
      );

      if (response.data.output?.task_id) {
        taskIdRef.current = response.data.output.task_id;
        statusCheckRef.current = setInterval(() => {
          checkTaskStatus(taskIdRef.current!);
        }, 2000);
      } else {
        throw new Error('未获取到任务ID');
      }
    } catch (error) {
      console.error('创建任务失败:', error);
      setTaskStatus('FAILED');
      alert('创建任务失败，请重试');
      setIsFiring(false);
      handleBack();
      return;
    }
    
    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressRef.current);
          return 100;
        }
        return prev + 1;
      });
    }, 50);
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `ceramic_${selectedColor}_${temperature}°C.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFeedbackContent = () => {
    let newFeedback = '';
    let isHighRisk = false;
    
    if (activeStep === 0) {
      const colorInfo = CERAMIC_COLORS.find(c => c.value === selectedColor);
      const shapeInfo = CERAMIC_SHAPES.find(s => s.value === selectedShape);
      newFeedback = `您选择了${colorInfo?.label}的${shapeInfo?.label}。\n\n`;
      newFeedback += colorInfo?.description || '';
    } else if (activeStep === 1) {
      // 综合建议
      if (temperature > 1300) {
        if (heatingRate >= 80) {
          newFeedback = '当前参数组合风险较大，建议降低升温速率以确保安全。';
          isHighRisk = true;
        } else if (heatingRate < 50) {
          newFeedback = '当前参数组合较为合理，慢速升温有助于确保高温烧制的安全性。';
        } else {
          newFeedback = '当前参数组合适中，但建议密切关注升温过程。';
        }
      } else if (temperature < 1000 && holdingTime >= 90) {
        newFeedback = '低温烧制时保温时间过长，建议适当缩短保温时间以提高效率。';
      } else if (heatingRate >= 80 && coolingRate >= 80) {
        newFeedback = '快速升温快速冷却的组合风险较大，建议调整其中一个参数。';
        isHighRisk = true;
      } else {
        newFeedback = '当前参数组合较为平衡，适合大多数瓷器的烧制。';
      }
    }
    
    return { feedback: newFeedback, isHighRisk };
  };

  const updateFeedback = () => {
    const { feedback: newFeedback } = getFeedbackContent();
    setFeedback(newFeedback);
  };

  useEffect(() => {
    updateFeedback();
  }, [activeStep, selectedColor, selectedShape, temperature, heatingRate, holdingTime, coolingRate]);

  const handleNext = () => {
    if (activeStep === 0 && (!selectedColor || !selectedShape)) {
      return;
    }
    if (activeStep === 1 && temperature < 800) {
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleRestart = () => {
    setActiveStep(0);
    setIsFiring(false);
    setProgress(0);
    setIsComplete(false);
    setGeneratedImage(null);
    setTaskStatus('');
    setFeedback('');
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
            <Typography variant="h6" gutterBottom>
              选择瓷器类型
            </Typography>
            <Typography variant="body1" paragraph>
              请选择您想要制作的瓷器类型。不同的颜色和形状会产生不同的艺术效果。
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>瓷器颜色</InputLabel>
              <Select
                value={selectedColor}
                label="瓷器颜色"
                onChange={(e) => setSelectedColor(e.target.value)}
              >
                {CERAMIC_COLORS.map((color) => (
                  <MenuItem key={color.value} value={color.value}>
                    {color.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>瓷器形状</InputLabel>
              <Select
                value={selectedShape}
                label="瓷器形状"
                onChange={(e) => setSelectedShape(e.target.value)}
              >
                {CERAMIC_SHAPES.map((shape) => (
                  <MenuItem key={shape.value} value={shape.value}>
                    {shape.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        );

      case 1:
        return (
          <>
            <Typography variant="h6" gutterBottom>
              设置烧制参数
            </Typography>
            <Typography variant="body1" paragraph>
              调整烧制参数以获得最佳效果。不同的参数组合会产生不同的釉色和质地。每个参数都会对最终成品产生重要影响。
            </Typography>

            <Typography variant="subtitle1" gutterBottom>
              温度: {temperature}°C
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {getTemperatureEffect(temperature)}
            </Typography>
            <Slider
              value={temperature}
              onChange={(_, value) => setTemperature(value as number)}
              min={800}
              max={1400}
              step={20}
              marks
              valueLabelDisplay="auto"
              sx={{ mb: 3 }}
            />

            <Typography variant="subtitle1" gutterBottom>
              升温速率: {heatingRate}°C/小时
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {getHeatingRateEffect(heatingRate)}
            </Typography>
            <Slider
              value={heatingRate}
              onChange={(_, value) => setHeatingRate(value as number)}
              min={20}
              max={100}
              step={5}
              marks
              valueLabelDisplay="auto"
              sx={{ mb: 3 }}
            />

            <Typography variant="subtitle1" gutterBottom>
              保温时间: {holdingTime}分钟
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {getHoldingTimeEffect(holdingTime)}
            </Typography>
            <Slider
              value={holdingTime}
              onChange={(_, value) => setHoldingTime(value as number)}
              min={30}
              max={120}
              step={5}
              marks
              valueLabelDisplay="auto"
              sx={{ mb: 3 }}
            />

            <Typography variant="subtitle1" gutterBottom>
              冷却速率: {coolingRate}°C/小时
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {getCoolingRateEffect(coolingRate)}
            </Typography>
            <Slider
              value={coolingRate}
              onChange={(_, value) => setCoolingRate(value as number)}
              min={20}
              max={100}
              step={5}
              marks
              valueLabelDisplay="auto"
              sx={{ mb: 3 }}
            />

            {isFiring && (
              <StatusContainer sx={{ mb: 3 }}>
                <StatusItem>
                  <CircularProgress variant="determinate" value={progress} />
                  <Typography>
                    烧制进度: {progress}%
                  </Typography>
                </StatusItem>
                <StatusItem>
                  <CircularProgress size={24} />
                  <Typography>
                    任务状态: {
                      taskStatus === 'PENDING' ? '等待中...' :
                      taskStatus === 'RUNNING' ? '正在处理中...' :
                      taskStatus === 'SUCCEEDED' ? '已完成' :
                      taskStatus === 'FAILED' ? '失败' :
                      '未知状态'
                    }
                  </Typography>
                </StatusItem>
                {taskStatus === 'RUNNING' && (
                  <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>
                    正在根据您设置的参数生成瓷器图片，这可能需要一些时间...
                  </Typography>
                )}
              </StatusContainer>
            )}
          </>
        );

      case 2:
        return (
          <>
            <Typography variant="h6" gutterBottom align="center">
              烧制进行中...
            </Typography>
            <StyledBox>
              <PulseTypography variant="body1">
                匠心独运，静待佳作
              </PulseTypography>
            </StyledBox>
            <StyledStatusContainer>
              {isFiring && (
                <StatusItem>
                  <StatusCircularProgress size={24} />
                  <StatusTypography>
                    {taskStatus === 'RUNNING' && '瓷器正在成型...'}
                    {taskStatus === 'PENDING' && '准备开始烧制...'}
                    {taskStatus === 'SUCCEEDED' && '烧制圆满完成！'}
                    {taskStatus === 'FAILED' && '遇到了一些小问题...'}
                  </StatusTypography>
                </StatusItem>
              )}
            </StyledStatusContainer>
          </>
        );

      case 3:
        return (
          <>
            {!isComplete && (
              <FailureBox>
                <FailureTitle variant="h5">
                  烧制遇到了一点小挫折 (。•́︿•̀。)
                </FailureTitle>
                <FailureSubtitle variant="subtitle1">
                  别担心，每次失败都是通向大师之路的垫脚石呢~
                </FailureSubtitle>
                
              </FailureBox>
            )}
            {isComplete && (
              <SuccessBox>
                <SuccessTitle variant="h4">
                  恭喜您获得了一件完美的{CERAMIC_COLORS.find(c => c.value === selectedColor)?.label}杰作！
                </SuccessTitle>
                
                <SuccessPoem variant="h6">
                  妙手匠心出华章，千年窑火今绽放
                </SuccessPoem>
                
                <SuccessSubtitle variant="subtitle1">
                  您的陶艺造诣已经更上一层楼啦~
                </SuccessSubtitle>
              </SuccessBox>
            )}

            <Typography 
              variant="body1" 
              paragraph 
              sx={{ 
                whiteSpace: 'pre-line',
                padding: 2,
                borderRadius: 2,
                textAlign: 'center',
                fontSize: '1.1rem',
                lineHeight: 1.8,
                animation: 'none'
              } as SxProps<Theme>}
            >
              {feedback}
            </Typography>

            <div style={{ 
              display: 'flex', 
              gap: '16px', 
              marginTop: '24px',
              justifyContent: 'center'
            }}>
              {isComplete && generatedImage && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleDownload}
                  fullWidth
                  sx={{
                    background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
                    boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)',
                    animation: 'none'
                  }}
                >
                  珍藏这件瑰宝
                </Button>
              )}
              <Button
                variant="contained"
                color="primary"
                onClick={handleRestart}
                fullWidth
                sx={{
                  background: 'linear-gradient(45deg, #FF9F7F 30%, #FFB98E 90%)',
                  boxShadow: '0 3px 5px 2px rgba(255, 159, 127, .3)',
                  animation: 'none'
                }}
              >
                让我们再创作一件吧 ٩(◕‿◕｡)۶
              </Button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  // 修改渲染火焰的函数
  const renderFlames = () => {
    return (
      <Flames>
        <svg>
          <defs>
            <clipPath id="flamePath">
              <path
                d="M0 200 Q 50 180, 100 200 Q 150 160, 200 200 Q 250 170, 300 200 Q 350 150, 400 200 Q 450 180, 500 200 Q 550 160, 600 200 Q 650 170, 700 200 Q 750 150, 800 200 Q 850 180, 900 200 Q 950 160, 1000 200 L 1000 200 L 0 200 Z"
              >
                <animate
                  attributeName="d"
                  dur="3s"
                  repeatCount="indefinite"
                  values="M0 200 Q 50 180, 100 200 Q 150 160, 200 200 Q 250 170, 300 200 Q 350 150, 400 200 Q 450 180, 500 200 Q 550 160, 600 200 Q 650 170, 700 200 Q 750 150, 800 200 Q 850 180, 900 200 Q 950 160, 1000 200 L 1000 200 L 0 200 Z;
                       M0 200 Q 50 160, 100 200 Q 150 180, 200 200 Q 250 150, 300 200 Q 350 170, 400 200 Q 450 160, 500 200 Q 550 180, 600 200 Q 650 150, 700 200 Q 750 170, 800 200 Q 850 160, 900 200 Q 950 180, 1000 200 L 1000 200 L 0 200 Z;
                       M0 200 Q 50 180, 100 200 Q 150 160, 200 200 Q 250 170, 300 200 Q 350 150, 400 200 Q 450 180, 500 200 Q 550 160, 600 200 Q 650 170, 700 200 Q 750 150, 800 200 Q 850 180, 900 200 Q 950 160, 1000 200 L 1000 200 L 0 200 Z"
                />
              </path>
            </clipPath>
          </defs>
        </svg>
        <div className="flame" />
      </Flames>
    );
  };

  useEffect(() => {
    return () => {
      if (progressRef.current) {
        clearInterval(progressRef.current);
      }
      if (statusCheckRef.current) {
        clearInterval(statusCheckRef.current);
      }
    };
  }, []);

  return (
    <>
      <KilnBackground />
      {renderFlames()}
      <Box component="div">
        <Typography variant="h4" gutterBottom align="center">
          窑炉模拟器
        </Typography>

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <StyledPaper>
              {renderStepContent()}
              {activeStep !== 3 && feedback && (
                <FeedbackBox>
                  <Typography variant="subtitle1" gutterBottom>
                    当前选择反馈：
                  </Typography>
                  <Typography variant="body2" style={{ whiteSpace: 'pre-line' }}>
                    {(() => {
                      const { isHighRisk } = getFeedbackContent();
                      return isHighRisk ? (
                        <WarningText>
                          <WarningIcon fontSize="small" />
                          {feedback}
                        </WarningText>
                      ) : (
                        feedback
                      );
                    })()}
                  </Typography>
                </FeedbackBox>
              )}
              {activeStep < steps.length - 1 && (
                <ButtonContainer>
                  <Button
                    variant="outlined"
                    disabled={activeStep === 0}
                    onClick={handleBack}
                  >
                    上一步
                  </Button>
                  <Button
                    variant="contained"
                    onClick={activeStep === 1 ? handleStartFiring : handleNext}
                    disabled={
                      (activeStep === 0 && (!selectedColor || !selectedShape)) ||
                      (activeStep === 1 && temperature < 800) ||
                      (activeStep === 2 && !isComplete)
                    }
                  >
                    {activeStep === 1 ? '开始烧制' : '下一步'}
                  </Button>
                </ButtonContainer>
              )}
            </StyledPaper>
          </Grid>

          <Grid item xs={12} md={6}>
            <StyledPaper>
              <Typography variant="h6" gutterBottom align="center">
                瓷器效果预览
              </Typography>
              {generatedImage ? (
                <img 
                  src={generatedImage} 
                  alt="生成的瓷器" 
                  style={{ 
                    width: '100%', 
                    height: 'auto',
                    maxHeight: '400px',
                    objectFit: 'contain'
                  }} 
                />
              ) : (
                <CeramicPreview
                  temperature={temperature}
                  isFiring={isFiring}
                  heatingRate={heatingRate}
                  holdingTime={holdingTime}
                  coolingRate={coolingRate}
                />
              )}
            </StyledPaper>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default KilnSimulator; 