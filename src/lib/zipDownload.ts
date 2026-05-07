import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface ImageItem {
  /** Base64字符串或URL */
  data: string;
  filename: string;
  /** 是否是URL格式 */
  isUrl?: boolean;
}

/**
 * 打包多个图片为ZIP并下载
 * 支持 Base64 和 URL 两种格式
 */
export async function downloadImagesAsZip(
  images: ImageItem[],
  zipFilename: string = 'xuanlv-ai-images.zip'
): Promise<void> {
  const zip = new JSZip();
  
  for (const image of images) {
    try {
      let blob: Blob;
      
      if (image.isUrl) {
        // 从URL下载
        const response = await fetch(image.data);
        blob = await response.blob();
      } else {
        // Base64 转换
        const base64Data = image.data.replace(/^data:image\/\w+;base64,/, '');
        const binaryData = atob(base64Data);
        const array = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
          array[i] = binaryData.charCodeAt(i);
        }
        blob = new Blob([array], { type: 'image/png' });
      }
      
      zip.file(image.filename, blob);
    } catch (error) {
      console.error(`添加图片失败: ${image.filename}`, error);
    }
  }
  
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, zipFilename);
}
