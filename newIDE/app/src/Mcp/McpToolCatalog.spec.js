// @flow

import {
  canCallMcpTool,
  getAllMcpToolsForIntrospection,
  getCapabilitiesSummary,
  getMcpPrompts,
  getMcpResources,
  getMcpToolUsageExamples,
  getMcpTools,
  isCommandTool,
  isKnownMcpTool,
  isWriteTool,
} from './McpToolCatalog';

const expectedAlwaysAvailableTools = [
  'open_project',
  'gdevelop_get_editor_state',
  'gdevelop_get_editor_selection',
  'gdevelop_get_project_summary',
  'gdevelop_inspect_signal_usage',
  'gdevelop_list_scenes',
  'gdevelop_list_objects',
  'generate-catalogs',
  'validate_project_files',
  'inspect_tool_schema',
  'get_tool_usage_examples',
  'reload_project',
  'launch_preview',
  'wait_until_preview_ready',
  'preview_health_check',
  'gdevelop_inspect_running_preview',
  'run_frames',
  'verify_project_change',
  'simulate_preview_input',
  'control_preview',
  'set_runtime_state',
  'capture_preview_screenshot',
].sort();

const expectedAlwaysAvailableWriteTools = ['import_extension'];

describe('McpToolCatalog', () => {
  it('publishes the exact file-first tool surface under all permissions', () => {
    const withoutPermissions = getMcpTools({
      allowWriteTools: false,
      allowCommandTools: false,
    });
    const withPermissions = getMcpTools({
      allowWriteTools: true,
      allowCommandTools: true,
    });

    expect(withoutPermissions.map(tool => tool.name).sort()).toEqual(
      [
        ...expectedAlwaysAvailableTools,
        ...expectedAlwaysAvailableWriteTools,
      ].sort()
    );
    expect(withPermissions.map(tool => tool.name).sort()).toEqual(
      [
        ...expectedAlwaysAvailableTools,
        ...expectedAlwaysAvailableWriteTools,
      ].sort()
    );
    expect(
      getAllMcpToolsForIntrospection()
        .map(tool => tool.name)
        .sort()
    ).toEqual(
      [
        ...expectedAlwaysAvailableTools,
        ...expectedAlwaysAvailableWriteTools,
      ].sort()
    );
    expect(isWriteTool('import_extension')).toBe(true);
    expect(
      canCallMcpTool('import_extension', {
        allowWriteTools: false,
        allowCommandTools: false,
      })
    ).toEqual({ canCall: true });
  });

  it('does not expose project authoring, save, command, or escape-hatch tools', () => {
    [
      'gdevelop_editor_call',
      'gdevelop_run_command',
      'gdevelop_save_project_and_wait',
      'save_and_relaunch_preview_paused',
      'create_scene',
      'bulk_edit_scene_assets',
      'add_scene_events',
      'gdevelop_search_instruction_metadata',
      'gdevelop_get_instruction_metadata',
      'apply_validated_project_json_patch',
      'validate_current_project_json',
      'gdevelop_capabilities',
      'gdevelop_refresh_tool_catalog',
      'gdevelop_get_static_data',
      'gdevelop_set_static_data',
      'gdevelop_set_static_data_value',
      'gdevelop_delete_static_data_value',
      'gdevelop_get_constants',
      'gdevelop_set_constants',
      'gdevelop_set_constants_value',
      'gdevelop_delete_constants_value',
      'create_action',
      'create_signal_emit_action',
      'create_signal_subscription_action',
      'create_signal_received_condition',
      'gdevelop_create_or_update_on_signal',
    ].forEach(name => {
      expect(isKnownMcpTool(name)).toBe(false);
      expect(isWriteTool(name)).toBe(false);
      expect(isCommandTool(name)).toBe(false);
      expect(
        canCallMcpTool(name, {
          allowWriteTools: true,
          allowCommandTools: true,
        })
      ).toEqual({ canCall: false, reason: `Unknown MCP tool: ${name}.` });
      expect(getMcpToolUsageExamples(name)[name]).toEqual([]);
    });
    expect(
      JSON.stringify(
        getMcpTools({ allowWriteTools: true, allowCommandTools: true })
      )
    ).not.toContain('save_and_relaunch_preview_paused');
  });

  it('describes the file-first boundary in capabilities', () => {
    const capabilities = getCapabilitiesSummary({
      allowWriteTools: true,
      allowCommandTools: true,
    });
    expect(Object.keys(capabilities.categories).sort()).toEqual([
      'Editor queries',
      'Extension import',
      'Preview runtime',
      'Project opening',
      'Project-file validation',
      'Tool discovery',
    ]);
    expect(capabilities.note).toContain('project files');
    expect(capabilities.note).toContain('instructions-catalog.json');
    expect(capabilities.note).toContain('settings-catalog.json');
    expect(capabilities.note).toContain('layout-catalog.json');
    expect(
      capabilities.categories['Project-file validation'].map(tool => tool.name)
    ).toContain('reload_project');
  });

  it('exposes open_project as an always-available destructive synchronization tool', () => {
    const tool = getMcpTools({
      allowWriteTools: false,
      allowCommandTools: false,
    }).find(tool => tool.name === 'open_project');

    expect(tool).toEqual(
      expect.objectContaining({
        inputSchema: expect.objectContaining({
          required: ['project_path'],
          additionalProperties: false,
          properties: expect.objectContaining({
            project_path: expect.objectContaining({ type: 'string' }),
            discard_unsaved_changes: expect.objectContaining({
              type: 'boolean',
            }),
          }),
        }),
        annotations: expect.objectContaining({
          readOnlyHint: false,
          destructiveHint: true,
          idempotentHint: true,
        }),
      })
    );
    expect(
      canCallMcpTool('open_project', {
        allowWriteTools: false,
        allowCommandTools: false,
      })
    ).toEqual({ canCall: true });
    expect(getMcpToolUsageExamples('open_project').open_project).toHaveLength(
      2
    );
  });

  it('marks reload_project as an always-available destructive synchronization tool', () => {
    const tool = getMcpTools({
      allowWriteTools: false,
      allowCommandTools: false,
    }).find(tool => tool.name === 'reload_project');

    expect(tool).toEqual(
      expect.objectContaining({
        annotations: expect.objectContaining({
          readOnlyHint: false,
          destructiveHint: true,
          idempotentHint: true,
        }),
      })
    );
    if (!tool) throw new Error('reload_project tool is missing.');
    expect(tool.description).toContain('regenerate');
    expect(tool.description).toContain('operation_id');
    expect(tool.description).toContain('mode:"start"');
    expect(tool.description).toContain('mode:"status"');
    expect(tool.inputSchema).toEqual(
      expect.objectContaining({
        additionalProperties: false,
        properties: expect.objectContaining({
          timeout_ms: expect.objectContaining({ maximum: 600000 }),
          operation_id: expect.objectContaining({ type: 'string' }),
          mode: expect.objectContaining({
            enum: ['wait', 'start', 'status'],
          }),
        }),
      })
    );
    expect(
      canCallMcpTool('reload_project', {
        allowWriteTools: false,
        allowCommandTools: false,
      })
    ).toEqual({ canCall: true });
  });

  it('exposes generate-catalogs as an awaited, non-destructive catalog write', () => {
    const tool = getMcpTools({
      allowWriteTools: false,
      allowCommandTools: false,
    }).find(tool => tool.name === 'generate-catalogs');

    expect(tool).toEqual(
      expect.objectContaining({
        inputSchema: expect.objectContaining({
          type: 'object',
          additionalProperties: false,
        }),
        annotations: expect.objectContaining({
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: true,
        }),
      })
    );
    expect(tool.description).toContain('all five generated authoring files');
    expect(tool.description).toContain('runtime-api.d.ts');
    expect(tool.description).toContain('project-api.d.ts');
    expect(
      canCallMcpTool('generate-catalogs', {
        allowWriteTools: false,
        allowCommandTools: false,
      })
    ).toEqual({ canCall: true });
  });

  it('exposes validate_project_files as a no-input catalog-regenerating validation gate', () => {
    const tool = getMcpTools({
      allowWriteTools: false,
      allowCommandTools: false,
    }).find(tool => tool.name === 'validate_project_files');

    expect(tool).toEqual(
      expect.objectContaining({
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
        annotations: expect.objectContaining({
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: true,
        }),
      })
    );
    expect(tool.description).toContain('game.json');
    expect(tool.description).toContain('regenerate all');
    expect(tool.description).toContain('JavaScript authoring-API');
    expect(tool.description).toContain('before reload_project');
    expect(
      canCallMcpTool('validate_project_files', {
        allowWriteTools: false,
        allowCommandTools: false,
      })
    ).toEqual({ canCall: true });
  });

  it('keeps only compact editor resources and debug prompts', () => {
    expect(getMcpResources().map(resource => resource.uri)).toEqual([
      'gdevelop://editor/state',
      'gdevelop://project/summary',
    ]);
    expect(getMcpPrompts().map(prompt => prompt.name)).toEqual([
      'inspect-current-game',
      'debug-preview',
    ]);
  });
});
