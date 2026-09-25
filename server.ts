import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini API client on server
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for model name
const MODEL_TEXT = 'gemini-3.8-flash';
const MODEL_TTS = 'gemini-3.8-flash-lite-tts';

// 1. Summarization Endpoint
app.post('/api/summarize', async (req: Request, res: Response) => {
  try {
    const { content, style = 'executive', subject = 'General Notes' } = req.body;
    if (!content || typeof content !== 'string') {
      res.status(400).json({ error: 'Note content is required.' });
      return;
    }

    const styleInstructions: Record<string, string> = {
      executive: 'Provide a crisp executive summary with high-yield key takeaways, core concepts, and essential glossary terms.',
      outline: 'Structure as a comprehensive hierarchical study guide outline detailing main topics and sub-points.',
      examprep: 'Focus heavily on high-probability exam questions, core formulas, key dates, definitions, and common student mistakes to avoid.',
      eli5: 'Explain complex concepts simply using clear real-world analogies, straightforward language, and clear step-by-step logic.'
    };

    const prompt = `You are an expert academic tutor and study guide creator.
Analyze the following study notes for subject "${subject}".
${styleInstructions[style] || styleInstructions.executive}

Notes Content:
"""
${content}
"""`;

    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING, description: 'Catchy 1-sentence headline summary of the study notes.' },
            overview: { type: Type.STRING, description: 'Clear paragraph summarizing the primary theme.' },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '5 bullet points summarizing essential takeaways.'
            },
            keyConcepts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  importance: { type: Type.STRING, description: 'high, medium, or low' }
                },
                required: ['title', 'explanation', 'importance']
              }
            },
            glossary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                  example: { type: Type.STRING }
                },
                required: ['term', 'definition']
              }
            },
            reviewQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 study check questions.'
            },
            readingTimeMinutes: { type: Type.INTEGER, description: 'Estimated reading time in minutes.' }
          },
          required: ['headline', 'overview', 'keyTakeaways', 'keyConcepts', 'glossary', 'reviewQuestions', 'readingTimeMinutes']
        }
      }
    });

    const jsonText = response.text || '{}';
    const result = JSON.parse(jsonText);
    res.json({ success: true, summary: result });
  } catch (error: any) {
    console.error('Summarize error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate summary' });
  }
});

// 2. Quiz Generation Endpoint
app.post('/api/quiz', async (req: Request, res: Response) => {
  try {
    const { content, questionCount = 5, difficulty = 'Medium', subject = 'General Notes' } = req.body;
    if (!content) {
      res.status(400).json({ error: 'Content is required to generate quiz.' });
      return;
    }

    const prompt = `You are a university professor constructing a high-yield practice quiz for the subject "${subject}".
Difficulty: ${difficulty}.
Target Question Count: ${questionCount}.

Create a mix of Multiple Choice (4 options with 1 correct option), True/False (options: "True", "False"), and Short Answer questions testing key concepts in the notes.

Notes Content:
"""
${content}
"""`;

    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Title of the quiz' },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING, description: 'multiple-choice, true-false, or short-answer' },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Array of 4 options for multiple-choice, or ["True", "False"] for true-false.'
                  },
                  correctAnswer: { type: Type.STRING, description: 'Exact text matching the correct option or key answer.' },
                  explanation: { type: Type.STRING, description: 'In-depth explanation of why this answer is correct and why distractor options are wrong.' }
                },
                required: ['id', 'type', 'question', 'correctAnswer', 'explanation']
              }
            }
          },
          required: ['title', 'questions']
        }
      }
    });

    const jsonText = response.text || '{}';
    const quizData = JSON.parse(jsonText);
    res.json({ success: true, quiz: quizData });
  } catch (error: any) {
    console.error('Quiz error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate practice quiz' });
  }
});

// 3. Flashcards Extraction Endpoint
app.post('/api/flashcards', async (req: Request, res: Response) => {
  try {
    const { content, subject = 'General Notes' } = req.body;
    if (!content) {
      res.status(400).json({ error: 'Content is required.' });
      return;
    }

    const prompt = `Extract 6 to 10 high-value flashcard pairs (front term/question, back clear explanation) from the study notes for subject "${subject}".

Notes Content:
"""
${content}
"""`;

    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              front: { type: Type.STRING, description: 'Front of card (Term, concept name, or short prompt)' },
              back: { type: Type.STRING, description: 'Back of card (Clear concise definition or answer)' },
              hint: { type: Type.STRING, description: 'Optional helpful mnemonic or hint' }
            },
            required: ['id', 'front', 'back']
          }
        }
      }
    });

    const jsonText = response.text || '[]';
    const cards = JSON.parse(jsonText);
    res.json({ success: true, flashcards: cards });
  } catch (error: any) {
    console.error('Flashcards error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate flashcards' });
  }
});

// 4. Mind Map Generation Endpoint
app.post('/api/mindmap', async (req: Request, res: Response) => {
  try {
    const { content, title = 'Study Topic' } = req.body;
    if (!content) {
      res.status(400).json({ error: 'Content is required.' });
      return;
    }

    const prompt = `Generate a hierarchical mind map structure for the topic "${title}" based on these notes. Return a single root node with 3 to 5 main branch children, each having 2 to 3 sub-children.

Notes Content:
"""
${content}
"""`;

    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            label: { type: Type.STRING, description: 'Main topic name' },
            description: { type: Type.STRING },
            children: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  description: { type: Type.STRING },
                  children: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        label: { type: Type.STRING },
                        description: { type: Type.STRING }
                      },
                      required: ['id', 'label']
                    }
                  }
                },
                required: ['id', 'label']
              }
            }
          },
          required: ['id', 'label']
        }
      }
    });

    const jsonText = response.text || '{}';
    const mindMap = JSON.parse(jsonText);
    res.json({ success: true, mindMap });
  } catch (error: any) {
    console.error('MindMap error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate mind map' });
  }
});

// 5. AI Study Tutor Chat Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, noteContent, history = [] } = req.body;
    if (!message) {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }

    const systemInstruction = `You are StudyMind AI, a friendly, encouraging, and highly intelligent AI study partner and university tutor.
Answer student questions directly using the student's study notes provided below as primary context.
Provide clear formatting with bullet points, bold key terms, and short examples when helpful.

Note Context:
"""
${noteContent || 'No active note open.'}
"""`;

    const chatContents = history.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    chatContents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: chatContents,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    res.json({ success: true, reply: response.text });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Failed to process AI tutor request' });
  }
});

// 6. Text-To-Speech Audio Synthesis Endpoint
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) {
      res.status(400).json({ error: 'Text is required for TTS.' });
      return;
    }

    const response = await ai.models.generateContent({
      model: MODEL_TTS,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 1000), // Limit length for speed
              speechMetadata: { style: 'Encouraging academic narrator, clear and articulate' }
            }
          ]
        }
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      res.json({ success: true, audioBase64: base64Audio, mimeType: 'audio/mp3' });
    } else {
      res.json({ success: false, error: 'No audio generated' });
    }
  } catch (error: any) {
    console.error('TTS error:', error);
    res.status(500).json({ error: error.message || 'TTS generation error' });
  }
});

// Setup Vite Dev Middlewares in development mode
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = await import('fs').then((fs) => fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8'));
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
