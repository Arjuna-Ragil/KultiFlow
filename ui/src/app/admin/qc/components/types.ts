export interface BoundingBox {
  id: string;
  name: string;
  type: "fresh" | "defect";
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface QCScanHistory {
  id: string;
  timestamp: string;
  fruitType: string;
  fruitSubtype: string;
  result: "Fresh" | "Bruised (Reject)";
  passCount: number;
  defectCount: number;
  thumbnailUrl: string;
}

export interface RecentDetection {
  id: string;
  name: string;
  code: string;
  status: "Fresh" | "Defect";
  confidence: number;
  time: string;
}
