import type { ErrorObject } from 'ajv';
import ajv from './ajvInstance';
import schema from '../schemas/project.schema.json';
import type { Project } from '../types/project';
import { Result, ok, err } from '../types/result';

/** Ajv compiled validator cached for reuse. */
const validate = ajv.compile<Project>(schema);

export type ValidationError = ErrorObject;

/**
 * Parse and validate a raw JSON value as `Project`.
 * Never throws – always returns a `Result`.
 */
export function parseProjectConfig(json: unknown): Result<Project, ValidationError[]> {
  if (validate(json)) {
    return ok(json as Project);
  }
  return err(validate.errors ?? []);
}