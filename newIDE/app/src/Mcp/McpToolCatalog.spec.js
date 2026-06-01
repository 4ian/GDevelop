// @flow
import {
  getMcpTools,
  getMcpResources,
  getMcpPrompts,
  isCommandTool,
  isKnownMcpTool,
  isWriteTool,
  canCallMcpTool,
} from './McpToolCatalog';

describe('McpToolCatalog', () => {
  it('lists read-only tools by default', () => {
    const tools = getMcpTools({
      allowWriteTools: false,
      allowCommandTools: false,
    });
    const toolNames = tools.map(tool => tool.name);

    expect(toolNames).toContain('gdevelop_get_editor_state');
    expect(toolNames).toContain('read_scene_events');
    expect(toolNames).toContain('gdevelop_editor_call');
    expect(toolNames).toContain('gdevelop_get_events_json_examples');
    expect(toolNames).toContain('gdevelop_get_event_operation_reference');
    expect(toolNames).toContain('gdevelop_validate_events_json');
    expect(toolNames).toContain('gdevelop_search_instruction_metadata');
    expect(toolNames).toContain('gdevelop_get_instruction_metadata');
    expect(toolNames).toContain('gdevelop_get_editor_selection');
    expect(toolNames).not.toContain('create_scene');
    expect(toolNames).not.toContain('gdevelop_run_command');
  });

  it('includes write and command tools only when allowed', () => {
    const tools = getMcpTools({
      allowWriteTools: true,
      allowCommandTools: true,
    });
    const toolNames = tools.map(tool => tool.name);

    expect(toolNames).toContain('create_scene');
    expect(toolNames).toContain('change_object_property');
    expect(toolNames).toContain('gdevelop_run_command');
  });

  it('classifies tool permissions', () => {
    expect(isWriteTool('create_scene')).toBe(true);
    expect(isWriteTool('read_scene_events')).toBe(false);
    expect(isCommandTool('gdevelop_run_command')).toBe(true);
    expect(isKnownMcpTool('inspect_object_properties')).toBe(true);
    expect(isKnownMcpTool('totally_unknown_tool')).toBe(false);
  });

  it('blocks disabled write and command tools', () => {
    expect(
      canCallMcpTool('create_scene', {
        allowWriteTools: false,
        allowCommandTools: true,
      })
    ).toEqual({
      canCall: false,
      reason: 'Write MCP tools are disabled in GDevelop preferences.',
    });

    expect(
      canCallMcpTool('gdevelop_run_command', {
        allowWriteTools: true,
        allowCommandTools: false,
      })
    ).toEqual({
      canCall: false,
      reason: 'Command MCP tools are disabled in GDevelop preferences.',
    });
  });

  it('exposes resources and prompts', () => {
    expect(getMcpResources().map(resource => resource.uri)).toContain(
      'gdevelop://project/summary'
    );
    expect(getMcpPrompts().map(prompt => prompt.name)).toContain(
      'implement-game-feature'
    );
  });

  it('uses OpenAI-compatible top-level input schemas for every tool', () => {
    const tools = getMcpTools({
      allowWriteTools: true,
      allowCommandTools: true,
    });
    const forbiddenTopLevelKeywords = [
      'oneOf',
      'anyOf',
      'allOf',
      'enum',
      'not',
    ];

    for (const tool of tools) {
      expect(tool.inputSchema.type).toBe('object');
      for (const keyword of forbiddenTopLevelKeywords) {
        expect(tool.inputSchema).not.toHaveProperty(keyword);
      }
    }
  });
});
