import addFormats from 'ajv-formats';
import Ajv2020 from 'ajv/dist/2020';

/**
 * Single Ajv instance compiled with draft-2020-12 support and
 * `ajv-formats` so every validator shares cache & performance benefits.
 */
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);

export default ajv;