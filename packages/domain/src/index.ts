// Domain layer – public API surface
export const VERSION = '2.0.0';

// Utility
export * from './types/result';

// Value objects & entities
export * from './types/port';
export * from './types/project';
export * from './types/workspace';

// Validators
export { parseProjectConfig } from './validators/projectValidator';
export { parseWorkspace } from './validators/workspaceValidator';
export type { ValidationError } from './validators/projectValidator';