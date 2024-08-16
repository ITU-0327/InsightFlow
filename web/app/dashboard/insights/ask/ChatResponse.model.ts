import { InsightNote } from "../insight.model";

export interface ChatResponse {
  metadata: InsightNote[] | undefined;
  response: string;
}
