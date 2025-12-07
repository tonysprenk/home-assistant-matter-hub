import { RvcCleanMode } from "@matter/main/clusters";
import {
  RvcCleanModeServer,
  RvcSupportedCleanMode,
} from "../../../../behaviors/rvc-clean-mode-server.js";

// simple in-memory mode so Matter can reflect the selected mode
let currentCleanMode: RvcSupportedCleanMode = RvcSupportedCleanMode.Both;

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
      mode: RvcSupportedCleanMode.Vacuum,
      modeTags: [{ value: RvcCleanMode.ModeTag.Vacuum }],
    },
    {
      label: "Mop",
      mode: RvcSupportedCleanMode.Mop,
      modeTags: [{ value: RvcCleanMode.ModeTag.Mop }],
    },
    {
      label: "Both",
      mode: RvcSupportedCleanMode.Both,
      modeTags: [{ value: RvcCleanMode.ModeTag.VacuumAndMop }],
    },
  ],

  setMode: (newMode) => {
    currentCleanMode = newMode as RvcSupportedCleanMode;

    // Map enum → human-readable option for the helper
    let option: string;
    switch (currentCleanMode) {
      case RvcSupportedCleanMode.Vacuum:
        option = "Vacuum";
        break;
      case RvcSupportedCleanMode.Mop:
        option = "Mop";
        break;
      case RvcSupportedCleanMode.Both:
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
