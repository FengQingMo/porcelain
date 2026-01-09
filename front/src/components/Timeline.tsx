import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import * as echarts from 'echarts';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { ceramicTheme } from './ceramicTheme.ts';

// 历史数据
const historicalData = [
  { 
    year: 8000, 
    dynasty: '新石器时代', 
    event: '陶器起源', 
    production: 100, 
    glaze: '无釉',
    decoration: '素面、绳纹',
    shape: '简单实用'
  },
  { 
    year: 2000, 
    dynasty: '夏商周', 
    event: '原始瓷器出现', 
    production: 500, 
    glaze: '原始青瓷',
    decoration: '几何纹、动物纹',
    shape: '礼器为主'
  },
  { 
    year: 206, 
    dynasty: '汉', 
    event: '青瓷成熟', 
    production: 1000, 
    glaze: '青瓷',
    decoration: '刻花、堆贴',
    shape: '实用器皿'
  },
  { 
    year: 618, 
    dynasty: '唐', 
    event: '瓷器发展初期', 
    production: 2000, 
    glaze: '青瓷、白瓷',
    decoration: '三彩、彩绘',
    shape: '丰满圆润'
  },
  { 
    year: 960, 
    dynasty: '宋', 
    event: '瓷器鼎盛', 
    production: 5000, 
    glaze: '青瓷、汝窑、官窑',
    decoration: '简约素雅',
    shape: '简洁优雅'
  },
  { 
    year: 1271, 
    dynasty: '元', 
    event: '青花瓷兴起', 
    production: 8000, 
    glaze: '青花釉',
    decoration: '青花图案',
    shape: '端庄大气'
  },
  { 
    year: 1368, 
    dynasty: '明', 
    event: '官窑设立', 
    production: 12000, 
    glaze: '青花、釉里红、斗彩',
    decoration: '青花、斗彩、五彩',
    shape: '多样化发展'
  },
  { 
    year: 1644, 
    dynasty: '清', 
    event: '瓷器工艺巅峰', 
    production: 15000, 
    glaze: '粉彩、珐琅彩、青花',
    decoration: '粉彩、珐琅彩、青花',
    shape: '精致华丽'
  },
  { 
    year: 1911, 
    dynasty: '民国', 
    event: '近代制瓷', 
    production: 20000, 
    glaze: '综合',
    decoration: '中西结合',
    shape: '创新多样'
  }
];

// 装饰风格分布数据
const decorationData = [
  { name: '青花', value: 35 },
  { name: '粉彩', value: 25 },
  { name: '斗彩', value: 15 },
  { name: '素面', value: 15 },
  { name: '其他', value: 10 },
];

const TimelineContainer = styled('div')({
  position: 'relative',
  width: '100%',
  overflow: 'hidden'
});

const ChartContainer = styled('div')({
  flex: 1,
  height: 'calc(100vh - 200px)',  // 使用视口高度计算
  padding: '15px',
  backgroundColor: ceramicTheme.blueAndWhite.white,
  backgroundImage: `radial-gradient(circle at 90% 10%, ${ceramicTheme.celadon.light}55, transparent 60%)`,
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(161, 146, 130, 0.15)',
  opacity: 0,
  transform: 'translateX(20px)',
  transition: 'opacity 0.8s ease-out 0.6s, transform 0.8s ease-out 0.6s',
  overflow: 'hidden',
  border: `1px solid ${ceramicTheme.clay.main}`,
  '&.visible': {
    opacity: 1,
    transform: 'translateX(0)'
  },
  '@media (max-width: 600px)': {
    height: 'calc(100vh - 300px)',  // 在小屏幕上调整高度
    padding: '10px'
  }
});

const ChartView = styled('div')({
  position: 'absolute',
  width: '100%',
  height: '100%',
  transition: 'opacity 0.3s ease-in-out'
});

const EventsView = styled('div')<{ isVisible: boolean }>(({ isVisible }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  display: isVisible ? 'block' : 'none',
  transition: 'opacity 0.3s ease-in-out',
  overflowY: 'auto'
}));

