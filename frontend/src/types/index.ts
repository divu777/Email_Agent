export interface FeatureDetail {
    title: string;
    content: string;
  }
  
  export interface Feature {
    id: number;
    title: string;
    description: string;
    image: string;
    details: FeatureDetail[];
  }