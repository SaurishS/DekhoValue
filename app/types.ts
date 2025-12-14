export interface Item {
  name: string;
  category: string;
  condition: string;
  estimated_price_inr: number;
  risk_factor: "Low" | "Medium" | "High";
}

export interface AnalysisResult {
  items: Item[];
  total_value: number;
  recommended_coverage: number;
}
