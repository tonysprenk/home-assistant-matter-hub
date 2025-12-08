// packages/backend/src/matter/endpoints/legacy/vacuum/behaviors/vacuum-rvc-clean-mode-server.ts

import { RvcCleanModeServer } from "../../../../behaviors/rvc-clean-mode-server.js";

// Simple numeric codes for the clean modes
const CLEAN_MODE_VACUUM = 0;
const CLEAN_MODE_MOP = 1;
const CLEAN_MODE_BOTH = 2;

// Simple in-memory mode so Matter can reflect the selected mode
let currentCleanMode = CLEAN_MODE_BOTH;

const SUPPORTED_MODES = [
  {
    label: "Vacuum",
    mode: CLEAN_MODE_VACUUM,
    // Empty tags are fine; we don’t rely on them
    modeTags: [] as unknown[],
  },
  {
    label: "Mop",
    mode: CLEAN_MODE_MOP,
    modeTags: [] as unknown[],
  },
  {
    label: "Both",
    mode: CLEAN_MODE_BOTH,
    modeTags: [] as unknown[],
  },
];

/**
 * Vacuum-specific RVC Clean Mode server.
 *
 * - Matter → HA:
 *   When a controller changes the mode, we update our in-memory
 *   `currentCleanMode` and return an HA action that sets the
 *   `input_select.rvc_clean_mode` helper to "Vacuum" | "Mop" | "Both".
 *
 * - HA → Matter:
 *   For now, we simply expose the in-memory `currentCleanMode` and
 *   our static SUPPORTED_MODES back to Matter.
 */
export const VacuumRvcCleanModeServer = RvcCleanModeServer({
  // HA → Matter: for now we ignore the HA entity and just expose our
  // local state so Matter controllers see the current mode + options.
  getStateFromHomeAssistant(_haEntity) {
    return {
      currentMode: currentCleanMode,
      supportedModes: SUPPORTED_MODES,
    };
  },

  // Matter → HA: called when a Matter controller changes the mode.
  setMode(newMode: number) {
    currentCleanMode = newMode;

    let option: string;
    switch (newMode) {
      case CLEAN_MODE_VACUUM:
        option = "Vacuum";
        break;
      case CLEAN_MODE_MOP:
        option = "Mop";
        break;
      case CLEAN_MODE_BOTH:
      default:
        option = "Both";
        break;
    }

    // Home Assistant action description:
    // you can adapt the entity_id if you prefer a different helper name.
    return {
      action: "input_select.select_option",
      data: {
        entity_id: "input_select.rvc_clean_mode",
        option,
      },
    };
  },
});
