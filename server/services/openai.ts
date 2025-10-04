import { InferenceClient } from "@huggingface/inference";

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

    const response = await hf.chatCompletion({
      model: "meta-llama/Llama-3.1-70B-Instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      max_tokens: 4096,
      temperature: 0.7,
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
          subject: "general",
          chapter: "General Concepts",
          topic: "Academic Discussion"
        };
      }
    }

    return result as AIResponse;
  } catch (error) {
    console.error('Hugging Face API error:', error);
    throw new Error('Failed to generate solution. Please try again.');
  }
}

export async function generateConversationTitle(question: string): Promise<string> {
  try {
    const response = await hf.chatCompletion({
      model: "meta-llama/Llama-3.1-8B-Instruct",
      messages: [
        {
          role: "system",
          content: "Generate a short, descriptive title (max 50 characters) for this academic question. Focus on the main concept or topic. Respond with only the title, no extra text."
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
