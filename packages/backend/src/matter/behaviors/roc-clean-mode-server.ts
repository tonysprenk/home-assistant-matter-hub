import type { HomeAssistantEntityInformation } from "@home-assistant-matter-hub/common";
import { RvcCleanModeServer as Base } from "@matter/main/behaviors";
import { ModeBase } from "@matter/main/clusters/mode-base";
import type { RvcCleanMode } from "@matter/main/clusters/rvc-clean-mode";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import { HomeAssistantEntityBehavior } from "./home-assistant-entity-behavior.js";
import type { ValueGetter, ValueSetter } from "./utils/cluster-config.js";

export enum RvcSupportedCleanMode {
  Vacuum = 0,
  Mop = 1,
  Both = 2,
}

export interface RvcCleanModeServerConfig {
  // read current mode from HA (or internal state)
  getCurrentMode: ValueGetter;
  // list of supported modes
  getSupportedModes: ValueGetter;
  // called when controller changes mode
  setMode: ValueSetter;
}

// biome-ignore lint/correctness/noUnusedVariables:
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
      currentMode: this.state.config.getCurrentMode(entity.state, this.agent),
      supportedModes: this.state.config.getSupportedModes(
        entity.state,
        this.agent,
      ),
    });
  }

  override changeToMode(
    request: ModeBase.ChangeToModeRequest,
  ): ModeBase.ChangeToModeResponse {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);

    // delegate to the configured setter
    homeAssistant.callAction(
      this.state.config.setMode(request.newMode, this.agent),
    );

    return {
      status: ModeBase.ModeChangeStatus.Success,
      statusText: "Successfully changed clean mode",
    };
  }
}

namespace RvcCleanModeServerBase {
  export class State extends Base.State {
    config!: RvcCleanModeServerConfig;
  }
}

export function RvcCleanModeServer(config: RvcCleanModeServerConfig) {
  return RvcCleanModeServerBase.set({ config });
}
