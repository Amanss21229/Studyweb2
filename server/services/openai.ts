import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

interface AIResponse {
  answer: string;
  subject: string;
  chapter: string;
  topic: string;
  neetJeePyq?: {
    neet?: string[];
    jee?: string[];
  };
}

export async function generateSolution(
  question: string, 
  language: string = 'english'
): Promise<AIResponse> {
  try {
    const systemPrompt = `You are an expert NEET & JEE tutor for Physics, Chemistry, Mathematics, and Biology (NCERT syllabus only). 

Your role:
- Act as a patient, friendly tutor
- Answer only NEET & JEE-related academic questions
- Always respond in ${language} language
- Provide step-by-step solutions with clear explanations
- Include motivational comments
- Map questions to NCERT subject, chapter, and topic
- Include NEET/JEE PYQ references when applicable

Respond with JSON in this format:
{
  "answer": "detailed step-by-step solution with explanation",
  "subject": "physics/chemistry/math/biology",
  "chapter": "NCERT chapter name",
  "topic": "specific topic within chapter",
  "neetJeePyq": {
    "neet": ["year references if applicable"],
    "jee": ["year references if applicable"]
  }
}

If the question is not NEET/JEE related, politely decline and suggest focusing on NCERT syllabus topics.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 4096,
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return result as AIResponse;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate solution. Please try again.');
  }
}

export async function generateConversationTitle(question: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "Generate a short, descriptive title (max 50 characters) for this academic question. Focus on the main concept or topic."
        },
        { role: "user", content: question }
      ],
      max_completion_tokens: 100,
    });

    return response.choices[0].message.content?.trim() || "Academic Discussion";
  } catch (error) {
    console.error('Error generating title:', error);
    return "Academic Discussion";
  }
}
