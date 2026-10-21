export const CAT_LABELS: Record<string, string> = {
  motion: '动效',
  explainer: '讲解',
  '3d': '3D 场景',
  interactive: '游戏互动',
};

export const TECH_LABELS: Record<string, string> = {
  canvas: 'Canvas', svg: 'SVG', threejs: 'Three.js', shader: 'Shader',
  gsap: 'GSAP', css: 'CSS', audio: '音频', playable: '可玩',
  particles: '粒子', pixel: '像素', webgl: 'WebGL', physics: '物理',
  'ai-image': 'AI 图片',
};

export const STATUS_LABELS = {
  pick: '备选',
  posted: '已发',
  skip: '跳过',
} as const;
