import { useEffect } from 'react';
import projects from "../projects.json";
import useDevRunner from "./usehooks/useDevRunner";
import ProjectCard from "./components/ProjectCard";

interface Project {
  name: string;
  path: string;
  cmd: string;
  preferredPort?: number;
}

export default function App() {
  // All state & side-effects are managed by the hook
  const { state: st, run, kill, restart, openInBrowser } = useDevRunner();

  // Optional debug logging
  useEffect(() => {
    console.log('Current state:', st);
  }, [st]);

  return (
    <div className="p-4 space-y-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-center mb-6">Dev Runner</h1>

      {(projects as Project[]).map((p) => (
        <ProjectCard
          key={p.name}
          project={p}
          projectState={st[p.name]}
          run={run}
          kill={kill}
          restart={restart}
          openInBrowser={openInBrowser}
        />
      ))}
    </div>
  );
}