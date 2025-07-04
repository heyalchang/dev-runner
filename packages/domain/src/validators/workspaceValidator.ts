import type { ErrorObject } from 'ajv';
import ajv from './ajvInstance';
import schema from '../schemas/workspace.schema.json';
import type { Workspace } from '../types/workspace';
import { Result, ok, err } from '../types/result';

const validate = ajv.compile<Workspace>(schema);

export type ValidationError = ErrorObject;

export function parseWorkspace(json: unknown): Result<Workspace, ValidationError[]> {
  if (validate(json)) {
    return ok(json as Workspace);
  }
  return err(validate.errors ?? []);
}