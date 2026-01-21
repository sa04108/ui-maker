import type { DesignSpecification } from './specification';

export interface GeneratedIcon {
  id: string;
  projectId: string;
  subject: string;
  svgCode: string;
  createdAt: Date;
}

export interface DesignProject {
  id: string;
  name: string;
  referenceImage: Blob;
  specification: DesignSpecification;
  generatedIcons: GeneratedIcon[];
  createdAt: Date;
  updatedAt: Date;
}
