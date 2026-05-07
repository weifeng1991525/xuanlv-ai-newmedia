/**
 * 旋律新媒体AI伙伴 - 图片生成API客户端
 * 支持 gpt-image-2-pro 模型
 */

// API配置
const API_CONFIG = {
  baseURL: 'https://kuaipao.ai/v1',
  apiKey: 'sk-qoI12lAhUo1zCdfJYOan48pfh57mQ4CyDlsXKwjdSZRTu18K',
  model: 'gpt-image-2-pro',
};

// 类型定义
export interface ImageGenerationParams {
  prompt: string;
  size?: string;
  quality?: 'low' | 'medium' | 'high' | 'auto';
  n?: number;
  outputFormat?: 'png' | 'jpeg' | 'webp';
  outputCompression?: number;
  background?: 'auto' | 'opaque' | 'transparent';
  moderation?: 'auto' | 'low';
}

export interface ImageResult {
  b64_json?: string;
  url?: string;
  revisedPrompt?: string;
}

export interface GenerationResponse {
  created: number;
  data: ImageResult[];
  usage?: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
}

/**
 * 解析API响应，兼容 b64_json 和 url 两种格式
 */
function parseImageResult(result: ImageResult): { imageData: string; type: 'base64' | 'url' } {
  if (result.b64_json) {
    return { imageData: result.b64_json, type: 'base64' };
  }
  if (result.url) {
    return { imageData: result.url, type: 'url' };
  }
  throw new Error('API返回格式异常：未找到图片数据');
}

/**
 * 生成单张图片
 */
export async function generateImage(params: ImageGenerationParams): Promise<ImageResult> {
  const {
    prompt,
    size = '1024x1024',
    quality = 'high',
    n = 1,
    outputFormat = 'png',
    background = 'auto',
    moderation = 'auto',
  } = params;

  const response = await fetch(`${API_CONFIG.baseURL}/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_CONFIG.apiKey}`,
    },
    body: JSON.stringify({
      model: API_CONFIG.model,
      prompt,
      size,
      quality,
      n,
      output_format: outputFormat,
      background,
      moderation,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `API请求失败: ${response.status}`);
  }

  const data: GenerationResponse = await response.json();
  
  if (!data.data || data.data.length === 0) {
    throw new Error('未返回图片数据');
  }

  return data.data[0];
}

/**
 * 批量生成图片
 */
export async function generateImages(params: ImageGenerationParams): Promise<ImageResult[]> {
  const {
    prompt,
    size = '1024x1024',
    quality = 'high',
    n = 1,
    outputFormat = 'png',
    background = 'auto',
    moderation = 'auto',
  } = params;

  const response = await fetch(`${API_CONFIG.baseURL}/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_CONFIG.apiKey}`,
    },
    body: JSON.stringify({
      model: API_CONFIG.model,
      prompt,
      size,
      quality,
      n: Math.min(n, 10),
      output_format: outputFormat,
      background,
      moderation,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `API请求失败: ${response.status}`);
  }

  const data: GenerationResponse = await response.json();
  
  if (!data.data || data.data.length === 0) {
    throw new Error('未返回图片数据');
  }

  return data.data;
}

/**
 * Base64转Blob URL
 */
export function base64ToBlobUrl(base64: string, mimeType: string = 'image/png'): string {
  try {
    // 处理可能的数据URI前缀
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    return URL.createObjectURL(blob);
  } catch (e) {
    console.error('Base64转换失败:', e);
    return '';
  }
}

/**
 * 从URL获取图片并转为Blob URL
 */
export async function urlToBlobUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (e) {
    console.error('URL转Blob失败:', e);
    return '';
  }
}

/**
 * 下载Base64图片
 */
export function downloadBase64Image(base64: string, filename: string = 'image.png'): void {
  const link = document.createElement('a');
  link.href = `data:image/png;base64,${base64}`;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 从URL下载图片
 */
export function downloadUrlImage(url: string, filename: string = 'image.png'): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 漫画风格提示词
 */
export const COMIC_STYLE_PROMPT = `极简黑白手绘条漫，单格漫画形式，纯白背景，粗黑马克笔线条，无渐变无纹理无多余装饰。人物为简化动作和表情夸张的火柴人形象（每个人物都要有自己名称的备注，可以生成到人物的脸上），带有简单男、女发型和夸张表情（比如皱眉、撇嘴、瞪眼睛、思考、难过、开心、愤怒、生气等等），按文案需求生成，用极简线条传递情绪。对话气泡和文字用简洁字体呈现，整体风格像随笔涂鸦，轻松吐槽风，画面干净，重点突出人物和情绪，高对比度。一定要以发型来区别男女，发型可以画得稍微抽象一些。`;

/**
 * 生成漫画图片
 */
export async function generateComicImage(
  text: string,
  options: {
    size?: string;
    quality?: 'low' | 'medium' | 'high' | 'auto';
  } = {}
): Promise<ImageResult> {
  const fullPrompt = `${COMIC_STYLE_PROMPT}\n\n画面内容：${text}\n\n具体要求：在画面中包含以下文案内容，用对话气泡或旁白框呈现："${text}"`;
  
  return generateImage({
    prompt: fullPrompt,
    size: options.size || '1024x1536',
    quality: options.quality || 'high',
    outputFormat: 'png',
  });
}

/**
 * 尺寸选项
 */
export const SIZE_OPTIONS = [
  { value: '1024x1024', label: '1:1 正方形 (1024x1024)' },
  { value: '1536x1024', label: '3:2 横屏 (1536x1024)' },
  { value: '1024x1536', label: '2:3 竖屏 (1024x1536)' },
  { value: '1792x1024', label: '16:9 横屏 (1792x1024)' },
  { value: '1024x1792', label: '9:16 竖屏 (1024x1792)' },
  { value: '2048x2048', label: '1:1 高清 (2048x2048)' },
  { value: '2048x1152', label: '16:9 高清 (2048x1152)' },
  { value: '3840x2160', label: '4K 横屏 (3840x2160)' },
  { value: '2160x3840', label: '4K 竖屏 (2160x3840)' },
];

/**
 * 质量选项
 */
export const QUALITY_OPTIONS = [
  { value: 'low', label: '草稿质量 (快速)' },
  { value: 'medium', label: '标准质量' },
  { value: 'high', label: '高清质量 (推荐)' },
  { value: 'auto', label: '自动' },
];

/**
 * 格式选项
 */
export const FORMAT_OPTIONS = [
  { value: 'png', label: 'PNG (无损)' },
  { value: 'jpeg', label: 'JPEG (压缩)' },
  { value: 'webp', label: 'WebP (网页优化)' },
];
