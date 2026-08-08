// @flow
import Window from '../Utils/Window';

/**
 * Gameplay tests are still under development: the UI (project manager and
 * extension editor sections, command palette commands) and the AI tools
 * version exposing them (v14) are only enabled in development, so the editor
 * can be deployed without the feature being visible.
 */
export const areGameplayTestsEnabled = (): boolean => Window.isDev();
