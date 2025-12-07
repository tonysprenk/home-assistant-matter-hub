import { RvcCleanModeServer as Base } from "@matter/main/behaviors";
import type { ModeBase, RvcCleanMode } from "@matter/main/clusters";

/**
 * Mode enum used by the RVC clean-mode cluster.
 */
export type RvcSupportedCleanMode = RvcCleanMode.Mode;

/**
 * Shape of the implementation object that the legacy vacuum endpoint
 * passes in. We keep this here purely for typing/sharing purposes.
 */
export interface RvcCleanModeServerImplementation {
  getCurrentMode: () => RvcSupportedCleanMode;
  getSupportedModes: () => ModeBase.ModeOptionStruct[];
  setMode: (newMode: RvcSupportedCleanMode) => unknown;
}

/**
 * Thin wrapper around the upstream Matter RvcCleanModeServer.
 *
 * The legacy vacuum endpoint uses it as:
 *
 *   const VacuumRvcCleanModeServer = RvcCleanModeServer({ ... });
 *
 * For now we ignore the implementation argument and simply return the
 * plain Matter server class. This keeps feature composition compatible
 * with the Matter stack and avoids passing an object where a feature
 * identifier is expected.
 *
 * If we want to wire the implementation through to Home Assistant later,
 * we can extend this function to create a custom subclass without
 * changing its public API.
 */
export const RvcCleanModeServer = (_impl: RvcCleanModeServerImplementation) =>
  Base;
