import { useEffect, useState } from 'react';
import projects from "../projects.json";

type State = Record<string, { running: boolean; port?: number; preferredPort?: number; loading?: boolean }>;

declare global { 
  interface Window { 
    devRunner: {
      start: (key: string, cmd: string, cwd: string, preferredPort?: number) => Promise<number | null>;
      kill: (key: string) => Promise<void>;
      restart: (key: string, cmd: string, cwd: string, preferredPort?: number) => Promise<void>;
      openInBrowser: (port: number) => Promise<void>;
      onPort: (callback: (key: string, port: number) => void) => void;
      onExit: (callback: (key: string) => void) => void;
    }
  } 
}

export default function App() {
  const [st, setSt] = useState<State>({});
  
  // Debug logging
  useEffect(() => {
    console.log('Current state:', st);
  }, [st]);

  useEffect(() => {
    window.devRunner.onPort((key: string, port: number) => {
      console.log(`Port received for ${key}: ${port}`);
      setSt(s => ({ ...s, [key]: { ...s[key], running: true, port, loading: false } }));
    });
    
    window.devRunner.onExit((key: string) => {
      console.log(`Exit received for ${key}`);
      setSt(s => ({ ...s, [key]: { running: false, port: undefined, loading: false } }));
    });
  }, []);

  const run = async (p: any) => {
    setSt(s => ({ ...s, [p.name]: { running: true, loading: true, preferredPort: p.preferredPort } }));
    const port = await window.devRunner.start(p.name, p.cmd, p.path, p.preferredPort);
    if (port) {
      setSt(s => ({ ...s, [p.name]: { running: true, port, loading: false } }));
    }
  };

  const kill = async (p: any) => {
    await window.devRunner.kill(p.name);
    setSt(s => ({ ...s, [p.name]: { running: false, port: undefined, loading: false } }));
  };

  const restart = async (p: any) => {
    setSt(s => ({ ...s, [p.name]: { ...s[p.name], loading: true } }));
    await window.devRunner.restart(p.name, p.cmd, p.path, p.preferredPort);
  };

  return (
    <div className="p-4 space-y-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-center mb-6">Dev Runner</h1>
      {projects.map((p: any) => (
        <div key={p.name} className="bg-white rounded-lg shadow-lg p-4">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">{p.name}</h2>
            <div className="text-sm text-gray-600">{p.path}</div>
            {st[p.name]?.loading && (
              <div className="text-center py-4">
                <div className="text-gray-500">Starting server...</div>
              </div>
            )}
            {st[p.name]?.port && !st[p.name]?.loading && (
              <div className="text-center py-4">
                <div className="text-5xl font-bold text-blue-600">
                  {st[p.name].port}
                </div>
                {st[p.name].preferredPort && st[p.name].port !== st[p.name].preferredPort && (
                  <div className="text-sm text-orange-600 mt-2">
                    Port {st[p.name].preferredPort} was in use
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-2">
              {st[p.name]?.running ? (
                <>
                  <button 
                    onClick={() => kill(p)} 
                    disabled={st[p.name]?.loading}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Kill
                  </button>
                  <button 
                    onClick={() => restart(p)}
                    disabled={st[p.name]?.loading}
                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Restart
                  </button>
                  {st[p.name]?.port && (
                    <button 
                      onClick={() => window.devRunner.openInBrowser(st[p.name].port!)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Open in Browser
                    </button>
                  )}
                </>
              ) : (
                <button 
                  onClick={() => run(p)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Run
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}