import { createWorker } from 'tesseract.js';

export async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  const worker = await createWorker('eng+hin');
  
  try {
    const { data: { text } } = await worker.recognize(imageBuffer);
    
    await worker.terminate();
    
    return text.trim();
  } catch (error) {
    console.error('OCR processing error:', error);
    throw new Error('Failed to extract text from image. Please try with a clearer image.');
  }
}
