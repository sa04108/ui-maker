import { create } from 'zustand';
import type { DesignProject, GeneratedIcon } from '@/types';
import { db, toDBProject, fromDBProject } from '@/db/database';

interface ProjectState {
  projects: DesignProject[];
  currentProject: DesignProject | null;
  isLoading: boolean;

  loadProjects: () => Promise<void>;
  createProject: (project: DesignProject) => Promise<void>;
  updateProject: (project: DesignProject) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (project: DesignProject | null) => void;
  clearCurrentProject: () => void;
  addIconToProject: (projectId: string, icon: GeneratedIcon) => Promise<void>;
  deleteIconFromProject: (projectId: string, iconId: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,

  loadProjects: async () => {
    set({ isLoading: true });
    const dbProjects = await db.projects.orderBy('updatedAt').reverse().toArray();
    const projects = dbProjects.map(fromDBProject);
    set({ projects, isLoading: false });
  },

  createProject: async (project: DesignProject) => {
    await db.projects.add(toDBProject(project));
    set((state) => ({
      projects: [project, ...state.projects],
      currentProject: project,
    }));
  },

  updateProject: async (project: DesignProject) => {
    const updated = { ...project, updatedAt: new Date() };
    await db.projects.put(toDBProject(updated));
    set((state) => ({
      projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
      currentProject: state.currentProject?.id === updated.id ? updated : state.currentProject,
    }));
  },

  deleteProject: async (id: string) => {
    await db.projects.delete(id);
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject,
    }));
  },

  setCurrentProject: (project: DesignProject | null) => {
    set({ currentProject: project });
  },

  clearCurrentProject: () => {
    set({ currentProject: null });
  },

  addIconToProject: async (projectId: string, icon: GeneratedIcon) => {
    const project = get().projects.find((p) => p.id === projectId);
    if (!project) return;

    const updated: DesignProject = {
      ...project,
      generatedIcons: [...project.generatedIcons, icon],
      updatedAt: new Date(),
    };
    await db.projects.put(toDBProject(updated));
    set((state) => ({
      projects: state.projects.map((p) => (p.id === projectId ? updated : p)),
      currentProject: state.currentProject?.id === projectId ? updated : state.currentProject,
    }));
  },

  deleteIconFromProject: async (projectId: string, iconId: string) => {
    const project = get().projects.find((p) => p.id === projectId);
    if (!project) return;

    const updated: DesignProject = {
      ...project,
      generatedIcons: project.generatedIcons.filter((i) => i.id !== iconId),
      updatedAt: new Date(),
    };
    await db.projects.put(toDBProject(updated));
    set((state) => ({
      projects: state.projects.map((p) => (p.id === projectId ? updated : p)),
      currentProject: state.currentProject?.id === projectId ? updated : state.currentProject,
    }));
  },
}));
