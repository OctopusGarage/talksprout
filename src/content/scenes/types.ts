export type SceneCategory =
  | "everyday"
  | "travel"
  | "services"
  | "workplace"
  | "interview";
export interface BilingualLabel {
  zh: string;
  en: string;
}
export interface SceneGroup {
  id: string;
  category: SceneCategory;
  title: BilingualLabel;
}
export type TopicActivity = "debate" | "word-game";
export interface Scene {
  id: string;
  category: SceneCategory;
  group: string;
  topicActivities: TopicActivity[];
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
