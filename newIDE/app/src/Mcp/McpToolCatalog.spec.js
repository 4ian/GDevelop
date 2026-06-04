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
    expect(toolNames).toContain('gdevelop_list_extensions');
    expect(toolNames).toContain('gdevelop_inspect_extension');
    expect(toolNames).toContain('inspect_tool_schema');
    expect(toolNames).toContain('get_tool_usage_examples');
    expect(toolNames).toContain('read_serialized_scene');
    expect(toolNames).toContain('read_scene_events_serialized');
    expect(toolNames).toContain('inspect_project_resources');
    expect(toolNames).toContain('inspect_project_cleanup');
    expect(toolNames).toContain('find_scene_events');
    expect(toolNames).toContain('validate_events_json_file');
    expect(toolNames).toContain('lint_scene_events');
    expect(toolNames).not.toContain('create_scene');
    expect(toolNames).not.toContain('gdevelop_create_or_update_extension');
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
    expect(toolNames).toContain('set_project_properties');
    expect(toolNames).toContain('set_first_layout');
    expect(toolNames).toContain('add_or_update_resource');
    expect(toolNames).toContain('set_sprite_animations');
    expect(toolNames).toContain('bulk_edit_scene_assets');
    expect(toolNames).toContain('slice_sprite_sheet');
    expect(toolNames).toContain('replace_object_definition');
    expect(toolNames).toContain('delete_scene_object');
    expect(toolNames).toContain('set_object_properties');
    expect(toolNames).toContain('set_text_object_properties');
    expect(toolNames).toContain('create_sprite_object_from_resource');
    expect(toolNames).toContain('create_text_object');
    expect(toolNames).toContain('apply_validated_scene_patch');
    expect(toolNames).toContain('create_group');
    expect(toolNames).toContain('wrap_events_in_group');
    expect(toolNames).toContain('move_events_to_group');
    expect(toolNames).toContain('rename_group');
    expect(toolNames).toContain('ensure_scene_event_ids');
    expect(toolNames).toContain('replace_scene_events_from_file');
    expect(toolNames).toContain('gdevelop_create_or_update_extension');
    expect(toolNames).toContain('gdevelop_create_or_update_extension_function');
    expect(toolNames).toContain('gdevelop_create_or_update_extension_behavior');
    expect(toolNames).toContain('gdevelop_create_or_update_extension_object');
    expect(toolNames).toContain('gdevelop_create_or_update_extension_property');
    expect(toolNames).toContain('gdevelop_run_command');
    expect(toolNames).toContain('gdevelop_save_project_and_wait');
  });

  it('classifies tool permissions', () => {
    expect(isWriteTool('create_scene')).toBe(true);
    expect(isWriteTool('set_project_properties')).toBe(true);
    expect(isWriteTool('set_first_layout')).toBe(true);
    expect(isWriteTool('bulk_edit_scene_assets')).toBe(true);
    expect(isWriteTool('set_text_object_properties')).toBe(true);
    expect(isWriteTool('create_sprite_object_from_resource')).toBe(true);
    expect(isWriteTool('create_text_object')).toBe(true);
    expect(isWriteTool('add_or_update_resource')).toBe(true);
    expect(isWriteTool('replace_object_definition')).toBe(true);
    expect(isWriteTool('slice_sprite_sheet')).toBe(true);
    expect(isWriteTool('read_serialized_scene')).toBe(false);
    expect(isWriteTool('inspect_project_cleanup')).toBe(false);
    expect(isWriteTool('validate_events_json_file')).toBe(false);
    expect(isWriteTool('lint_scene_events')).toBe(false);
    expect(isWriteTool('gdevelop_create_or_update_extension')).toBe(true);
    expect(isWriteTool('read_scene_events')).toBe(false);
    expect(isWriteTool('gdevelop_list_extensions')).toBe(false);
    expect(isCommandTool('gdevelop_run_command')).toBe(true);
    expect(isKnownMcpTool('inspect_object_properties')).toBe(true);
    expect(isKnownMcpTool('gdevelop_inspect_extension')).toBe(true);
    expect(isKnownMcpTool('find_scene_events')).toBe(true);
    expect(isCommandTool('gdevelop_save_project_and_wait')).toBe(true);
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
    expect(getMcpResources().map(resource => resource.uri)).toContain(
      'gdevelop://scene/{sceneName}/scene.json'
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
