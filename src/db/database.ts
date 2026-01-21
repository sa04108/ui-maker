import Dexie, { type EntityTable } from 'dexie';
import type { DesignProject, GeneratedIcon, Settings } from '@/types';
import type { DesignSpecification } from '@/types/specification';

// DB에 저장할 때는 Date를 number로 변환
interface DBDesignSpecification extends Omit<DesignSpecification, 'createdAt' | 'updatedAt'> {
  createdAt: number;
  updatedAt: number;
}

interface DBGeneratedIcon extends Omit<GeneratedIcon, 'createdAt'> {
  createdAt: number;
}

interface DBDesignProject extends Omit<DesignProject, 'specification' | 'generatedIcons' | 'createdAt' | 'updatedAt'> {
  specification: DBDesignSpecification;
  generatedIcons: DBGeneratedIcon[];
  createdAt: number;
  updatedAt: number;
}

class UIMakerDB extends Dexie {
  projects!: EntityTable<DBDesignProject, 'id'>;
  settings!: EntityTable<Settings, 'id'>;

  constructor() {
    super('ui-maker-db');
    this.version(1).stores({
      projects: 'id, name, createdAt, updatedAt',
      settings: 'id',
    });
  }
}

export const db = new UIMakerDB();

// 헬퍼 함수: DB 형식 <-> 앱 형식 변환
export function toDBProject(project: DesignProject): DBDesignProject {
  return {
    ...project,
    specification: {
      ...project.specification,
      createdAt: project.specification.createdAt.getTime(),
      updatedAt: project.specification.updatedAt.getTime(),
    },
    generatedIcons: project.generatedIcons.map((icon) => ({
      ...icon,
      createdAt: icon.createdAt.getTime(),
    })),
    createdAt: project.createdAt.getTime(),
    updatedAt: project.updatedAt.getTime(),
  };
}

export function fromDBProject(dbProject: DBDesignProject): DesignProject {
  return {
    ...dbProject,
    specification: {
      ...dbProject.specification,
      createdAt: new Date(dbProject.specification.createdAt),
      updatedAt: new Date(dbProject.specification.updatedAt),
    },
    generatedIcons: dbProject.generatedIcons.map((icon) => ({
      ...icon,
      createdAt: new Date(icon.createdAt),
    })),
    createdAt: new Date(dbProject.createdAt),
    updatedAt: new Date(dbProject.updatedAt),
  };
}
