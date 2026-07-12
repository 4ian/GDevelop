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
  'gdevelop_get_editor_state',
  'gdevelop_get_editor_selection',
  'gdevelop_get_project_summary',
  'gdevelop_list_scenes',
  'gdevelop_list_objects',
  'validate_current_project_json',
  'inspect_tool_schema',
  'get_tool_usage_examples',
  'gdevelop_capabilities',
  'gdevelop_refresh_tool_catalog',
  'reload_project',
  'launch_preview',
  'wait_until_preview_ready',
  'preview_health_check',
  'gdevelop_inspect_running_preview',
  'run_frames',
  'simulate_preview_input',
  'control_preview',
  'set_runtime_state',
  'capture_preview_screenshot',
].sort();

const expectedWriteTools = ['import_extension'];

describe('McpToolCatalog', () => {
  it('always exposes only the bounded extension importer from write tools', () => {
    const withoutPermissions = getMcpTools({
      allowWriteTools: false,
      allowCommandTools: false,
    });
    const withPermissions = getMcpTools({
      allowWriteTools: true,
      allowCommandTools: true,
    });

    expect(withoutPermissions.map(tool => tool.name).sort()).toEqual(
      [...expectedAlwaysAvailableTools, ...expectedWriteTools].sort()
    );
    expect(withPermissions.map(tool => tool.name).sort()).toEqual(
      [...expectedAlwaysAvailableTools, ...expectedWriteTools].sort()
    );
    expect(
      getAllMcpToolsForIntrospection()
        .map(tool => tool.name)
        .sort()
    ).toEqual([...expectedAlwaysAvailableTools, ...expectedWriteTools].sort());
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
  });

  it('describes the file-first boundary in capabilities', () => {
    const capabilities = getCapabilitiesSummary({
      allowWriteTools: true,
      allowCommandTools: true,
    });
    expect(Object.keys(capabilities.categories).sort()).toEqual([
      'Editor queries',
      'Extension import',
      'Preview debugging',
    ]);
    expect(capabilities.note).toContain('project files');
    expect(capabilities.note).toContain('instructions-catalog.json');
    expect(capabilities.note).toContain('settings-catalog.json');
    expect(capabilities.note).toContain('layout-catalog.json');
    expect(
      capabilities.categories['Preview debugging'].map(tool => tool.name)
    ).toContain('reload_project');
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
    expect(
      canCallMcpTool('reload_project', {
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
