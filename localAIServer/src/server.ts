import express, { Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { ClaudeAgentClient } from './claudeClient.js';
import { AiRequest, AiRequestMessage } from './types.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// In-memory store for AI requests
const aiRequests = new Map<string, AiRequest>();
const claudeClient = new ClaudeAgentClient();

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', provider: 'claude-agent-sdk' });
});

// Create AI request
app.post('/ai-request', async (req: Request, res: Response) => {
  try {
    const {
      userRequest,
      gameProjectJson,
      mode = 'agent',
      toolsVersion,
    } = req.body;

    const requestId = uuidv4();
    const now = new Date().toISOString();

    const aiRequest: AiRequest = {
      id: requestId,
      createdAt: now,
      updatedAt: now,
      userId: req.query.userId as string || 'local-user',
      status: 'working',
      mode,
      toolsVersion,
      error: null,
      output: [],
    };

    aiRequests.set(requestId, aiRequest);

    // Process async
    processAiRequest(requestId, userRequest, gameProjectJson, mode).catch(err => {
      console.error('Error processing AI request:', err);
      const req = aiRequests.get(requestId);
      if (req) {
        req.status = 'error';
        req.error = { code: 'processing_error', message: err.message };
        req.updatedAt = new Date().toISOString();
      }
    });

    res.json(aiRequest);
  } catch (error: any) {
    console.error('Error creating AI request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get AI request
app.get('/ai-request/:id', (req: Request, res: Response) => {
  const aiRequest = aiRequests.get(req.params.id);
  if (!aiRequest) {
    return res.status(404).json({ error: 'AI request not found' });
  }
  res.json(aiRequest);
});

// Add message to AI request (continue conversation)
app.post('/ai-request/:id/action/add-message', async (req: Request, res: Response) => {
  try {
    const aiRequest = aiRequests.get(req.params.id);
    if (!aiRequest) {
      return res.status(404).json({ error: 'AI request not found' });
    }

    const { userMessage, functionCallOutputs, gameProjectJson, mode } = req.body;

    // Add function call outputs to conversation
    if (functionCallOutputs && functionCallOutputs.length > 0) {
      for (const output of functionCallOutputs) {
        aiRequest.output.push(output);
      }
    }

    // If there's a user message, add it and continue processing
    if (userMessage) {
      aiRequest.output.push({
        type: 'message',
        status: 'completed',
        role: 'user',
        content: [{ type: 'user_request', status: 'completed', text: userMessage }],
      });
    }

    aiRequest.status = 'working';
    aiRequest.updatedAt = new Date().toISOString();

    // Continue processing
    continueAiRequest(req.params.id, gameProjectJson, mode || aiRequest.mode).catch(err => {
      console.error('Error continuing AI request:', err);
      const req = aiRequests.get(req.params.id);
      if (req) {
        req.status = 'error';
        req.error = { code: 'processing_error', message: err.message };
        req.updatedAt = new Date().toISOString();
      }
    });

    res.json(aiRequest);
  } catch (error: any) {
    console.error('Error adding message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get suggestions (stub - returns empty)
app.post('/ai-request/:id/action/get-suggestions', (req: Request, res: Response) => {
  const aiRequest = aiRequests.get(req.params.id);
  if (!aiRequest) {
    return res.status(404).json({ error: 'AI request not found' });
  }
  // Return the request as-is, suggestions will be empty
  res.json(aiRequest);
});

// Set feedback (stub)
app.post('/ai-request/:id/action/set-feedback', (req: Request, res: Response) => {
  const aiRequest = aiRequests.get(req.params.id);
  if (!aiRequest) {
    return res.status(404).json({ error: 'AI request not found' });
  }
  res.json(aiRequest);
});

async function processAiRequest(
  requestId: string,
  userRequest: string,
  gameProjectJson: string | null,
  mode: 'chat' | 'agent'
): Promise<void> {
  const aiRequest = aiRequests.get(requestId);
  if (!aiRequest) return;

  // Add user message
  aiRequest.output.push({
    type: 'message',
    status: 'completed',
    role: 'user',
    content: [{ type: 'user_request', status: 'completed', text: userRequest }],
  });

  await continueAiRequest(requestId, gameProjectJson, mode);
}

async function continueAiRequest(
  requestId: string,
  gameProjectJson: string | null,
  mode: 'chat' | 'agent'
): Promise<void> {
  const aiRequest = aiRequests.get(requestId);
  if (!aiRequest) return;

  try {
    // Build conversation history for Claude
    const messages = buildClaudeMessages(aiRequest.output);

    // Get response from Claude
    const response = await claudeClient.query(messages, gameProjectJson, mode);

    // Add assistant response
    const assistantMessage: AiRequestMessage = {
      type: 'message',
      status: 'completed',
      role: 'assistant',
      content: [],
    };

    // Add text content if any
    if (response.text) {
      assistantMessage.content.push({
        type: 'output_text',
        status: 'completed',
        text: response.text,
        annotations: [],
      });
    }

    // Add function calls if any
    if (response.functionCalls && response.functionCalls.length > 0) {
      for (const fc of response.functionCalls) {
        assistantMessage.content.push({
          type: 'function_call',
          status: 'completed',
          call_id: fc.call_id,
          name: fc.name,
          arguments: fc.arguments,
        });
      }
    }

    aiRequest.output.push(assistantMessage);
    aiRequest.status = 'ready';
    aiRequest.updatedAt = new Date().toISOString();
  } catch (error: any) {
    aiRequest.status = 'error';
    aiRequest.error = { code: 'claude_error', message: error.message };
    aiRequest.updatedAt = new Date().toISOString();
  }
}

function buildClaudeMessages(output: AiRequestMessage[]): Array<{ role: string; content: string }> {
  const messages: Array<{ role: string; content: string }> = [];

  for (const msg of output) {
    if (msg.type === 'message') {
      if (msg.role === 'user') {
        const text = msg.content
          .filter((c: any) => c.type === 'user_request')
          .map((c: any) => c.text)
          .join('\n');
        if (text) {
          messages.push({ role: 'user', content: text });
        }
      } else if (msg.role === 'assistant') {
        const textParts = msg.content
          .filter((c: any) => c.type === 'output_text')
          .map((c: any) => c.text);
        const functionCalls = msg.content
          .filter((c: any) => c.type === 'function_call')
          .map((c: any) => `[Tool call: ${c.name}(${c.arguments})]`);

        const content = [...textParts, ...functionCalls].join('\n');
        if (content) {
          messages.push({ role: 'assistant', content });
        }
      }
    } else if (msg.type === 'function_call_output') {
      messages.push({
        role: 'user',
        content: `[Tool result for ${msg.call_id}]: ${msg.output}`,
      });
    }
  }

  return messages;
}

const PORT = process.env.LOCAL_AI_PORT || 3030;

app.listen(PORT, () => {
  console.log(`GDevelop Local AI Server running on http://localhost:${PORT}`);
  console.log('Using Claude Agent SDK for AI generation');
  console.log('\nEnsure you have run: claude login');
});
