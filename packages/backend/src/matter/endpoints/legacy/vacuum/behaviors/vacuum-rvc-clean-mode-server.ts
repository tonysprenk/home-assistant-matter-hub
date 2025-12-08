// packages/backend/src/matter/endpoints/legacy/vacuum/behaviors/vacuum-rvc-clean-mode-server.ts

import { RvcCleanMode } from "@matter/main/clusters";
import {
  RvcCleanModeServer,
  type RvcCleanModeServerImplementation,
} from "../../../../behaviors/rvc-clean-mode-server.js";

const CLEAN_MODE_VACUUM = RvcCleanMode.Mode?.Vacuum ?? 0;
const CLEAN_MODE_MOP = RvcCleanMode.Mode?.Mop ?? 1;
const CLEAN_MODE_BOTH = RvcCleanMode.Mode?.VacuumAndMop ?? 2;

// Simple in-memory mode so Matter can reflect the selected mode
let currentCleanMode: number = CLEAN_MODE_BOTH;

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
  // We keep the source of truth in currentCleanMode
  getCurrentMode: () => currentCleanMode,

  getSupportedModes: () => [
    {
      label: "Vacuum",
      mode: CLEAN_MODE_VACUUM,
      modeTags: [{ value: RvcCleanMode.ModeTag.Vacuum }],
    },
    {
      label: "Mop",
      mode: CLEAN_MODE_MOP,
      modeTags: [{ value: RvcCleanMode.ModeTag.Mop }],
    },
    {
      label: "Both",
      mode: CLEAN_MODE_BOTH,
      modeTags: [{ value: RvcCleanMode.ModeTag.VacuumAndMop }],
    },
  ],

  setMode: (newMode) => {
    currentCleanMode = newMode;

    // Map enum → human-readable option for the helper
    let option: string;
    switch (newMode) {
      case CLEAN_MODE_VACUUM:
        option = "Vacuum";
        break;
      case CLEAN_MODE_MOP:
        option = "Mop";
        break;
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
} satisfies RvcCleanModeServerImplementation);
