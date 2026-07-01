// @flow
import {
  getMcpTools,
  getMcpResources,
  getMcpPrompts,
  isCommandTool,
  isKnownMcpTool,
  isWriteTool,
  canCallMcpTool,
  getMcpToolUsageExamples,
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
    expect(toolNames).toContain('gdevelop_get_global_config');
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
    expect(toolNames).toContain('find_extension_events');
    expect(toolNames).toContain('find_project_events');
    expect(toolNames).toContain('gdevelop_inspect_signal_usage');
    expect(toolNames).toContain('validate_events_json_file');
    expect(toolNames).toContain('gdevelop_validate_extension_events_json');
    expect(toolNames).toContain('lint_scene_events');
    expect(toolNames).toContain('lint_extension_function_events');
    expect(toolNames).toContain('validate_current_project_json');
    expect(toolNames).toContain('inspect_custom_object_runtime_geometry');
    expect(toolNames).toContain('inspect_prefab_property_bindings');
    expect(toolNames).toContain('get_tilemap_tiles');
    expect(toolNames).toContain('inspect_tilemap_palette');
    expect(toolNames).toContain('inspect_tilemap_collision');
    expect(toolNames).toContain('check_tilemap_walkability');
    expect(toolNames).toContain('inspect_resource_images');
    expect(toolNames).toContain('audit_project_asset_sources');
    expect(toolNames).toContain('compare_image_files');
    expect(toolNames).toContain('crop_scene_object_image');
    expect(toolNames).toContain('inspect_scene_draw_order');
    expect(toolNames).toContain('inspect_gameplay_rules');
    expect(toolNames).toContain('search_behavior_store');
    expect(toolNames).toContain('preview_health_check');
    expect(toolNames).toContain('wait_until_preview_ready');
    expect(toolNames).toContain('gdevelop_refresh_tool_catalog');
    expect(toolNames).toContain('gdevelop_capabilities');
    expect(toolNames).toContain('create_action');
    expect(toolNames).toContain('create_condition');
    expect(toolNames).toContain('create_signal_emit_action');
    expect(toolNames).toContain('create_signal_received_condition');
    expect(toolNames).not.toContain('create_scene');
    expect(toolNames).not.toContain('gdevelop_create_or_update_extension');
    expect(toolNames).not.toContain('gdevelop_run_command');
    const editorSelectionTool = tools.find(
      tool => tool.name === 'gdevelop_get_editor_selection'
    );
    if (!editorSelectionTool) {
      throw new Error('gdevelop_get_editor_selection should be listed.');
    }
    expect(editorSelectionTool.description).toContain(
      'selected project-file assets'
    );
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
    expect(toolNames).toContain('gdevelop_set_global_config');
    expect(toolNames).toContain('gdevelop_set_global_config_value');
    expect(toolNames).toContain('gdevelop_delete_global_config_value');
    expect(toolNames).toContain('add_or_update_resource');
    expect(toolNames).toContain('set_sprite_animations');
    expect(toolNames).toContain('bulk_edit_scene_assets');
    expect(toolNames).toContain('slice_sprite_sheet');
    expect(toolNames).toContain('bind_sprite_animations_from_directory');
    expect(toolNames).toContain('render_scene_to_png');
    expect(toolNames).toContain('create_tilemap_object');
    expect(toolNames).toContain('set_tilemap_tiles');
    expect(toolNames).toContain('set_tilemap_collision_tiles');
    expect(toolNames).toContain('replace_project_resource');
    expect(toolNames).toContain('snapshot_project');
    expect(toolNames).toContain('restore_project_snapshot');
    expect(toolNames).toContain('replace_object_definition');
    expect(toolNames).toContain('delete_scene_object');
    expect(toolNames).toContain('delete_scene_variable');
    expect(toolNames).toContain('batch_delete_scene_variables');
    expect(toolNames).toContain('delete_object_variable');
    expect(toolNames).toContain('delete_instance_variable');
    expect(toolNames).toContain('set_object_properties');
    expect(toolNames).toContain('set_text_object_properties');
    expect(toolNames).toContain('create_sprite_object_from_resource');
    expect(toolNames).toContain('create_text_object');
    expect(toolNames).toContain('apply_validated_scene_patch');
    expect(toolNames).toContain('patch_scene_event_instruction');
    expect(toolNames).toContain('patch_extension_event_instruction');
    expect(toolNames).toContain('replace_javascript_event_code');
    expect(toolNames).toContain('attach_object_to_object_top');
    expect(toolNames).toContain('create_group');
    expect(toolNames).toContain('wrap_events_in_group');
    expect(toolNames).toContain('move_events_to_group');
    expect(toolNames).toContain('rename_group');
    expect(toolNames).toContain('ensure_scene_event_ids');
    expect(toolNames).toContain('replace_scene_events_from_file');
    expect(toolNames).toContain('apply_validated_project_json_patch');
    expect(toolNames).toContain('sync_editor_from_validated_project_json');
    expect(toolNames).toContain('gdevelop_create_or_update_extension');
    expect(toolNames).toContain('gdevelop_create_or_update_extension_function');
    expect(toolNames).toContain('gdevelop_create_or_update_on_signal');
    expect(toolNames).toContain('replace_extension_function_events_from_file');
    expect(toolNames).toContain('apply_validated_extension_patch');
    expect(toolNames).toContain('gdevelop_create_or_update_extension_behavior');
    expect(toolNames).toContain('gdevelop_create_or_update_extension_object');
    expect(toolNames).toContain('gdevelop_extract_prefab_from_object');
    expect(toolNames).toContain('gdevelop_create_or_update_extension_property');
    expect(toolNames).toContain('bind_child_sprite_resource_property');
    expect(toolNames).toContain('gdevelop_run_command');
    expect(toolNames).toContain('gdevelop_save_project_and_wait');
    expect(toolNames).toContain('save_and_relaunch_preview_paused');
  });

  it('classifies tool permissions', () => {
    expect(isWriteTool('create_scene')).toBe(true);
    expect(isWriteTool('set_project_properties')).toBe(true);
    expect(isWriteTool('set_first_layout')).toBe(true);
    expect(isWriteTool('gdevelop_get_global_config')).toBe(false);
    expect(isWriteTool('gdevelop_set_global_config')).toBe(true);
    expect(isWriteTool('gdevelop_set_global_config_value')).toBe(true);
    expect(isWriteTool('gdevelop_delete_global_config_value')).toBe(true);
    expect(isWriteTool('bulk_edit_scene_assets')).toBe(true);
    expect(isWriteTool('set_text_object_properties')).toBe(true);
    expect(isWriteTool('create_sprite_object_from_resource')).toBe(true);
    expect(isWriteTool('create_text_object')).toBe(true);
    expect(isWriteTool('add_or_update_resource')).toBe(true);
    expect(isWriteTool('replace_object_definition')).toBe(true);
    expect(isWriteTool('slice_sprite_sheet')).toBe(true);
    expect(isWriteTool('bind_sprite_animations_from_directory')).toBe(true);
    expect(isWriteTool('set_tilemap_collision_tiles')).toBe(true);
    expect(isWriteTool('patch_scene_event_instruction')).toBe(true);
    expect(isWriteTool('patch_extension_event_instruction')).toBe(true);
    expect(isWriteTool('replace_javascript_event_code')).toBe(true);
    expect(isWriteTool('delete_scene_variable')).toBe(true);
    expect(isWriteTool('batch_delete_scene_variables')).toBe(true);
    expect(isWriteTool('delete_object_variable')).toBe(true);
    expect(isWriteTool('delete_instance_variable')).toBe(true);
    expect(isWriteTool('attach_object_to_object_top')).toBe(true);
    expect(isWriteTool('read_serialized_scene')).toBe(false);
    expect(isWriteTool('inspect_project_cleanup')).toBe(false);
    expect(isWriteTool('inspect_tilemap_palette')).toBe(false);
    expect(isWriteTool('inspect_tilemap_collision')).toBe(false);
    expect(isWriteTool('check_tilemap_walkability')).toBe(false);
    expect(isWriteTool('inspect_resource_images')).toBe(false);
    expect(isWriteTool('audit_project_asset_sources')).toBe(false);
    expect(isWriteTool('compare_image_files')).toBe(false);
    expect(isWriteTool('crop_scene_object_image')).toBe(false);
    expect(isWriteTool('inspect_scene_draw_order')).toBe(false);
    expect(isWriteTool('inspect_gameplay_rules')).toBe(false);
    expect(isWriteTool('preview_health_check')).toBe(false);
    expect(isWriteTool('wait_until_preview_ready')).toBe(false);
    expect(isWriteTool('gdevelop_refresh_tool_catalog')).toBe(false);
    expect(isWriteTool('validate_events_json_file')).toBe(false);
    expect(isWriteTool('gdevelop_validate_extension_events_json')).toBe(false);
    expect(isWriteTool('lint_scene_events')).toBe(false);
    expect(isWriteTool('lint_extension_function_events')).toBe(false);
    expect(isWriteTool('gdevelop_inspect_signal_usage')).toBe(false);
    expect(isWriteTool('create_signal_emit_action')).toBe(false);
    expect(isWriteTool('create_signal_received_condition')).toBe(false);
    expect(isWriteTool('validate_current_project_json')).toBe(false);
    expect(isWriteTool('inspect_custom_object_runtime_geometry')).toBe(false);
    expect(isWriteTool('inspect_prefab_property_bindings')).toBe(false);
    expect(isWriteTool('apply_validated_project_json_patch')).toBe(true);
    expect(isWriteTool('sync_editor_from_validated_project_json')).toBe(true);
    expect(isWriteTool('gdevelop_create_or_update_extension')).toBe(true);
    expect(isWriteTool('replace_extension_function_events_from_file')).toBe(
      true
    );
    expect(isWriteTool('apply_validated_extension_patch')).toBe(true);
    expect(isWriteTool('bind_child_sprite_resource_property')).toBe(true);
    expect(isWriteTool('gdevelop_extract_prefab_from_object')).toBe(true);
    expect(isWriteTool('gdevelop_create_or_update_on_signal')).toBe(true);
    expect(isWriteTool('read_scene_events')).toBe(false);
    expect(isWriteTool('gdevelop_list_extensions')).toBe(false);
    expect(isCommandTool('gdevelop_run_command')).toBe(true);
    expect(isCommandTool('save_and_relaunch_preview_paused')).toBe(true);
    expect(isKnownMcpTool('inspect_object_properties')).toBe(true);
    expect(isKnownMcpTool('gdevelop_inspect_extension')).toBe(true);
    expect(isKnownMcpTool('find_scene_events')).toBe(true);
    expect(isKnownMcpTool('apply_validated_project_json_patch')).toBe(true);
    expect(isKnownMcpTool('replace_extension_function_events_from_file')).toBe(
      true
    );
    expect(isKnownMcpTool('save_and_relaunch_preview_paused')).toBe(true);
    expect(isKnownMcpTool('find_extension_events')).toBe(true);
    expect(isKnownMcpTool('find_project_events')).toBe(true);
    expect(isKnownMcpTool('gdevelop_inspect_signal_usage')).toBe(true);
    expect(isKnownMcpTool('create_signal_emit_action')).toBe(true);
    expect(isKnownMcpTool('create_signal_received_condition')).toBe(true);
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
      'gdevelop://project/global-config.json'
    );
    expect(getMcpResources().map(resource => resource.uri)).toContain(
      'gdevelop://scene/{sceneName}/scene.json'
    );
    expect(getMcpPrompts().map(prompt => prompt.name)).toContain(
      'implement-game-feature'
    );
  });

  it('returns examples for direct event editing and focused deletes', () => {
    const examples = getMcpToolUsageExamples('add_scene_events');
    expect(examples.add_scene_events.length).toBeGreaterThan(0);
    expect(examples.add_scene_events[0].arguments.events_json).toEqual(
      expect.any(Array)
    );
    expect(
      examples.add_scene_events.some(example => {
        const eventsJson = example.arguments && example.arguments.events_json;
        return (
          Array.isArray(eventsJson) &&
          eventsJson.some(
            event =>
              Array.isArray(event.variables) &&
              event.variables.some(
                variable => variable.name === 'DamageThisTick'
              )
          )
        );
      })
    ).toBe(true);

    expect(
      getMcpToolUsageExamples('delete_instance_variable')
        .delete_instance_variable.length
    ).toBeGreaterThan(0);
    expect(
      getMcpToolUsageExamples('replace_javascript_event_code')
        .replace_javascript_event_code.length
    ).toBeGreaterThan(0);
    expect(
      getMcpToolUsageExamples('patch_extension_event_instruction')
        .patch_extension_event_instruction.length
    ).toBeGreaterThan(0);
    expect(
      getMcpToolUsageExamples('gdevelop_create_or_update_extension_function')
        .gdevelop_create_or_update_extension_function[0].arguments
        .events_json[0].variables[0].name
    ).toBe('LocalSunCount');
    expect(
      getMcpToolUsageExamples('gdevelop_validate_extension_events_json')
        .gdevelop_validate_extension_events_json.length
    ).toBeGreaterThan(0);
    expect(
      getMcpToolUsageExamples('create_signal_emit_action')
        .create_signal_emit_action[0].arguments.target_kind
    ).toBe('scene');
    expect(
      getMcpToolUsageExamples('create_signal_received_condition')
        .create_signal_received_condition[0].arguments.signal_name
    ).toBe('Attack');
    expect(
      getMcpToolUsageExamples('gdevelop_create_or_update_on_signal')
        .gdevelop_create_or_update_on_signal[0].arguments.parent_kind
    ).toBe('object');
    expect(
      getMcpToolUsageExamples('gdevelop_create_or_update_extension_property')
        .gdevelop_create_or_update_extension_property[0].arguments.property_type
    ).toBe('Number');
    expect(
      getMcpToolUsageExamples('apply_validated_project_json_patch')
        .apply_validated_project_json_patch.length
    ).toBeGreaterThan(0);
    expect(
      getMcpToolUsageExamples('gdevelop_set_global_config_value')
        .gdevelop_set_global_config_value[0].arguments.placeholder_path
    ).toBe('{{cards.Sunflower.price}}');
    expect(
      getMcpToolUsageExamples('replace_extension_function_events_from_file')
        .replace_extension_function_events_from_file.length
    ).toBeGreaterThan(0);
    expect(
      getMcpToolUsageExamples('bind_child_sprite_resource_property')
        .bind_child_sprite_resource_property.length
    ).toBeGreaterThan(0);
    expect(
      getMcpToolUsageExamples('save_and_relaunch_preview_paused')
        .save_and_relaunch_preview_paused.length
    ).toBeGreaterThan(0);
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
