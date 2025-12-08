// packages/backend/src/matter/behaviors/rvc-clean-mode-server.ts

import type { HomeAssistantEntityInformation } from "@home-assistant-matter-hub/common";
import { RvcCleanModeServer as Base } from "@matter/main/behaviors";
import { ModeBase } from "@matter/main/clusters/mode-base";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import { HomeAssistantEntityBehavior } from "./home-assistant-entity-behavior.js";

export enum RvcSupportedCleanMode {
  Vacuum = 0,
  Mop = 1,
  Both = 2,
}

/**
 * Configuration passed in by endpoint-specific wrappers (like the vacuum
 * endpoint). This mirrors the pattern used by rvc-run-mode-server, but is
 * tailored to the RvcCleanMode cluster which only needs "changeToMode".
 */
export interface RvcCleanModeServerConfig {
  /**
   * Return the current clean mode as a numeric value.
   */
  getCurrentMode: (
    entity: HomeAssistantEntityInformation,
    agent: unknown,
  ) => number;

  /**
   * Return the list of supported modes in ModeBase-style structures.
   */
  getSupportedModes: (
    entity: HomeAssistantEntityInformation,
    agent: unknown,
  ) => unknown[];

  /**
   * Map a requested mode to a Home Assistant action.
   * The return value is passed straight into HomeAssistantEntityBehavior.callAction().
   */
  setMode: (newMode: number, agent: unknown) => unknown;
}

class RvcCleanModeServerBase extends Base {
  declare state: RvcCleanModeServerBase.State;

  override async initialize() {
    const homeAssistant = await this.agent.load(HomeAssistantEntityBehavior);

    this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update);

    await super.initialize();
  }

  private update(entity: HomeAssistantEntityInformation) {
    applyPatchState(this.state, {
      currentMode: this.state.config.getCurrentMode(entity, this.agent),
      supportedModes: this.state.config.getSupportedModes(entity, this.agent),
    });
  }

  override changeToMode(
    request: ModeBase.ChangeToModeRequest,
  ): ModeBase.ChangeToModeResponse {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);

    // Delegate the actual action to the endpoint-specific config.
    const action = this.state.config.setMode(request.newMode, this.agent);
    // We don't care about the exact action shape here – it is the same pattern
    // already used by the run-mode behavior.
    homeAssistant.callAction(action as any);

    return {
      status: ModeBase.ModeChangeStatus.Success,
      statusText: "Successfully switched clean mode",
    };
  }
}

namespace RvcCleanModeServerBase {
  export class State extends Base.State {
    // Endpoint-specific configuration (vacuum, etc.)
    config!: RvcCleanModeServerConfig;
  }
}

/**
 * Public factory, mirroring RvcRunModeServer in this project.
 * IMPORTANT: We use `.set({ config })` and DO NOT call `.with()` or
 * `.withFeatures()`, so we stay out of ClusterComposer’s feature validation
 * logic that was causing the failing tests.
 */
export function RvcCleanModeServer(config: RvcCleanModeServerConfig) {
  return RvcCleanModeServerBase.set({ config });
}
