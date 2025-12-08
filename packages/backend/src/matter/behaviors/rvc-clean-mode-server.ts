// packages/backend/src/matter/behaviors/rvc-clean-mode-server.ts

import { RvcCleanModeServer as Base } from "@matter/main/behaviors";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import type { HomeAssistantEntityBehavior } from "./home-assistant-entity-behavior.js";

/**
 * Very small wrapper around the Matter RvcCleanModeServer that lets
 * endpoint-specific code provide:
 *
 * - a HA → Matter sync hook (`getStateFromHomeAssistant`)
 * - an optional Matter → HA hook (`setMode`)
 *
 * We deliberately avoid depending on the exact @matter/types
 * cluster state typings here and use `unknown`/`any` where needed.
 */
export interface RvcCleanModeServerImplementation {
  /**
   * HA → Matter: compute the clean-mode related state from the
   * Home Assistant entity.
   *
   * You can return `currentMode`, `supportedModes`, or both.
   */
  getStateFromHomeAssistant(
    haEntity: HomeAssistantEntityBehavior.State["entity"],
  ): { currentMode?: number; supportedModes?: unknown[] } | undefined;

  /**
   * Matter → HA: optional hook when a Matter controller changes
   * the clean mode. The underlying cluster code will look for
   * `state.config.setMode?.(newMode)`.
   */
  setMode?(newMode: number): unknown | Promise<unknown>;
}

/**
 * To stay compatible with the @matter/types version used in this project,
 * we call `.with()` with an **empty feature list** (`[]`), so the cluster
 * composer does not try to interpret our behavior spec as a feature
 * identifier (which previously caused the `"[object Object] is not a valid
 * feature identifier"` error).
 */
export const RvcCleanModeServer = (
  impl: RvcCleanModeServerImplementation,
) =>
  // We intentionally cast Base to `any` to avoid fighting the generic
  // signature of `.with()` from @matter/node here.
  (Base as any).with<HomeAssistantEntityBehavior>([], {
    // Home Assistant → Matter
    updateFromHomeAssistant(state: unknown, haEntity: unknown) {
      if (!haEntity) return;

      const patch = impl.getStateFromHomeAssistant(
        haEntity as HomeAssistantEntityBehavior.State["entity"],
      );
      if (!patch) return;

      applyPatchState(state as any, patch as any);
    },

    // Store the implementation under `state.config` so the underlying
    // base behavior can call `config.setMode?.(...)` when a controller
    // changes the clean mode.
    initializeClusterState(state: unknown) {
      (state as any).config = impl;
    },
  });
