import React, { useRef } from 'react';
import { Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import html2canvas from 'html2canvas';

interface CeramicPreviewProps {
  temperature: number;
  isFiring: boolean;
  heatingRate: number;
  holdingTime: number;
  coolingRate: number;
  onGenerateImage?: (imageUrl: string) => void;
}

const StyledBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  textAlign: 'center'
}));

const CeramicPreview: React.FC<CeramicPreviewProps> = ({ 
  temperature, 
  isFiring,
  heatingRate,
  holdingTime,
  coolingRate,
  onGenerateImage
}) => {
  const ceramicRef = useRef<HTMLDivElement>(null);

  // 在组件内部计算高风险状态
  const isHighRisk = (temperature > 1300 && heatingRate >= 80) || 
                    (heatingRate >= 80 && coolingRate >= 80);

  // 生成图片
  const generateImage = async () => {
    if (!ceramicRef.current) return;

    try {
      const canvas = await html2canvas(ceramicRef.current, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      const imageUrl = canvas.toDataURL('image/png');
      if (onGenerateImage) {
        onGenerateImage(imageUrl);
      }
      return imageUrl;
    } catch (error) {
      console.error('生成图片失败:', error);
      return null;
    }
  };

  // 计算颜色效果
  const calculateColor = () => {
    // 计算保温时间对颜色的影响
    const holdingTimeEffect = Math.min(holdingTime / 75, 1);
    const holdingTimeFactor = 0.2 * holdingTimeEffect;

    // 计算冷却速率对颜色的影响
    const coolingRateEffect = Math.min(coolingRate / 40, 1);
    const coolingRateFactor = 0.1 * coolingRateEffect;

    if (temperature < 1200) {
      // 温度过低，颜色发灰
      return `linear-gradient(135deg, 
        rgb(${200 + holdingTimeFactor * 30}, ${200 + holdingTimeFactor * 30}, ${200 + holdingTimeFactor * 30}) 0%, 
        rgb(${230 + holdingTimeFactor * 30}, ${230 + holdingTimeFactor * 30}, ${230 + holdingTimeFactor * 30}) 100%)`;
    } else if (temperature > 1280) {
      // 温度过高，颜色发黄
      return `linear-gradient(135deg, 
        rgb(${255 - coolingRateFactor * 30}, ${250 - coolingRateFactor * 30}, ${240 - coolingRateFactor * 30}) 0%, 
        rgb(${255 - coolingRateFactor * 30}, ${255 - coolingRateFactor * 30}, ${230 - coolingRateFactor * 30}) 100%)`;
    } else {
      // 最佳温度范围，呈现典型的青白色
      return `linear-gradient(135deg, 
        rgb(${230 + holdingTimeFactor * 20}, ${230 + holdingTimeFactor * 20}, ${250 + holdingTimeFactor * 20}) 0%, 
        rgb(${255 + holdingTimeFactor * 20}, ${255 + holdingTimeFactor * 20}, ${255 + holdingTimeFactor * 20}) 100%)`;
    }
  };

  // 计算形状变化
  const calculateShape = () => {
    const shape = {
      borderRadius: '100px 100px 50px 50px',
      transform: 'scale(1)',
    };

    if (isHighRisk) {
      // 高风险状态下的形状变化更明显
      shape.transform = 'scale(0.92)';
      shape.borderRadius = '100px 100px 40px 40px';
    } else {
      // 原有的形状计算逻辑
      if (heatingRate > 60) {
        shape.transform = 'scale(0.95)';
        shape.borderRadius = '100px 100px 45px 45px';
      }

      if (coolingRate > 50) {
        shape.transform = 'scale(0.98)';
        shape.borderRadius = '100px 100px 48px 48px';
      }

      if (holdingTime < 60) {
        shape.transform = 'scale(0.97)';
        shape.borderRadius = '100px 100px 47px 47px';
      }
    }

    return shape;
  };

  // 获取影响因素说明
  const getEffectDescription = () => {
    const effects: string[] = [];
    
    if (temperature < 1200) {
      effects.push('温度过低，釉面发灰');
    } else if (temperature > 1280) {
      effects.push('温度过高，釉面发黄');
    }

    if (heatingRate > 60) {
      effects.push('升温过快，可能导致开裂');
    }

    if (coolingRate > 50) {
      effects.push('冷却过快，可能导致裂纹');
    }

    if (holdingTime < 60) {
      effects.push('保温时间不足，可能导致变形');
    }

    return effects.length > 0 ? effects.join('；') : '烧制条件良好';
  };

  return (
    <div
      style={{
        width: '200px',
        height: '300px',
        margin: '0 auto',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        ref={ceramicRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          background: calculateColor(),
          ...calculateShape(),
          boxShadow: '0 0 20px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60%',
            height: '80%',
            borderRadius: '60px 60px 30px 30px',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(5px)',
          }}
        />
      </div>
      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            display: 'block',
            mt: 1,
          }}
        >
          {getEffectDescription()}
        </Typography>
      </div>
    </div>
  );
};

export default CeramicPreview; 