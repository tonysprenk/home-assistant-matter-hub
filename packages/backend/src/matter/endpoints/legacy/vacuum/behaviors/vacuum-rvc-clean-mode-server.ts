import { RvcCleanMode } from "@matter/main/clusters";
import {
  RvcCleanModeServer,
  RvcSupportedCleanMode,
} from "../../../../behaviors/rvc-clean-mode-server.js";

// Simple in-memory mode so Matter can reflect the selected mode
let currentCleanMode: RvcSupportedCleanMode = RvcCleanMode.Mode.Both;

/**
 * NOTE:
 * - This example assumes you create an input_select in HA:
 *     input_select.rvc_clean_mode
 *   with options: "Vacuum", "Mop", "Both".
 * - You can then use an automation/script in HA that reacts to changes of this
 *   input_select and actually calls your Roborock / vacuum services.
 *
 *   That way the Matter add-on stays generic and the integration-specific
 *   logic lives in HA where it belongs.
 */
export const VacuumRvcCleanModeServer = RvcCleanModeServer({
  // we keep the source of truth in currentCleanMode
  getCurrentMode: () => currentCleanMode,

  getSupportedModes: () => [
    {
      label: "Vacuum",
      mode: RvcCleanMode.Mode.Vacuum,
      modeTags: [{ value: RvcCleanMode.ModeTag.Vacuum }],
    },
    {
      label: "Mop",
      mode: RvcCleanMode.Mode.Mop,
      modeTags: [{ value: RvcCleanMode.ModeTag.Mop }],
    },
    {
      label: "Both",
      mode: RvcCleanMode.Mode.Both,
      modeTags: [{ value: RvcCleanMode.ModeTag.VacuumAndMop }],
    },
  ],

  setMode: (newMode) => {
    currentCleanMode = newMode as RvcSupportedCleanMode;

    // Map enum → human-readable option for the helper
    let option: string;
    switch (currentCleanMode) {
      case RvcCleanMode.Mode.Vacuum:
        option = "Vacuum";
        break;
      case RvcCleanMode.Mode.Mop:
        option = "Mop";
        break;
      case RvcCleanMode.Mode.Both:
      default:
        option = "Both";
        break;
    }

    // HA action: you can change the entity_id or service here if you prefer
    return {
      action: "input_select.select_option",
      data: {
        entity_id: "input_select.rvc_clean_mode",
        option,
      },
    };
  },
});
