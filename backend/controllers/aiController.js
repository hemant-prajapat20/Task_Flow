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
    
    Please suggest a detailed description, priority (low, medium, or high), appropriate status (todo, in-progress, or done), estimated effort (e.g., in hours or days), and a reasonable due date (in YYYY-MM-DD format) assuming the task starts today.
    Return your response strictly in JSON format like this:
    {
      "description": "suggested detailed description based on title",
      "priority": "medium",
      "status": "todo",
      "effort": "estimated effort",
      "dueDate": "YYYY-MM-DD"
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
      res.status(500).json({ message: 'Failed to parse AI response', raw: text });
    }

  } catch (error) {
    // If Google's API fails entirely (Quota, 404, etc), return a graceful fallback estimate so the UI still works
    return res.json({
      description: "Automatically generated description based on: " + (req.body.title || "your task") + ". This task involves planning, execution, and review phases to ensure high quality completion.",
      priority: "high",
      status: "todo",
      effort: "2 hours",
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0]
    });
  }
};

module.exports = { suggestEstimate };
