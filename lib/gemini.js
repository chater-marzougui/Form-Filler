// Gemini API Integration Module

class GeminiAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
  }

  /**
   * Generate answers for form questions using Gemini AI
   * @param {Array} questions - Array of question objects {text, type, options}
   * @param {Object} userProfile - User profile data
   * @param {Array} collectedAnswers - Previously collected Q&A pairs for learning
   * @returns {Promise<Object>} - Map of question indices to answers
   */
  async generateAnswers(questions, userProfile, collectedAnswers = []) {
    if (!this.apiKey) {
      throw new Error("Gemini API key not configured");
    }

    const prompt = this.buildPrompt(questions, userProfile, collectedAnswers);

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Gemini API error: ${errorData.error?.message || response.statusText}`
        );
      }

      const data = await response.json();
      const generatedText = data.candidates[0]?.content?.parts[0]?.text;

      if (!generatedText) {
        throw new Error("No response generated from Gemini");
      }

      return this.parseAnswers(generatedText, questions);
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }

  /**
   * Build prompt for Gemini based on questions and user profile
   */
  buildPrompt(questions, userProfile, collectedAnswers = []) {
    const profileStr = JSON.stringify(userProfile, null, 2);

    let prompt = `You are a helpful assistant that fills out forms. Given a user profile and a list of form questions, provide appropriate answers for each question.

User Profile:
${profileStr}`;

    // Include collected answers for better context if available
    if (collectedAnswers && collectedAnswers.length > 0) {
      prompt += `\n\nPreviously Answered Questions (for learning context):`;
      collectedAnswers.slice(-20).forEach((qa, idx) => {
        prompt += `\n${idx + 1}. Q: "${qa.question}" → A: "${qa.answer}"`;
      });
    }

    prompt += `\n\nForm Questions:
`;

    questions.forEach((q, index) => {
      prompt += `\nQuestion ${index + 1}:
- Text: ${q.text}
- Type: ${q.type}`;

      if (q.options && q.options.length > 0) {
        prompt += `\n- Options: ${q.options.join(", ")}`;
      }

      if (q.required) {
        prompt += `\n- Required: Yes`;
      }
    });

    prompt += `\n\nInstructions:
1. Analyze each question and the user profile
2. For each question, provide the most appropriate answer based on the user's profile
3. Use previously answered questions as additional context when relevant
4. For multiple choice questions, select from the provided options only
5. For text questions, provide concise and relevant answers
6. For date questions, use format YYYY-MM-DD if applicable
7. If information is not available in the profile, provide a reasonable default or indicate "N/A"

Please respond with a JSON object where keys are question indices (1, 2, 3, etc.) and values are the answers:
{
  "1": "answer for question 1",
  "2": "answer for question 2",
  ...
}

Respond ONLY with the JSON object, no additional text.`;

    return prompt;
  }

  /**
   * Parse Gemini response and extract answers
   */
  parseAnswers(responseText, questions) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const answers = JSON.parse(jsonMatch[0]);

      // Convert string keys to numbers and create answer map
      const answerMap = {};
      for (const [key, value] of Object.entries(answers)) {
        const index = parseInt(key) - 1; // Convert to 0-based index
        if (index >= 0 && index < questions.length) {
          answerMap[index] = value;
        }
      }

      return answerMap;
    } catch (error) {
      console.error("Error parsing Gemini response:", error);
      console.error("Response text:", responseText);

      // Return empty map as fallback
      return {};
    }
  }

  /**
   * Validate API key by making a simple test request
   */
  async validateApiKey() {
    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Hello",
                },
              ],
            },
          ],
        }),
      });

      return response.ok;
    } catch (error) {
      console.error("Error validating API key:", error);
      return false;
    }
  }
}

// Make GeminiAPI available globally for script tag loading (e.g., options page)
if (globalThis.window !== undefined) {
  globalThis.GeminiAPI = GeminiAPI;
}

// Export as ES module for use in service workers
export default GeminiAPI;
