// packages/backend/src/matter/behaviors/rvc-clean-mode-server.ts

import { RvcCleanModeServer as Base } from "@matter/main/behaviors";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import { HomeAssistantEntityBehavior } from "./home-assistant-entity-behavior.js";

/**
 * For the backend we keep this intentionally generic and do **not**
 * depend on the internal enum types from @matter/types.
 *
 * The concrete mode values are treated as simple numeric codes.
 */
export type RvcSupportedCleanMode = number;

export interface RvcCleanModeServerImplementation {
  /**
   * Return the currently active clean mode as a numeric code.
   */
  getCurrentMode: () => RvcSupportedCleanMode;

  /**
   * Return the full list of supported modes that should be exposed
   * to the Matter RvcCleanMode cluster.
   */
  getSupportedModes: () => {
    label: string;
    mode: RvcSupportedCleanMode;
    modeTags: unknown;
  }[];

  /**
   * Called when Matter requests a mode change.
   * The implementation is responsible for mapping this to Home Assistant
   * (e.g. calling a script, changing an input_select, etc.).
   */
  setMode: (newMode: RvcSupportedCleanMode) => unknown | Promise<unknown>;
}

/**
 * Thin adapter that wires a generic implementation into the
 * Matter RvcCleanModeServer behavior.
 *
 * We avoid referring to RvcCleanMode.Mode or ModeBase.ModeOptionStruct here
 * to stay compatible with the @matter/types version used by this project.
 */
export const RvcCleanModeServer = (
  impl: RvcCleanModeServerImplementation,
) =>
  Base.with<HomeAssistantEntityBehavior>({
    // From Home Assistant → Matter
    updateFromHomeAssistant(state, _haEntity) {
      const currentMode = impl.getCurrentMode();
      const supportedModes = impl.getSupportedModes();

      return applyPatchState(state, {
        supportedModes,
        currentMode,
      });
    },

    // From Matter → Home Assistant
    async updateToHomeAssistant(_haEntity, { attributes }) {
      const mode = attributes.currentMode;
      if (mode === undefined || mode === null) {
        return;
      }

      await impl.setMode(mode as RvcSupportedCleanMode);
    },
  });
