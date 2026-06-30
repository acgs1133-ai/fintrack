const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic();

const ASSISTENTE_MODEL = "claude-sonnet-4-6";

module.exports = { anthropic, ASSISTENTE_MODEL };
