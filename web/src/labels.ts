import type { Lang } from './i18n';
import type { OpsStatus } from './types';

const CATS: Record<string, [string, string]> = {
  motion: ['动效', 'Motion'],
  explainer: ['讲解', 'Explainer'],
  '3d': ['3D 场景', '3D scene'],
  interactive: ['游戏互动', 'Interactive'],
};
export const catLabel = (c: string, l: Lang) => CATS[c]?.[l === 'en' ? 1 : 0] || c;

const TECHS: Record<string, [string, string]> = {
  canvas: ['Canvas', 'Canvas'],
  svg: ['SVG', 'SVG'],
  threejs: ['Three.js', 'Three.js'],
  shader: ['Shader', 'Shader'],
  gsap: ['GSAP', 'GSAP'],
  css: ['CSS', 'CSS'],
  audio: ['音频', 'Audio'],
  playable: ['可玩', 'Playable'],
  particles: ['粒子', 'Particles'],
  pixel: ['像素', 'Pixel'],
  webgl: ['WebGL', 'WebGL'],
  physics: ['物理', 'Physics'],
  'ai-image': ['AI 图片', 'AI image'],
};
export const techLabel = (t: string, l: Lang) => TECHS[t]?.[l === 'en' ? 1 : 0] || t;

const STATUS: Record<OpsStatus, [string, string]> = {
  pick: ['备选', 'Pick'],
  posted: ['已发', 'Posted'],
  skip: ['跳过', 'Skipped'],
};
export const statusLabel = (s: OpsStatus, l: Lang) => STATUS[s][l === 'en' ? 1 : 0];
