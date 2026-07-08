import React, { Suspense, useEffect, useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useProgress, Html, useGLTF } from '@react-three/drei';
import { Alert, Box, LinearProgress } from '@mui/material';
import * as THREE from 'three';
import { styled } from '@mui/material/styles';

const ViewerContainer = styled('div')({
  width: '100%',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '8px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  margin: 0,
  padding: 0
});

const LoaderContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  padding: '16px',
  backgroundColor: 'rgba(255,255,255,0.8)',
  borderRadius: '4px'
});

// 创建光源组件
function LightRig() {
  // 创建一个随机移动的点光源
  const pointLight = useRef<THREE.PointLight>(null);
  
  useFrame(({ clock }) => {
    if (pointLight.current) {
      // 让点光源随时间轻微移动，模拟自然光变化
      const t = clock.getElapsedTime() * 0.5;
      pointLight.current.position.x = Math.sin(t) * 3;
      pointLight.current.position.z = Math.cos(t) * 3;
    }
  });

  return (
    <>
      {/* 环境光 - 提供均匀的基础照明 */}
      <ambientLight intensity={1.0} color="#ffffff" />
      
      {/* 主平行光 - 模拟主光源方向光 */}
      <directionalLight 
        position={[1, 1, 0.5]} 
        intensity={1.5} 
        color="#ffffff"
        castShadow 
      />
      
      {/* 补光 - 填充阴影部分 */}
      <directionalLight 
        position={[-1, 0.5, -0.5]} 
        intensity={0.7} 
        color="#e0e8ff"
      />
      
      {/* 顶部补光 */}
      <directionalLight
        position={[0, 1, 0]}
        intensity={0.8}
        color="#f0f0ff"
      />
      
      {/* 点光源 - 用于强调釉面高光 */}
      <pointLight
        ref={pointLight}
        position={[1.5, 2, 1.5]}
        intensity={0.8}
        color="#ffffff"
        distance={10}
        decay={2}
      />
    </>
  );
}

// 创建模型缓存
const modelCache = new Map();

// 预加载所有模型
const preloadAllModels = () => {
  const models = [
    '/modules/wucai.glb',
    '/modules/jiutaotu.glb',
    '/modules/huamulan.glb',
    '/modules/gucai.glb',
    '/modules/fencai.glb',
    '/modules/perfume_bottle_with_floral_ornamentation.glb',
    '/modules/dragon.glb',
    '/modules/vessel_for_potpourri.glb',
    '/modules/porcelain_china_vase.glb',
    '/modules/knife_dagger.glb',
    '/modules/tea_set.glb'
  ];

  models.forEach(modelPath => {
    useGLTF.preload(modelPath);
  });
};

function Model({ url }: { url: string }) {
  const [modelError, setModelError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const modelRef = useRef<THREE.Group>(null);

  // 使用useMemo缓存模型加载
  const { scene } = useGLTF(url);

  useEffect(() => {
    // 预加载模型并检查可访问性
    if (!modelCache.has(url)) {
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`模型文件无法访问: ${response.statusText}`);
          }
          // 缓存模型
          modelCache.set(url, true);
        })
        .catch(error => {
          console.error('模型加载错误:', error);
          setModelError(error.message);
        });
    }
  }, [url]);

  // 添加轻微旋转动画
  useFrame(({ clock }) => {
    if (modelRef.current) {
      // 非常轻微的自动旋转，增强立体感
      modelRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.1) * 0.05;
    }
  });

  if (modelError) {
    return (
      <Html center>
        <Alert severity="error" sx={{ width: '300px' }}>
          {modelError}
        </Alert>
      </Html>
    );
  }

  // 克隆场景以避免多个组件共享同一个实例
  const clonedScene = scene.clone();
  
  // 调整模型位置和旋转
  clonedScene.position.set(0, -0.2, 0);
  clonedScene.rotation.set(0, Math.PI / 2, 0);

  // 自动调整模型大小
  const box = new THREE.Box3().setFromObject(clonedScene);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 3.5 / maxDim;
  clonedScene.scale.setScalar(scale);

  // 增强材质 - 为陶瓷模型的所有材质添加釉面效果
  clonedScene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach(mat => {
          if (mat instanceof THREE.MeshStandardMaterial) {
            mat.roughness = 0.2;
            mat.metalness = 0.1;
            mat.envMapIntensity = 1.5;
          }
        });
      } else if (child.material instanceof THREE.MeshStandardMaterial) {
        child.material.roughness = 0.2;
        child.material.metalness = 0.1;
        child.material.envMapIntensity = 1.5;
      }
    }
  });

  return <primitive ref={modelRef} object={clonedScene} />;
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <LoaderContainer>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ 
            width: '200px',
            height: '8px',
            borderRadius: '4px',
            backgroundColor: 'rgba(26, 75, 140, 0.1)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#1a4b8c'
            }
          }} 
        />
        <div style={{ marginTop: '8px', color: '#1a4b8c' }}>
          加载中... {Math.round(progress)}%
        </div>
      </LoaderContainer>
    </Html>
  );
}

interface Ceramic3DViewerProps {
  modelPath: string;
}

const Ceramic3DViewer: React.FC<Ceramic3DViewerProps> = ({ modelPath }) => {
  // 添加模型预加载
  useEffect(() => {
    if (modelPath) {
      // 预加载当前模型
      useGLTF.preload(modelPath);
    }
  }, [modelPath]);

  if (!modelPath) {
    return (
      <Alert severity="error">
        未提供模型路径
      </Alert>
    );
  }

  if (!modelPath.endsWith('.glb')) {
    return (
      <Alert severity="error">
        无效的模型文件格式，请使用.glb文件
      </Alert>
    );
  }

  return (
    <ViewerContainer>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 35 }}
        style={{ 
          background: 'linear-gradient(135deg, #e8f4f8 0%, #a7c0cd 100%)',
          width: '100%',
          height: '100%'
        }}
        shadows
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        <LightRig />
        
        <Suspense fallback={<Loader />}>
          <Model url={modelPath} />
        </Suspense>
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={true} 
          enableRotate={true}
          minDistance={3}
          maxDistance={15}
          autoRotate={true}
          autoRotateSpeed={0.4}
          rotateSpeed={0.8}
          target={[0, 0, 0]}
          makeDefault
        />
      </Canvas>
    </ViewerContainer>
  );
};

// 预加载所有模型
preloadAllModels();

export default Ceramic3DViewer; 