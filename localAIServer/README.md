# GDevelop Local AI Server (Claude Agent SDK)

This is a local AI server that enables using Claude Agent SDK as the AI backend for GDevelop's AI generation features. It allows you to use your Claude Pro/Max subscription instead of GDevelop's cloud AI.

## Prerequisites

1. **Node.js 18+** - Required for the Claude Agent SDK
2. **Claude Code CLI** - Installed and logged in
3. **Claude Pro/Max Subscription** - Or API access

## Setup

### 1. Install Claude Code CLI

```bash
npm install -g @anthropic-ai/claude-code
claude login
```

This will open a browser window to authenticate with your Anthropic account.

### 2. Install Dependencies

```bash
cd localAIServer
npm install
```

### 3. Build and Start the Server

```bash
npm run build
npm start
```

Or for development with hot-reload:

```bash
npm run dev
```

The server will start on `http://localhost:3030` by default.

## Configuration

### Environment Variables

- `LOCAL_AI_PORT` - Port to run the server on (default: 3030)

### GDevelop Configuration

1. Open GDevelop
2. Go to **File > Preferences > Advanced > Other**
3. Enable **"Use local Claude AI (requires local server)"**
4. Optionally adjust the server URL if not using default port

## Architecture

```
GDevelop IDE
     |
     v
[AiGenerationRouter.js] -- Checks preset ID
     |
     +-- local-* preset --> Local AI Server (localhost:3030)
     |                           |
     |                           v
     |                      Claude Agent SDK
     |                           |
     |                           v
     |                      Claude API (via subscription)
     |
     +-- cloud preset --> GDevelop Cloud API
```

## Available Tools

The local AI server provides GDevelop-compatible tools that Claude can use:

| Tool | Description |
|------|-------------|
| `create_scene` | Create new scenes/levels |
| `create_object` | Create game objects (Sprite, Text, etc.) |
| `add_behavior` | Add behaviors to objects |
| `put_2d_instances` | Place object instances in scenes |
| `add_scene_events` | Add game logic events |
| `read_scene_events` | Read existing events |
| `change_object_property` | Modify object properties |
| `add_or_edit_variable` | Create/edit variables |
| `change_scene_properties_layers_effects_groups` | Modify scene settings |
| `initialize_project` | Create new projects |

## API Endpoints

The server mimics GDevelop's Generation API:

- `GET /health` - Health check
- `POST /ai-request` - Create new AI request
- `GET /ai-request/:id` - Get AI request status
- `POST /ai-request/:id/action/add-message` - Continue conversation
- `POST /ai-request/:id/action/get-suggestions` - Get suggestions (stub)
- `POST /ai-request/:id/action/set-feedback` - Send feedback (stub)

## Troubleshooting

### "Local AI server is not available"

1. Make sure the server is running (`npm start`)
2. Check the server URL in GDevelop preferences
3. Verify port 3030 is not blocked by firewall

### "Claude login required"

Run `claude login` in your terminal to authenticate.

### "Permission denied"

Make sure you have a valid Claude Pro/Max subscription with access to the Claude Code tools.

## Development

### Project Structure

```
localAIServer/
├── src/
│   ├── server.ts       # Express server
│   ├── claudeClient.ts # Claude Agent SDK client
│   └── types.ts        # TypeScript types
├── package.json
├── tsconfig.json
└── README.md
```

### Building

```bash
npm run build
```

### Running in Development

```bash
npm run dev
```

## License

MIT - Same as GDevelop
