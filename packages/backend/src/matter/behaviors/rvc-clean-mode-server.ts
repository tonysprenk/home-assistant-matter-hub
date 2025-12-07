import { RvcCleanModeServer as Base } from "@matter/main/behaviors";
import { ModeBase } from "@matter/main/clusters/mode-base";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import { HomeAssistantEntityBehavior } from "./home-assistant-entity-behavior.js";

export enum RvcSupportedCleanMode {
  Vacuum = 0,
  Mop = 1,
  Both = 2,
}

export interface RvcCleanModeServerImplementation {
  getCurrentMode(): RvcSupportedCleanMode;
  getSupportedModes(): ModeBase.ModeOptionStruct[];
  setMode(newMode: RvcSupportedCleanMode): unknown;
}

/**
 * Generic RVC Clean Mode server that:
 * - exposes the current mode + supported modes to Matter
 * - calls the provided implementation whenever Matter requests a mode change
 * - gives the implementation a chance to push changes into Home Assistant
 */
export const RvcCleanModeServer = (impl: RvcCleanModeServerImplementation) =>
  Base.with<HomeAssistantEntityBehavior>({
    // From Home Assistant → Matter
    updateFromHomeAssistant(state, _haEntity) {
      // For now we treat Matter as the source of truth for the clean mode.
      // If you later want HA to drive the mode, you can read attributes from
      // _haEntity here and patch the state accordingly.
      return state;
    },

    // Called when the endpoint is created
    async initialize(_endpoint, matterServer) {
      const currentMode = impl.getCurrentMode();
      const supportedModes = impl.getSupportedModes();

      applyPatchState(matterServer, {
        currentMode,
        supportedModes,
      });
    },

    // From Matter → Home Assistant
    async changeToMode(_endpoint, matterServer, request) {
      const newMode = request.newMode as RvcSupportedCleanMode;

      // Let the implementation handle any HA actions, scripts, helpers, etc.
      const action = impl.setMode(newMode);

      // Reflect the new mode in the Matter state
      applyPatchState(matterServer, {
        currentMode: newMode,
      });

      // The returned value is passed back to the caller (and in HA’s case
      // can be used to trigger automations based on this metadata).
      return action;
    },
  });
