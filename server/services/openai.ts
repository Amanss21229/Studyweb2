import { InferenceClient } from "@huggingface/inference";

if (!process.env.HUGGINGFACE_API_KEY) {
  console.warn('⚠️  HUGGINGFACE_API_KEY not found! AI features will not work.');
  console.warn('   Please add HUGGINGFACE_API_KEY to your environment variables.');
  console.warn('   Get your key from: https://huggingface.co/settings/tokens');
}

const hf = new InferenceClient(process.env.HUGGINGFACE_API_KEY);

interface AIResponse {
  answer: string;
  subject: string;
  chapter: string;
  topic: string;
  neetJeePyq?: {
    neet?: string[];
    jee?: string[];
  };
  isConversational?: boolean;
}

export async function generateSolution(
  question: string, 
  language: string = 'english',
  userName?: string
): Promise<AIResponse> {
  if (!process.env.HUGGINGFACE_API_KEY) {
    throw new Error('HuggingFace API key not configured. Please add HUGGINGFACE_API_KEY to environment variables.');
  }

  try {
    // Detect if this is a conversational query
    const isConversational = isConversationalQuery(question);
    
    const systemPrompt = isConversational 
      ? getConversationalPrompt(language, userName)
      : getAcademicPrompt(language);

    const response = await hf.chatCompletion({
      model: "meta-llama/Llama-3.1-8B-Instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      max_tokens: 2048,
      temperature: isConversational ? 0.8 : 0.7,
    });

    const content = response.choices[0].message.content || "";
    
    // Try to extract JSON from the response
    let result: AIResponse;
    try {
      // First try to parse as direct JSON
      result = JSON.parse(content);
    } catch {
      // If that fails, try to extract JSON from markdown code blocks or text
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || 
                       content.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[1]);
      } else {
        // Fallback: create a structured response from the text
        result = {
          answer: content,
          subject: isConversational ? "conversation" : "general",
          chapter: isConversational ? "Friendly Chat" : "General Concepts",
          topic: isConversational ? "Personal Interaction" : "Academic Discussion",
          isConversational: isConversational
        };
      }
    }

    result.isConversational = isConversational;
    return result as AIResponse;
  } catch (error) {
    console.error('Hugging Face API error:', error);
    throw new Error('Failed to generate solution. Please try again.');
  }
}

function isConversationalQuery(question: string): boolean {
  const lowerQ = question.toLowerCase();
  
  // Conversational patterns
  const conversationalKeywords = [
    // Greetings
    'hello', 'hi', 'hey', 'namaste', 'namaskar', 'good morning', 'good evening',
    // About website/creator
    'aimai', 'aim ai', 'aman', 'who made', 'who created', 'who developed', 'about you', 'your name',
    'about this website', 'about this app', 'your features', 'what can you do',
    // Personal
    'how are you', 'kaise ho', 'kya haal', 'kaisa chal raha', 'feeling',
    // Study motivation
    'motivated', 'inspire', 'encourage', 'tired', 'boring', 'difficult',
    'how to study', 'study tips', 'exam tips', 'nervousness', 'stress',
    // Friendly chat
    'tell me a joke', 'make me laugh', 'funny', 'friend', 'lonely',
    'introduce yourself', 'tell me about'
  ];

  // Check if query contains conversational keywords
  const hasConversationalKeywords = conversationalKeywords.some(keyword => 
    lowerQ.includes(keyword)
  );

  // Short queries are likely conversational
  const isShortQuery = question.split(' ').length < 8 && !question.includes('?');

  // Avoid false positives for academic questions
  const academicKeywords = ['solve', 'calculate', 'explain the concept', 'derive', 'proof', 
    'formula', 'equation', 'reaction', 'mechanism', 'structure', 'diagram'];
  const isAcademic = academicKeywords.some(keyword => lowerQ.includes(keyword));

  return (hasConversationalKeywords || isShortQuery) && !isAcademic;
}

