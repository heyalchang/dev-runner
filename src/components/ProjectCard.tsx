import React from 'react';
import { Project, DevStateEntry } from "../usehooks/useDevRunner";

interface ProjectCardProps {
  project: Project;
  projectState?: DevStateEntry;
  run: (p: Project) => Promise<void>;
  kill: (p: Project) => Promise<void>;
  restart: (p: Project) => Promise<void>;
  openInBrowser: (port: number) => Promise<void>;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  projectState = {},
  run,
  kill,
  restart,
  openInBrowser,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">{project.name}</h2>
        <div className="text-sm text-gray-600">{project.path}</div>

        {/* Status indicators */}
        {projectState.loading && (
          <div className="text-center py-4">
            <div className="text-gray-500">Starting server...</div>
          </div>
        )}

        {projectState.port && !projectState.loading && (
          <div className="text-center py-4">
            <div className="text-5xl font-bold text-blue-600">
              {projectState.port}
            </div>
            {projectState.preferredPort && projectState.port !== projectState.preferredPort && (
              <div className="text-sm text-orange-600 mt-2">
                Port {projectState.preferredPort} was in use
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          {projectState.running ? (
            <>
              <button
                onClick={() => kill(project)}
                disabled={projectState.loading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Kill
              </button>
              <button
                onClick={() => restart(project)}
                disabled={projectState.loading}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Restart
              </button>
              {projectState.port && (
                <button
                  onClick={() => openInBrowser(projectState.port!)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Open in Browser
                </button>
              )}
            </>
          ) : (
            <button
              onClick={() => run(project)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Run
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard; 