import { apiRequest } from "./queryClient";

export interface ConversationMessage {
  id: string;
  type: 'question' | 'solution';
  text: string;
  inputType?: 'text' | 'image' | 'audio';
  subject?: string;
  chapter?: string;
  topic?: string;
  shareUrl?: string;
  imageUrl?: string;
  audioUrl?: string;
  explanation?: string;
  neetJeePyq?: {
    neet?: string[];
    jee?: string[];
  };
  createdAt: string;
}

export async function createConversation(userId?: string, title?: string) {
  const response = await apiRequest('POST', '/api/conversations', {
    userId,
    title
  });
  return response.json();
}

export async function submitTextQuestion(conversationId: string, questionText: string, language: string) {
  const response = await apiRequest('POST', '/api/questions/text', {
    conversationId,
    questionText,
    language
  });
  return response.json();
}

export async function submitImageQuestion(conversationId: string, imageFile: File, language: string) {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('conversationId', conversationId);
  formData.append('language', language);

  const response = await fetch('/api/questions/image', {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || response.statusText);
  }

  return response.json();
}

export async function getSolution(shareUrl: string) {
  const response = await apiRequest('GET', `/api/solutions/${shareUrl}`);
  return response.json();
}
