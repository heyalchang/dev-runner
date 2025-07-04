export type DomainEvent =
  | { type: 'project.added'; path: string }
  | { type: 'project.removed'; path: string }
  | { type: 'workspace.saved' }
  | { type: 'runner.started'; projectKey: string; port: number }
  | { type: 'runner.stopped'; projectKey: string };

type Listener<E extends DomainEvent['type']> = (event: Extract<DomainEvent, { type: E }>) => void;

const listeners: { [K in DomainEvent['type']]?: Array<(e: DomainEvent) => void> } = {};

export function publish<E extends DomainEvent>(event: E): void {
  listeners[event.type]?.forEach((fn) => fn(event));
}

export function subscribe<E extends DomainEvent['type']>(type: E, fn: Listener<E>): () => void {
  (listeners[type] ||= []).push(fn as (e: DomainEvent) => void);
  return () => {
    listeners[type] = listeners[type]?.filter((h) => h !== fn);
  };
}
