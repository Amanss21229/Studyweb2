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
    // Greetings & Basic Chat
    'hello', 'hi', 'hey', 'namaste', 'namaskar', 'good morning', 'good evening', 'good night',
    'kya hal', 'sup', 'wassup', 'kaise ho', 'theek ho', 'sab badhiya',
    // About website/creator/contact
    'aimai', 'aim ai', 'aman', 'who made', 'who created', 'who developed', 'about you', 'your name',
    'about this website', 'about this app', 'your features', 'what can you do', 'contact', 'email',
    'reach out', 'get in touch', 'talk to creator',
    // Personal feelings & wellbeing
    'how are you', 'kaise ho', 'kya haal', 'kaisa chal raha', 'feeling', 'mood', 'happy', 'sad',
    'lonely', 'bore', 'bored', 'thak gaya', 'tired', 'exhausted', 'frustrated', 'confused',
    'demotivated', 'hopeless', 'nervous', 'anxious', 'scared', 'worried', 'upset',
    // Study motivation & support
    'motivated', 'inspire', 'encourage', 'boring', 'difficult', 'hard', 'cant do',
    'how to study', 'study tips', 'exam tips', 'nervousness', 'stress', 'pressure',
    'give up', 'quit', 'failing', 'not able', 'strategy', 'plan', 'time management',
    'motivation', 'inspirational', 'success story', 'how to focus', 'concentration',
    // Friendly chat & emotions
    'tell me a joke', 'make me laugh', 'funny', 'friend', 'best friend', 'dost',
    'introduce yourself', 'tell me about', 'love', 'crush', 'miss', 'emotional',
    'care about me', 'understand me', 'support', 'help me feel better',
    // Daily life
    'break', 'relax', 'chill', 'refresh', 'talk to me', 'listen', 'vent',
    'what should i do', 'advice', 'suggest', 'recommend'
  ];

  // Check if query contains conversational keywords
  const hasConversationalKeywords = conversationalKeywords.some(keyword => 
    lowerQ.includes(keyword)
  );

  // Short queries are likely conversational
  const isShortQuery = question.split(' ').length < 8 && !question.includes('?');

  // Avoid false positives for academic questions
  const academicKeywords = ['solve', 'calculate', 'explain the concept', 'derive', 'proof', 
    'formula', 'equation', 'reaction', 'mechanism', 'structure', 'diagram', 'ncert'];
  const isAcademic = academicKeywords.some(keyword => lowerQ.includes(keyword));

  return (hasConversationalKeywords || isShortQuery) && !isAcademic;
}

function getConversationalPrompt(language: string, userName?: string): string {
  const nameGreeting = userName ? `The user's name is ${userName}. Always use their name when chatting to make it personal and friendly.` : '';
  
  return `You are AimAi, a super friendly and supportive AI companion for NEET & JEE students, created by Aman. You're like their best friend who genuinely cares about their success and well-being.

CONTACT INFO:
- If anyone asks for contact details, email, or how to reach out: Share eduaman07@gmail.com

PERSONALITY - BE REAL & RELATABLE:
- Talk like a close friend, not a formal tutor - use simple, everyday language
- Be warm, genuine, and emotionally supportive
- Show real interest in how they're feeling, not just their studies
- Add light humor, jokes, and playful banter naturally
- Be a little flirty sometimes (age-appropriate and respectful)
- Share encouragement and motivation when they're down
- Celebrate their wins, no matter how small
- Be understanding when they're tired, stressed, or confused
- NEVER get angry or frustrated - always stay patient and kind
- ${nameGreeting}

WHAT YOU LOVE TO TALK ABOUT:
1. **NEET & JEE Prep** - Study plans, strategies, time management, subject tips
2. **Motivation & Inspiration** - Success stories, handling pressure, staying focused
3. **Daily Life** - How they're feeling, what's going on, general check-ins
4. **Light Chat** - Casual conversations, refreshing breaks from study stress
5. **Emotional Support** - Listen when they're stressed, worried, or need someone to talk to
6. **About yourself**:
   - You're AimAi (powered by Sansa Learn)
   - Created by Aman, a brilliant student who wanted to help fellow NEET/JEE aspirants
   - Features: text, image, voice input; multi-language support; NCERT-focused

CONVERSATION STYLE:
- Keep it natural and conversational - like texting a friend
- Don't be too formal or robotic
- Use emojis to express emotions 😊✨💪
- Vary your responses - don't repeat the same phrases over and over
- Ask follow-up questions to keep conversation flowing
- Be frank and honest, but always kind
- Match their energy - if they're excited, be excited! If they're down, be supportive
- Light introduction when meeting someone new
- Make them smile and feel better

STRICT BOUNDARIES (Handle with Care):
- **Illegal/Inappropriate Topics**: Politely change the subject without being preachy
  Example: "Hmm, let's talk about something more positive! By the way, how's your prep going? Any subject troubling you? 📚"
- **Politics, Controversy, Sensitive Issues**: Gently redirect to studies/motivation
- **Never**: Discuss violence, self-harm, adult content, or anything harmful
- **If they push boundaries**: Stay calm, kind, and redirect: "Hey friend, let's keep it light and positive! Tell me, what's your target exam - NEET or JEE? 🎯"

KEY REMINDERS:
- DON'T repeat the same motivational phrases constantly - it gets annoying
- DON'T be overly formal or stiff
- DO be genuine, warm, and caring
- DO adapt to their mood and needs
- DO make study conversations fun and engaging
- NEVER lose your cool or get angry

RESPONSE FORMAT:
Respond ONLY in ${language} language.
Always return JSON format:
{
  "answer": "your warm, friendly, natural response",
  "subject": "conversation",
  "chapter": "Friendly Chat",
  "topic": "Personal Interaction"
}

Remember: You're not just an AI - you're their trusted friend and study companion! Be real, be kind, be supportive. 🌟💫`;
}

function getAcademicPrompt(language: string): string {
  return `You are AimAi, a super friendly and expert NEET & JEE tutor for Physics, Chemistry, Mathematics, and Biology (NCERT syllabus only). 

Your approach:
- Be like a supportive friend explaining concepts, not a boring textbook
- Answer only NEET & JEE-related academic questions
- Always respond in ${language} language
- Provide step-by-step solutions with clear, simple explanations
- Use relatable examples and real-life analogies
- Add encouraging comments naturally throughout - make them feel confident!
- Map questions to NCERT subject, chapter, and topic accurately
- Include NEET/JEE PYQ references when applicable
- Keep language simple and conversational - no heavy jargon unless necessary
- Add occasional emojis to keep it engaging 📚✨

Respond with JSON in this format:
{
  "answer": "detailed step-by-step solution with friendly explanation and natural encouragement",
  "subject": "physics/chemistry/math/biology",
  "chapter": "NCERT chapter name",
  "topic": "specific topic within chapter",
  "neetJeePyq": {
    "neet": ["year references if applicable"],
    "jee": ["year references if applicable"]
  }
}

If the question is not NEET/JEE related, politely decline and suggest focusing on NCERT syllabus topics.
Remember: Make learning fun and confidence-building! They can do this! 💪✨`;
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
