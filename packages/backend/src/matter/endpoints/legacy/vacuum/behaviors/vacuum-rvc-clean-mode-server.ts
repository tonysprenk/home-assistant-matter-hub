// packages/backend/src/matter/endpoints/legacy/vacuum/behaviors/vacuum-rvc-clean-mode-server.ts

import { RvcCleanModeServer } from "../../../../behaviors/rvc-clean-mode-server.js";

/**
 * For now we simply expose the raw RvcCleanModeServer behavior for
 * robotic vacuums.
 *
 * This ensures:
 * - the legacy vacuum endpoint wires in the rvcCleanMode cluster,
 * - create-legacy-endpoint-type tests see a valid cluster server,
 * - and we avoid custom feature wiring that was tripping the
 *   ClusterComposer ("invalid feature identifier", etc.).
 *
 * If we later want to map clean mode changes to Home Assistant
 * services (e.g. input_select for Vacuum / Mop / Both), we can add
 * a dedicated layer on top of this without changing the library-level
 * behavior again.
 */
export const VacuumRvcCleanModeServer = RvcCleanModeServer;
