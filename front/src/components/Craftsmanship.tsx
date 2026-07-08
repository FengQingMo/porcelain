import React from 'react';
import { Box, Typography, Stepper, Step, StepLabel, StepContent, Paper } from '@mui/material';

const steps = [
  {
    label: '选料',
    description: '选择优质瓷土，经过淘洗、沉淀、陈腐等工序，使泥料细腻均匀。',
    details: [
      '瓷土选择：景德镇高岭土',
      '淘洗工艺：水洗、沉淀、陈腐',
      '泥料要求：细腻、均匀、无杂质'
    ]
  },
  {
    label: '成型',
    description: '采用拉坯、模印、注浆等工艺，将泥料塑造成所需器型。',
    details: [
      '拉坯工艺：手工拉制',
      '模印工艺：模具压制',
      '注浆工艺：泥浆注模'
    ]
  },
  {
    label: '施釉',
    description: '在坯体表面施以釉料，釉料配方直接影响最终效果。',
    details: [
      '釉料配制：多种矿物原料混合',
      '施釉方法：浸釉、喷釉、刷釉',
      '釉层厚度：0.8-1.2mm'
    ]
  },
  {
    label: '烧制',
    description: '将施釉后的坯体放入窑炉，控制温度曲线进行烧制。',
    details: [
      '温度控制：1200-1400℃',
      '气氛控制：氧化/还原',
      '烧制时间：8-12小时'
    ]
  },
  {
    label: '装饰',
    description: '根据需求进行彩绘、描金等装饰工艺。',
    details: [
      '彩绘工艺：青花、粉彩',
      '描金工艺：金水描画',
      '釉上彩：低温彩绘'
    ]
  }
];

const Craftsmanship: React.FC = () => {
  return (
    <Box component="div">
      <Typography variant="h4" gutterBottom>
        工艺传承
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Stepper orientation="vertical">
          {steps.map((step, index) => (
            <Step key={index} active={true}>
              <StepLabel>
                <Typography variant="h6">{step.label}</Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body1" paragraph>
                  {step.description}
                </Typography>
                <Box component="div" sx={{ pl: 2 }}>
                  {step.details.map((detail, idx) => (
                    <Typography key={idx} variant="body2" color="text.secondary" paragraph>
                      • {detail}
                    </Typography>
                  ))}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
    </Box>
  );
};

export default Craftsmanship; 