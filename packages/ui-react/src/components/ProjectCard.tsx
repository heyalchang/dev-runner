import React, { useState } from 'react';
import type { Project } from '@domain';
import type { HeartbeatStatus, LogEntry } from '@application';

export interface ProjectCardProps {
  project: Project;
  status: HeartbeatStatus;
  logs: LogEntry[];
  onStart(): void;
  onStop(): void;
  onOpenLog?(): void;
}

export function ProjectCard({
  project,
  status,
  logs,
  onStart,
  onStop,
  onOpenLog,
}: ProjectCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="project-card">
      <div className="header">
        <span>{project.name ?? project.cmd}</span>
        <span data-testid="status-dot" className={`status-${status}`}></span>
        <button onClick={onStart}>start</button>
        <button onClick={onStop}>stop</button>
        <button onClick={() => setOpen((o) => !o)}>logs</button>
      </div>
      {open && (
        <div className="log-drawer">
          {logs.map((l, idx) => (
            <pre key={idx}>{l.message}</pre>
          ))}
          {onOpenLog && <button onClick={onOpenLog}>Open full log</button>}
        </div>
      )}
    </div>
  );
}
