import type { ParamSchema, Schema } from "express-validator";

type Loc = "body" | "query" | "params" | "headers" | "cookies";

interface OpenAPISchema {
  type: "object";
  properties: Record<string, any>;
  required?: string[];
}

function getLocations(field: ParamSchema): Loc[] {
  if (!field.in) return [];
  return Array.isArray(field.in) ? (field.in as Loc[]) : [field.in as Loc];
}

function regexSource(opts: any): string | undefined {
  if (!opts) return undefined;
  if (opts instanceof RegExp) return opts.source;
  if (typeof opts === "string") return opts;
  if (typeof opts === "object" && "source" in opts && typeof opts.source === "string") {
    return opts.source;
  }
  return undefined;
}

function getOpts(v: any): any {
  if (!v || typeof v !== "object") return null;
  return "options" in v ? v.options : null;
}

function pickErrorMessage(field: ParamSchema): string | undefined {
  const candidates = [
    (field.matches as any)?.errorMessage,
    (field.isLength as any)?.errorMessage,
    (field.isString as any)?.errorMessage,
    (field.isEmail as any)?.errorMessage,
    (field.exists as any)?.errorMessage,
  ];
  return candidates.find((m): m is string => typeof m === "string");
}

function fieldToSchema(field: ParamSchema): any {
  const out: any = {};

  if (field.isEmail) {
    out.type = "string";
    out.format = "email";
  } else if (field.isInt) {
    out.type = "integer";
    const o = getOpts(field.isInt);
    if (o?.min !== undefined) out.minimum = o.min;
    if (o?.max !== undefined) out.maximum = o.max;
  } else if (field.isBoolean) {
    out.type = "boolean";
  } else if (field.isArray) {
    out.type = "array";
    out.items = {};
  } else {
    out.type = "string";
  }

  if (field.isLength) {
    const o = getOpts(field.isLength);
    if (out.type === "string") {
      if (o?.min !== undefined) out.minLength = o.min;
      if (o?.max !== undefined) out.maxLength = o.max;
    }
  }

  if (field.matches) {
    const o = getOpts(field.matches);
    const src = regexSource(o);
    if (src) out.pattern = src;
  }

  const desc = pickErrorMessage(field);
  if (desc) out.description = desc;

  return out;
}

function isFieldRequired(field: ParamSchema): boolean {
  if (field.optional) return false;
  return Boolean(field.exists);
}

/**
 * Convierte un Schema de express-validator (solo los campos cuya `in` incluye
 * "body") en un schema OpenAPI 3.0 de tipo object.
 */
export function schemaToRequestBody(schema: Schema): OpenAPISchema {
  const properties: Record<string, any> = {};
  const required: string[] = [];

  for (const [name, field] of Object.entries(schema)) {
    const f = field as ParamSchema;
    const locations = getLocations(f);
    if (!locations.includes("body")) continue;

    properties[name] = fieldToSchema(f);
    if (isFieldRequired(f)) required.push(name);
  }

  const result: OpenAPISchema = { type: "object", properties };
  if (required.length > 0) result.required = required;
  return result;
}

/**
 * Recibe un registro `{ NombreComponente: ValidatorSchema }` y devuelve un mapa
 * listo para mergear en `components.schemas` del spec OpenAPI.
 */
export function buildComponentSchemas(
  registry: Record<string, Schema>,
): Record<string, OpenAPISchema> {
  const out: Record<string, OpenAPISchema> = {};
  for (const [name, schema] of Object.entries(registry)) {
    out[name] = schemaToRequestBody(schema);
  }
  return out;
}
