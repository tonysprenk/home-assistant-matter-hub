// packages/common/src/clusters/rvc-clean-mode.ts

export interface RvcCleanModeClusterState {
  supportedModes: {
    label: string;
    mode: number;
    modeTags: unknown;
  }[];
  currentMode: number;
}