function getConversationalPrompt(language: string, userName?: string): string {
  const nameGreeting = userName ? `The user's name is ${userName}. Always use their name when chatting to make it personal and friendly.` : '';
  
  return `You are AimAi, a friendly and motivating AI tutor created by Aman (a talented student). You help NEET & JEE students with their studies.

PERSONALITY & STYLE:
- Be warm, friendly, and encouraging
- Use casual, relatable language (not too formal)
- Add light humor and jokes when appropriate
- Be genuinely interested in the student's well-being
- Show empathy and understanding
- ${nameGreeting}

WHAT YOU CAN TALK ABOUT:
1. Introduction & Greetings: Respond warmly to hi/hello
2. About yourself: 
   - Your name is AimAi (powered by Sansa Learn)
   - You were created by Aman, a brilliant student who wanted to help fellow aspirants
   - Praise Aman's vision and dedication
   - Your features: text, image, and voice input support; multi-language; NCERT-focused
3. Study motivation: Encourage students, share study tips, help with stress
4. Personal check-ins: Ask how their preparation is going, listen to their concerns
5. Light friendly chat: Be supportive, crack age-appropriate jokes, be like a study buddy

CONVERSATION GUIDELINES:
- Keep responses concise (3-4 sentences max)
- Always steer conversation back to studies naturally
- Use emojis occasionally to be friendly 😊
- Motivate and inspire confidence
- If asked about name, remember it and use it in future responses
- Light, age-appropriate friendly conversation is okay
- Be respectful and supportive always

STRICT BOUNDARIES (Politely redirect):
- No politics, controversy, or sensitive topics
- No inappropriate content (abuse, adult content, violence, self-harm)
- If asked about these, say: "Hey, let's keep our focus on your studies! How's your NEET/JEE prep going? 📚"

RESPONSE FORMAT:
Respond ONLY in ${language} language.
Always return JSON format:
{
  "answer": "your friendly conversational response",
  "subject": "conversation",
  "chapter": "Friendly Chat",
  "topic": "Personal Interaction"
}

Remember: Be the supportive study buddy every NEET/JEE student needs! 🌟`;
}

function getAcademicPrompt(language: string): string {
  return `You are AimAi, an expert NEET & JEE tutor for Physics, Chemistry, Mathematics, and Biology (NCERT syllabus only). 

Your role:
- Act as a patient, friendly tutor
- Answer only NEET & JEE-related academic questions
- Always respond in ${language} language
- Provide step-by-step solutions with clear explanations
- Include motivational comments to encourage students
- Map questions to NCERT subject, chapter, and topic
- Include NEET/JEE PYQ references when applicable
- Use simple language and relatable examples

Respond with JSON in this format:
{
  "answer": "detailed step-by-step solution with explanation and encouragement",
  "subject": "physics/chemistry/math/biology",
  "chapter": "NCERT chapter name",
  "topic": "specific topic within chapter",
  "neetJeePyq": {
    "neet": ["year references if applicable"],
    "jee": ["year references if applicable"]
  }
}

If the question is not NEET/JEE related, politely decline and suggest focusing on NCERT syllabus topics.
Always encourage the student and make them feel capable! 💪`;
}

export async function generateConversationTitle(question: string): Promise<string> {
  try {
    const response = await hf.chatCompletion({
      model: "meta-llama/Llama-3.1-8B-Instruct",
      messages: [
        {
          role: "system",
          content: "Generate a short, descriptive title (max 50 characters) for this academic question or conversation. Focus on the main concept or topic. Respond with only the title, no extra text."
        },
        { role: "user", content: question }
      ],
      max_tokens: 50,
      temperature: 0.5,
    });

    const title = response.choices[0].message.content?.trim() || "Academic Discussion";
    return title;
  } catch (error) {
    console.error('Error generating title:', error);
    return "Academic Discussion";
  }
}
