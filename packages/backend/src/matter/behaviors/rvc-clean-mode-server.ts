// packages/backend/src/matter/behaviors/rvc-clean-mode-server.ts

import { RvcCleanModeServer as Base } from "@matter/main/behaviors";

/**
 * Thin wrapper around the upstream RvcCleanModeServer behavior.
 *
 * We keep this file so that:
 * - the backend has a stable place to import the server from, and
 * - tests that enumerate cluster IDs & behaviors see a matching server
 *   implementation for the rvcCleanMode cluster.
 *
 * We intentionally do **not** change any of the behavior's features here,
 * to avoid running into "invalid feature identifier" errors from the
 * bump ClusterComposer used in @matter/types.
 */

// Re-export the upstream behavior unchanged
export const RvcCleanModeServer = Base;

/**
 * Simple alias for the clean mode numeric identifier.
 *
 * This keeps the public API compatible with the earlier version where
 * we exposed a RvcSupportedCleanMode type, without constraining it to
 * a specific enum structure from @matter/types.
 */
export type RvcSupportedCleanMode = number;
