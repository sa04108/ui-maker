import type { DesignSpecification } from './specification';
import type { LLMModel } from './settings';

export interface GeneratedIcon {
  id: string;
  projectId: string;
  subject: string;
  svgCode: string;
  llmModel?: LLMModel;
  createdAt: Date;
}

export interface DesignProject {
  id: string;
  name: string;
  referenceImage: Blob;
  specification: DesignSpecification;
  generatedIcons: GeneratedIcon[];
  llmModel?: LLMModel;
  createdAt: Date;
  updatedAt: Date;
}
