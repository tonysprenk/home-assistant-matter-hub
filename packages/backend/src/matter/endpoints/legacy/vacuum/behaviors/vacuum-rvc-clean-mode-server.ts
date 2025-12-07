import { RvcCleanMode } from "@matter/main/clusters";
import {
  RvcCleanModeServer,
  RvcSupportedCleanMode,
} from "../../../../behaviors/rvc-clean-mode-server.js";

// simple in-memory mode so Matter can reflect the selected mode
let currentCleanMode: RvcSupportedCleanMode = RvcSupportedCleanMode.Both;

export const VacuumRvcCleanModeServer = RvcCleanModeServer({
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

    // 🔧 ADJUST THESE service names / data to whatever
    // your Dreame / vacuum integration actually uses.
    const entity_id = "vacuum.x40_ultra_complete";

    switch (currentCleanMode) {
      case RvcSupportedCleanMode.Vacuum:
        return {
          action: "vacuum.send_command",
          data: {
            entity_id,
            command: "set_clean_mode",
            params: { mode: "vacuum" },
          },
        };

      case RvcSupportedCleanMode.Mop:
        return {
          action: "vacuum.send_command",
          data: {
            entity_id,
            command: "set_clean_mode",
            params: { mode: "mop" },
          },
        };

      case RvcSupportedCleanMode.Both:
      default:
        return {
          action: "vacuum.send_command",
          data: {
            entity_id,
            command: "set_clean_mode",
            params: { mode: "both" },
          },
        };
    }
  },
});
