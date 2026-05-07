import OpenAI from 'openai';
import prisma from './db';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// ============================================
// OpenAI Client Configuration (kuaipao.ai)
// ============================================
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder',
  baseURL: process.env.OPENAI_BASE_URL || 'https://kuaipao.ai/v1',
});

// ============================================
// Type Definitions
// ============================================

export interface GenerateComicParams {
  copywriting: string;
  imageCount: number;
  size?: string;
  quality?: string;
  outputFormat?: 'png' | 'jpeg' | 'webp';
}

export interface GenerateCustomImageParams {
  prompt: string;
  count?: number;
  size?: string;
  quality?: string;
  outputFormat?: 'png' | 'jpeg' | 'webp';
}

// ============================================
// Constants
// ============================================

const DEFAULT_IMAGE_MODEL = process.env.DALL_E_MODEL || 'gpt-image-2';
const DEFAULT_QUALITY = 'high';
const GENERATED_IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'generated');

// ============================================
// 内置漫画生成提示词模板
// ============================================

const COMIC_SYSTEM_PROMPT = `你是一个专业的新媒体漫画分镜师。你的任务是将用户提供的文案内容均匀分配到指定数量的漫画图片中，并为每张图片生成详细的绘画提示词。

要求：
1. 将文案的每一个字都分配到各张图片中，一字不落
2. 每张图片的文案量大致相等
3. 为每张图片生成符合漫画风格的绘画提示词

你的输出必须是有效的JSON格式：
{
  "panels": [
    {
      "index": 1,
      "text": "分配到这张图的文案内容",
      "prompt": "这张图的绘画提示词（英文）"
    }
  ]
}`;

export const COMIC_STYLE_PROMPT = `极简黑白手绘条漫，单格漫画形式，纯白背景，粗黑马克笔线条，无渐变无纹理无多余装饰。人物为简化动作和表情夸张的火柴人形象（每个人物都要有自己名称的备注，可以生成到人物的脸上），带有简单男、女发型和夸张表情（比如皱眉、撇嘴、瞪眼睛、思考、难过、开心、愤怒、生气等等），按文案需求生成，用极简线条传递情绪。对话气泡和文字用简洁字体呈现，整体风格像随笔涂鸦，轻松吐槽风，画面干净，重点突出人物和情绪，高对比度。一定要以发型来区别男女，发型可以画得稍微抽象一些。`;

// ============================================
// Helper Functions
// ============================================

function ensureGeneratedImagesDir(): void {
  if (!fs.existsSync(GENERATED_IMAGES_DIR)) {
    fs.mkdirSync(GENERATED_IMAGES_DIR, { recursive: true });
  }
}

function generateRandomFilename(ext: string = 'png'): string {
  const timestamp = Date.now();
  const randomHex = crypto.randomBytes(8).toString('hex');
  return `${timestamp}_${randomHex}.${ext}`;
}

export function saveBase64Image(base64Data: string, filename?: string): string {
  ensureGeneratedImagesDir();
  const ext = 'png';
  const finalFilename = filename || generateRandomFilename(ext);
  const filepath = path.join(GENERATED_IMAGES_DIR, finalFilename);
  fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));
  return `/images/generated/${finalFilename}`;
}

// ============================================
// Core AI Functions
// ============================================

/**
 * 使用GPT-4o将文案分割为漫画分镜
 */
