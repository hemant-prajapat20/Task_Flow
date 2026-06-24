const { GoogleGenAI } = require('@google/genai');

const suggestEstimate = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Task title is required for AI estimation' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ message: 'AI feature is currently unavailable (API key missing)' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `
    You are an expert project manager. I have a task with the following details:
    Title: ${title}
    Description: ${description || 'No description provided'}
    
    Please estimate the effort required for this task (e.g., in hours, days, or T-shirt size like S/M/L) and suggest a reasonable due date (in YYYY-MM-DD format) assuming the task starts today.
    Return your response strictly in JSON format like this:
    {
      "effort": "estimated effort",
      "dueDate": "YYYY-MM-DD",
      "reasoning": "A very short 1-2 sentence explanation for this estimate"
    }
    Do not return any markdown formatting like \`\`\`json or \`\`\`. Just return the raw JSON object.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = response.text;
    
    try {
      // Try parsing JSON directly in case it returns raw JSON
      // Also clean up potential markdown formatting if the model still includes it
      const cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const result = JSON.parse(cleanedText);
      res.json(result);
    } catch (parseError) {
      console.error('Error parsing AI response:', text);
      res.status(500).json({ message: 'Failed to parse AI response', raw: text });
    }

  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ message: 'Error generating estimate. Please try again later.' });
  }
};

module.exports = { suggestEstimate };
