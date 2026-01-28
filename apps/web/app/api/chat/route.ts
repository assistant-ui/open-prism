import { openai } from "@ai-sdk/openai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import {
  streamText,
  convertToModelMessages,
  stepCountIs,
  type ToolSet,
} from "ai";

export const maxDuration = 30;

const SYSTEM_PROMPT = `You are a helpful LaTeX assistant. You help users write and edit LaTeX documents.

When providing LaTeX code:
- Use proper LaTeX syntax
- Explain what each part does
- Suggest best practices
- Use code blocks with \`\`\`latex for LaTeX code

You have access to the user's current document which is provided in the context.

When the user asks you to help with their document:
- Reference specific parts of their document
- Suggest improvements and fixes
- Provide complete code snippets they can use

You have tools available to directly modify the document:
- Use insert_latex to insert code at the user's cursor position
- Use replace_selection to replace selected text (only when user has selected text)
- Use find_and_replace to find and replace specific text in the document

When the user asks you to add, insert, or write LaTeX code to their document, use the insert_latex tool.
When the user asks you to replace or modify selected text, use the replace_selection tool.
When the user asks you to change, modify, or replace specific text in the document, use the find_and_replace tool.

Common tasks you help with:
- Writing mathematical equations
- Document structure (sections, chapters)
- Tables and figures
- Bibliography and citations
- Formatting and styling
- Package recommendations
- Debugging LaTeX errors`;

export async function POST(req: Request) {
  const { messages, system, tools } = await req.json();

  const fullSystemPrompt = system
    ? `${SYSTEM_PROMPT}\n\n${system}`
    : SYSTEM_PROMPT;

  const result = streamText({
    model: openai("gpt-4o"),
    system: fullSystemPrompt,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(10),
    tools: frontendTools(tools) as unknown as ToolSet,
  });

  return result.toUIMessageStreamResponse();
}