const Timeline: React.FC = () => {
  const timelineChartRef = useRef<HTMLDivElement>(null);
  const decorationChartRef = useRef<HTMLDivElement>(null);
  const historyChartRef = useRef<HTMLDivElement>(null);
  const [currentView, setCurrentView] = useState<'charts' | 'events'>('charts');

  useEffect(() => {
    if (!timelineChartRef.current || !decorationChartRef.current || !historyChartRef.current) return;

    // 初始化图表
    const timelineChart = echarts.init(timelineChartRef.current);
    const decorationChart = echarts.init(decorationChartRef.current);
    const historyChart = echarts.init(historyChartRef.current);

    // 器型演变和产量变化图表配置
    const timelineOption = {
      title: {
        text: '器型演变与产量变化',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      legend: {
        data: ['器型特点', '产量(件)'],
        top: 30
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: historicalData.map(item => `${item.dynasty}\n${item.year}年`),
        axisLabel: {
          interval: 0,
          formatter: (value: string) => value
        }
      },
      yAxis: [
        {
          type: 'value',
          name: '产量(件)',
          position: 'left',
          axisLabel: {
            formatter: '{value}'
          }
        },
        {
          type: 'category',
          name: '器型特点',
          position: 'right',
          data: historicalData.map(item => item.shape),
          axisLabel: {
            formatter: '{value}'
          }
        }
      ],
      series: [
        {
          name: '器型特点',
          type: 'line',
          yAxisIndex: 1,
          data: historicalData.map(item => item.shape),
          smooth: true,
          symbol: 'circle',
          lineStyle: {
            color: '#8884d8'
          }
        },
        {
          name: '产量(件)',
          type: 'line',
          yAxisIndex: 0,
          data: historicalData.map(item => item.production),
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            color: '#82ca9d'
          }
        }
      ]
    };

    // 装饰风格分布图表配置
    const decorationOption = {
      title: {
        text: '装饰风格分布',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 30
      },
      series: [
        {
          name: '装饰风格',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '20',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: decorationData
        }
      ]
    };

    // 陶瓷史时间轴图表配置
    const historyOption = {
      title: {
        text: '陶瓷发展史',
        left: 'center',
        top: 10
      },
      tooltip: {
        trigger: 'axis',
        formatter: function (params: any) {
          const data = params[0].data;
          return `${data.dynasty} ${data.year}年<br/>
                  ${data.event}<br/>
                  装饰风格：${data.decoration}<br/>
                  器型特点：${data.shape}`;
        }
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '10%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        axisLabel: {
          formatter: function (value: number) {
            return value + '年';
          }
        }
      },
      yAxis: {
        type: 'category',
        data: historicalData.map(item => item.dynasty),
        axisLabel: {
          formatter: '{value}'
        }
      },
      series: [
        {
          name: '陶瓷发展史',
          type: 'scatter',
          symbol: 'circle',
          symbolSize: 12,
          data: historicalData.map(item => ({
            value: [item.year, item.dynasty],
            dynasty: item.dynasty,
            year: item.year,
            event: item.event,
            decoration: item.decoration,
            shape: item.shape
          })),
          itemStyle: {
            color: '#8884d8'
          },
          emphasis: {
            itemStyle: {
              color: '#ff7f50'
            }
          }
        },
        {
          name: '发展脉络',
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: {
            color: '#8884d8',
            width: 2
          },
          data: historicalData.map(item => [item.year, item.dynasty])
        }
      ]
    };

    // 设置图表配置
    timelineChart.setOption(timelineOption);
    decorationChart.setOption(decorationOption);
    historyChart.setOption(historyOption);

    // 响应式调整
    const handleResize = () => {
      timelineChart.resize();
      decorationChart.resize();
      historyChart.resize();
    };
    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      timelineChart.dispose();
      decorationChart.dispose();
      historyChart.dispose();
    };
  }, []);

  const handleViewChange = (direction: 'left' | 'right') => {
    setCurrentView(prev => prev === 'charts' ? 'events' : 'charts');
  };

  return (
    <Box component="div" sx={{ 
      position: 'relative', 
      width: '90vw',
      overflow: 'hidden',
      backgroundColor: '#f5f9ff',
      minHeight: '600px',
      p: 2,
      margin: 'auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        align="center"
        sx={{
          color: '#1a4b8c',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        陶瓷发展时空脉络
      </Typography>

      <TimelineContainer>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card sx={{ 
              height: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(26, 75, 140, 0.1)',
              boxShadow: '0 4px 20px rgba(26, 75, 140, 0.1)'
            }}>
              <CardContent sx={{ height: '100%', p: 2 }}>
                <ChartContainer>
                  {/* 图表视图 */}
                  <ChartView style={{ 
                    display: currentView === 'charts' ? 'block' : 'none'
                  }}>
                    <Grid container spacing={2} sx={{ height: '100%' }}>
                      <Grid item xs={12} md={6} sx={{ height: '100%' }}>
                        <div ref={timelineChartRef} style={{ height: '100%', width: '100%' }} />
                      </Grid>
                      <Grid item xs={12} md={6} sx={{ height: '100%' }}>
                        <div ref={decorationChartRef} style={{ height: '100%', width: '100%' }} />
                      </Grid>
                      <Grid item xs={12} sx={{ height: '100%', mt: 2 }}>
                        <div ref={historyChartRef} style={{ height: '100%', width: '100%' }} />
                      </Grid>
                    </Grid>
                  </ChartView>

                  {/* 事件视图 */}
                  <EventsView isVisible={currentView === 'events'}>
                    <Typography variant="h6" gutterBottom>
                      陶瓷史
                    </Typography>
                    <div style={{ marginTop: '16px' }}>
                      {historicalData.map((item, index) => (
                        <Paper 
                          key={index} 
                          sx={{ 
                            p: 2, 
                            mb: 2, 
                            position: 'relative',
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                              backgroundColor: 'rgba(255, 255, 255, 0.9)'
                            },
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              left: -20,
                              top: '50%',
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: '#8884d8',
                              transform: 'translateY(-50%)',
                              transition: 'all 0.3s ease-in-out',
                            },
                            '&:hover::before': {
                              backgroundColor: '#ff7f50',
                              transform: 'translateY(-50%) scale(1.2)'
                            },
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              left: -14,
                              top: '50%',
                              width: 2,
                              height: '100%',
                              backgroundColor: '#8884d8',
                              transform: 'translateY(-50%)',
                              transition: 'all 0.3s ease-in-out',
                            },
                            '&:hover::after': {
                              backgroundColor: '#ff7f50'
                            },
                          }}
                        >
                          <Typography 
                            variant="subtitle1" 
                            component="div"
                            sx={{
                              transition: 'all 0.3s ease-in-out',
                              '&:hover': {
                                color: '#ff7f50'
                              }
                            }}
                          >
                            {item.dynasty} {item.year}年
                          </Typography>
                          <Typography 
                            variant="body1" 
                            color="text.secondary"
                            sx={{
                              transition: 'all 0.3s ease-in-out',
                              '&:hover': {
                                color: '#666'
                              }
                            }}
                          >
                            {item.event}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{
                              transition: 'all 0.3s ease-in-out',
                              '&:hover': {
                                color: '#666'
                              }
                            }}
                          >
                            装饰风格：{item.decoration} | 器型特点：{item.shape}
                          </Typography>
                        </Paper>
                      ))}
                    </div>
                  </EventsView>

                  {/* 导航按钮 */}
                  <IconButton
                    onClick={() => handleViewChange('left')}
                    sx={{
                      position: 'absolute',
                      left: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                      }
                    }}
                  >
                    <ChevronLeftIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleViewChange('right')}
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                      }
                    }}
                  >
                    <ChevronRightIcon />
                  </IconButton>
                </ChartContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TimelineContainer>
    </Box>
  );
};

export default Timeline; 