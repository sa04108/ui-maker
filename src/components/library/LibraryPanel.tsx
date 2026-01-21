import { useProjectStore } from '@/store';
import { ProjectCard } from './ProjectCard';
import { IconGallery } from './IconGallery';
import { SpecificationView } from '@/components/generator';

export function LibraryPanel() {
  const {
    projects,
    currentProject,
    setCurrentProject,
    deleteProject,
    deleteIconFromProject,
  } = useProjectStore();

  return (
    <div className="grid grid-cols-3 gap-6 h-full">
      {/* Projects List */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-300">Saved Projects</h3>
        {projects.length === 0 ? (
          <div className="text-center text-gray-500 py-8 text-sm">
            No projects yet. Create one in the Generator tab.
          </div>
        ) : (
          <div className="space-y-2">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isSelected={currentProject?.id === project.id}
                onSelect={() => setCurrentProject(project)}
                onDelete={() => deleteProject(project.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Project Details */}
      <div className="col-span-2 space-y-4">
        {currentProject ? (
          <>
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-200 mb-1">
                {currentProject.name}
              </h3>
              <p className="text-xs text-gray-500">
                Created: {currentProject.createdAt.toLocaleDateString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-300 mb-3">
                  Design Specification
                </h4>
                <SpecificationView specification={currentProject.specification} />
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-300 mb-3">
                  Saved Icons ({currentProject.generatedIcons.length})
                </h4>
                <IconGallery
                  icons={currentProject.generatedIcons}
                  onDelete={(iconId) =>
                    deleteIconFromProject(currentProject.id, iconId)
                  }
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a project to view details
          </div>
        )}
      </div>
    </div>
  );
}
