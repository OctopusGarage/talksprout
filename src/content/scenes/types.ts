export type SceneCategory = "everyday" | "workplace" | "interview";
export interface BilingualLabel {
  zh: string;
  en: string;
}
export interface SceneGroup {
  id: string;
  category: SceneCategory;
  title: BilingualLabel;
}
export interface Scene {
  id: string;
  category: SceneCategory;
  group: string;
  title: BilingualLabel;
  context: string;
  learnerRole: string;
  partnerRole: string;
  goal: string;
  opening: string;
  spokenCue: string;
  recommendedCoachIds: string[];
  handbookUnit?: number;
}
export interface SceneSelection {
  sceneId: string;
  background: string;
  pace: "coached" | "mock";
}