async function splitCopywritingToPanels(
  copywriting: string,
  imageCount: number
): Promise<Array<{ index: number; text: string; prompt: string }>> {
  // Check if API key is configured
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'placeholder') {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const response = await openaiClient.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o',
    messages: [
      { role: 'system', content: COMIC_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `请将以下文案均匀分配到${imageCount}张漫画图片中，并为每张图生成绘画提示词。\n\n文案内容：\n${copywriting}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 4000,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content || '{}';
  const parsed = JSON.parse(content);

  if (!parsed.panels || !Array.isArray(parsed.panels)) {
    throw new Error('文案分镜解析失败');
  }

  return parsed.panels.map((panel: any, idx: number) => ({
    index: idx + 1,
    text: panel.text || '',
    prompt: panel.prompt || '',
  }));
}

/**
 * 生成单张图片（核心函数）
 */
export async function generateSingleImage(params: {
  prompt: string;
  size?: string;
  quality?: string;
  outputFormat?: 'png' | 'jpeg' | 'webp';
}): Promise<{
  b64_json?: string;
  url?: string;
  revisedPrompt: string;
  localPath?: string;
}> {
  // Check if API key is configured
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'placeholder') {
    throw new Error('OPENAI_API_KEY not configured');
  }

  try {
    const response = await openaiClient.images.generate({
      model: DEFAULT_IMAGE_MODEL,
      prompt: params.prompt,
      n: 1,
      size: (params.size || '1024x1536') as any,
      quality: (params.quality || DEFAULT_QUALITY) as any,
      response_format: 'b64_json',
    } as any);

    const imageData = response.data?.[0];
    if (!imageData) {
      throw new Error('Image generation returned no data');
    }
    const result: { b64_json?: string; url?: string; revisedPrompt: string; localPath?: string } = {
      revisedPrompt: (imageData as any).revised_prompt || '',
    };

    if ((imageData as any).b64_json) {
      result.b64_json = (imageData as any).b64_json;
      const ext = params.outputFormat || 'png';
      const filename = generateRandomFilename(ext);
      result.localPath = saveBase64Image(result.b64_json!, filename);
      console.log(`[AI] Image saved to ${result.localPath}`);
    }

    if (!result.localPath && (imageData as any).url) {
      result.url = (imageData as any).url;
      console.log(`[AI] Image URL received: ${result.url}`);
    }

    return result;
  } catch (error: any) {
    console.error('[AI] Image generation error:', error?.message || error);

    // Retry without response_format if b64_json is not supported
    if (error?.message?.includes('response_format') || error?.status === 400) {
      console.log('[AI] Retrying image generation without response_format...');
      const response = await openaiClient.images.generate({
        model: DEFAULT_IMAGE_MODEL,
        prompt: params.prompt,
        n: 1,
        size: (params.size || '1024x1536') as any,
        quality: (params.quality || DEFAULT_QUALITY) as any,
      });

      const imageData = response.data?.[0];
      if (!imageData) {
        throw new Error('Image generation returned no data');
      }
      const result: { b64_json?: string; url?: string; revisedPrompt: string; localPath?: string } = {
        revisedPrompt: (imageData as any).revised_prompt || '',
      };

      if ((imageData as any).b64_json) {
        result.b64_json = (imageData as any).b64_json;
        const ext = params.outputFormat || 'png';
        const filename = generateRandomFilename(ext);
        result.localPath = saveBase64Image(result.b64_json!, filename);
      } else if ((imageData as any).url) {
        result.url = (imageData as any).url;
      }

      return result;
    }

    throw error;
  }
}

/**
 * 漫画生成 - 将文案分割为多张漫画图
 */
export async function generateComic(params: GenerateComicParams): Promise<{
  panels: Array<{
    index: number;
    text: string;
    imageUrl: string;
    localPath?: string;
    prompt: string;
  }>;
}> {
  const imageCount = params.imageCount || 10;
  const size = params.size || '1024x1536'; // 3:4 竖屏
  const quality = params.quality || DEFAULT_QUALITY;
  const outputFormat = params.outputFormat || 'png';

  // Step 1: 使用GPT-4o分割文案为分镜
  const panels = await splitCopywritingToPanels(params.copywriting, imageCount);

  // Step 2: 逐张生成漫画图片
  const results = [];
  for (const panel of panels) {
    const fullPrompt = `${COMIC_STYLE_PROMPT}\n\n画面内容：${panel.text}\n\n具体要求：在画面中包含以下文案内容，用对话气泡或旁白框呈现："${panel.text}"`;

    try {
      const imageResult = await generateSingleImage({
        prompt: fullPrompt,
        size,
        quality,
        outputFormat,
      });

      results.push({
        index: panel.index,
        text: panel.text,
        imageUrl: imageResult.localPath || imageResult.url || '',
        localPath: imageResult.localPath,
        prompt: panel.prompt,
      });
    } catch (error) {
      console.error(`[AI] Failed to generate comic panel ${panel.index}:`, error);
      results.push({
        index: panel.index,
        text: panel.text,
        imageUrl: '',
        prompt: panel.prompt,
      });
    }
  }

  return { panels: results };
}

/**
 * 自定义图片生成 - 支持批量生成
 */
export async function generateCustomImages(params: GenerateCustomImageParams): Promise<{
  images: Array<{
    imageUrl: string;
    localPath?: string;
    revisedPrompt: string;
  }>;
}> {
  const count = Math.min(params.count || 1, 10); // 最多10张
  const size = params.size || '1024x1024';
  const quality = params.quality || DEFAULT_QUALITY;
  const outputFormat = params.outputFormat || 'png';

  const images = [];
  for (let i = 0; i < count; i++) {
    try {
      const result = await generateSingleImage({
        prompt: params.prompt,
        size,
        quality,
        outputFormat,
      });

      images.push({
        imageUrl: result.localPath || result.url || '',
        localPath: result.localPath,
        revisedPrompt: result.revisedPrompt,
      });
    } catch (error) {
      console.error(`[AI] Failed to generate custom image ${i + 1}:`, error);
    }
  }

  return { images };
}

/**
 * 记录生成日志
 */
export async function logGeneration(params: {
  userId: string;
  type: 'COMIC' | 'CUSTOM_IMAGE';
  input: string;
  output: string;
  imageUrl?: string;
  tokensUsed?: number;
}): Promise<void> {
  try {
    await prisma.generationLog.create({
      data: {
        userId: params.userId,
        type: params.type,
        input: params.input,
        output: params.output,
        imageUrl: params.imageUrl,
        tokensUsed: params.tokensUsed || 0,
      },
    });
  } catch (error) {
    console.error('[AI] Failed to log generation event:', error);
  }
}
