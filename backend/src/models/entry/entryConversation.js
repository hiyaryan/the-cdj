import { Config, EntryAnalysis } from '../index.js';
import { Schema, model } from 'mongoose';

import CdGpt from '../../assistants/gpts/CdGpt.js';

import Joi from 'joi';

const entryConversationSchema = new Schema({
  entry: { type: Schema.Types.ObjectId, ref: 'Entry', required: true },
  messages: [{
    message_content: { type: String, required: true },
    llm_response: { type: String },
    created_at: { type: Date, default: Date.now }
  }]
});

entryConversationSchema.statics.joi = Joi.object({
  messages: Joi.array().items(Joi.object({
    message_content: Joi.string()
      .min(1)
      .max(280)
      .trim()
      .required(),
    llm_response: Joi.string()
      .allow('')
      .trim()
      .empty('')
      .default('Not connected to LLM'),
    created_at: Joi.date()
  }))
});

// For quickly fetching conversations related to an entry.
entryConversationSchema.index({ entry: 1 });

// To order messages within a conversation by time.
entryConversationSchema.index({ 'messages.created_at': 1 });

// Get the analysis content for an entry
entryConversationSchema.methods.getChatContent = async function (configId, analysisId, content, messages = []) {
  try {
    const config = await Config.findById(configId);
    const cdGpt = new CdGpt(config.decrypt(), config.model);

    const analysis = await EntryAnalysis.findById(analysisId).populate('entry');

    cdGpt.seedChatMessages(analysis, messages);
    cdGpt.addUserMessage({ chat: content });

    const response = await cdGpt.getAnalysisCompletion();

    return response.choices[0].message.content;
  } catch (err) {
    console.error(err);
    return {};
  }
};

export default model('EntryConversation', entryConversationSchema);
