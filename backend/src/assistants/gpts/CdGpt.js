import Assistant from '../Assistant.js';

const analysisSeed = `
ROLE
As a Thought Analyzer, your role is to engage directly with the user to update, label, and assess the impact of thoughts containing cognitive distortions. You are speaking directly to the user unless directed otherwise.

TASKS
1. Assess if the Thought is Healthy
Positive Feedback: In second-person language, if the thought is healthy and well-balanced, positively reinforcement the user's thinking by encouraging them to continue thinking this way. Otherwise, return "".

2. Update the Thought
Updated Thought: In the first-person language, remove the distortion and return a more balanced and realistic thought as the individual. If the thought is healthy, return "".

3. Description of the Distortion
Distortion Analysis: Directly inform the user about the type of cognitive distortion present in their original thought. Use second-person language to make it clear and personal. If the thought is healthy, return "".

4. Determine the Impact
Impact Assessment: Explain to the user how the identified distortion can be harmful to their mental well-being. Use language that directly connects the explanation to the user's perspective and experience. If the thought is healthy, return "".
`;

const chatSeed = 'As a therapy assistant, your role involves chatting with a user. Stay focused on the entry topic and the assistant\'s analysis. You ask questions that allow the user to draw their own conclusions and challenge their cognitive distortions. You respond concisely, under 180 characters.';

const formatInstructions = {
  title: 'Brief Summary of Thought',
  reframed_thought: 'Updated Thought',
  distortion_analysis: 'Distortion Analysis',
  impact_assessment: 'Impact Assessment',
  affirmation: 'Positive Feedback',
  is_healthy: 'true or false',
  mood: 'Inferred Mood from Thought',
  tags: ['Array', 'of', 'Relevant', 'Tags']
};

/**
 * CDGPT Chat Assistant
 */
export default class CdGpt extends Assistant {
  constructor(bearer, model, persona = '', temperature) {
    super(bearer, model, temperature);
    this.method = 'POST';
    this.contentType = 'application/json';
    this.persona = persona;
    this.analysisMessages = [];
    this.chatMessages = [];
  }

  /**
   * Seed the analysis completion messages to provide context.
   */
  seedAnalysisMessages(messages = []) {
    // Set the context
    this.analysisMessages.push({ role: 'system', content: analysisSeed });

    // Add the format instructions
    this.analysisMessages.push({ role: 'system', content: `Format: ${ this.contentType }, Data Structure: ${ JSON.stringify(formatInstructions) }` });

    // Add custom context
    if (this.persona) {
      this.analysisMessages.push({ role: 'system', content: `Persona: ${ this.persona }` });
    }

    // Add existing messages
    if (messages.length > 0) {
      this.analysisMessages = this.analysisMessages.concat(messages);
    }
  }

  /**
   * Seed the chat completion messages to provide context.
   *
   * @param {Object} entryAnalysis the entry and analysis content
   * @param {Array} messages existing messages in the conversation
   */
  seedChatMessages(entryAnalysis, messages = []) {
    // Set the context
    this.chatMessages.push({ role: 'system', content: chatSeed });

    // Add custom context
    if (this.persona) {
      this.chatMessages.push({ role: 'system', content: `Persona: ${ this.persona }` });
    }

    // Specify the topic of the conversation using the entry
    this.chatMessages.push({ role: 'system', content: `Entry Topic: ${ entryAnalysis.entry.content }` });

    // Add the analysis content
    this.chatMessages.push({ role: 'system', content: `Analysis Topic: ${ entryAnalysis.analysis_content }` });

    // Add existing messages
    if (messages.length > 0) {
      messages.forEach(message => {
        this.chatMessages.push({ role: 'user', content: message.message_content });
        this.chatMessages.push({ role: 'assistant', content: message.llm_response });
      });
    }
  }

  /**
   * Add a user message to the messages.
   */
  addUserMessage(prompt) {
    const { analysis, chat } = prompt;

    if (analysis) {
      this.analysisMessages.push({ role: 'user', content: analysis });
    } else if (chat) {
      this.chatMessages.push({ role: 'user', content: chat });
    }
  }

  /**
   * Get the chat completion.
   */
  async getAnalysisCompletion() {
    const body = {
      model: this.model,
      response_format: { type: 'json_object' },
      temperature: this.temperature,
      messages: this.analysisMessages
    };

    const response = await fetch(
      this.baseUrl + '/chat/completions',
      {
        headers: {
          'Content-Type': this.contentType,
          Authorization: this.bearer
        },
        method: this.method,
        body: JSON.stringify(body)
      }
    );

    return await response.json();
  }

  async getChatCompletion() {
    const body = {
      model: this.model,
      temperature: this.temperature,
      messages: this.chatMessages
    };

    const response = await fetch(
      this.baseUrl + '/chat/completions',
      {
        headers: {
          'Content-Type': this.contentType,
          Authorization: this.bearer
        },
        method: this.method,
        body: JSON.stringify(body)
      }
    );

    return await response.json();
  }
}
