import { NoteSummary, Quiz, Flashcard, MindMapNode, SubjectCategory, SummaryStyle } from '../types/study';

export async function generateSummaryApi(
  content: string,
  style: SummaryStyle = 'executive',
  subject: SubjectCategory = 'General Notes'
): Promise<NoteSummary> {
  const res = await fetch('/api/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, style, subject }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error: ${res.status}`);
  }

  const data = await res.json();
  return data.summary;
}

export async function generateQuizApi(
  content: string,
  questionCount: number = 5,
  difficulty: string = 'Medium',
  subject: SubjectCategory = 'General Notes'
): Promise<Quiz> {
  const res = await fetch('/api/quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, questionCount, difficulty, subject }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error: ${res.status}`);
  }

  const data = await res.json();
  return data.quiz;
}

export async function generateFlashcardsApi(
  content: string,
  subject: SubjectCategory = 'General Notes'
): Promise<Flashcard[]> {
  const res = await fetch('/api/flashcards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, subject }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error: ${res.status}`);
  }

  const data = await res.json();
  return data.flashcards;
}

export async function generateMindMapApi(
  content: string,
  title: string
): Promise<MindMapNode> {
  const res = await fetch('/api/mindmap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, title }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error: ${res.status}`);
  }

  const data = await res.json();
  return data.mindMap;
}

export async function sendChatApi(
  message: string,
  noteContent: string,
  history: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, noteContent, history }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error: ${res.status}`);
  }

  const data = await res.json();
  return data.reply;
}

export async function generateTTSApi(text: string): Promise<string | null> {
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.audioBase64 || null;
  } catch (err) {
    console.warn('TTS API unavailable:', err);
    return null;
  }
}
