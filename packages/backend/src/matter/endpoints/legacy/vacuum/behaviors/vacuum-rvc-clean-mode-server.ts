// packages/backend/src/matter/endpoints/legacy/vacuum/behaviors/vacuum-rvc-clean-mode-server.ts

import {
  RvcCleanModeServer,
  RvcSupportedCleanMode,
} from "../../../../behaviors/rvc-clean-mode-server.js";

// Simple in-memory mode so Matter can reflect the selected mode.
let currentCleanMode: RvcSupportedCleanMode = RvcSupportedCleanMode.Both;

export const VacuumRvcCleanModeServer = RvcCleanModeServer({
  // Matter → HA (state reporting)
  getCurrentMode: () => currentCleanMode,

  getSupportedModes: () => [
    {
      label: "Vacuum",
      mode: RvcSupportedCleanMode.Vacuum,
      // We intentionally leave modeTags as an empty array; the cluster will
      // still behave correctly and we avoid relying on RvcCleanMode.ModeTag,
      // whose exact values differ by Matter version.
      modeTags: [],
    },
    {
      label: "Mop",
      mode: RvcSupportedCleanMode.Mop,
      modeTags: [],
    },
    {
      label: "Both",
      mode: RvcSupportedCleanMode.Both,
      modeTags: [],
    },
  ],

  // HA side-effect when Matter client changes the clean mode
  setMode: (newMode) => {
    currentCleanMode = newMode as RvcSupportedCleanMode;

    let option: string;
    switch (currentCleanMode) {
      case RvcSupportedCleanMode.Vacuum:
        option = "Vacuum";
        break;
      case RvcSupportedCleanMode.Mop:
        option = "Mop";
        break;
      // Treat "Both" and anything unknown as "Both"
      case RvcSupportedCleanMode.Both:
      default:
        option = "Both";
        break;
    }

    // This mirrors the style of other behaviors in the repo:
    // the return value is a "callAction" descriptor that the
    // HomeAssistantEntityBehavior will execute.
    return {
      action: "input_select.select_option",
      data: {
        entity_id: "input_select.rvc_clean_mode",
        option,
      },
    };
  },
});
