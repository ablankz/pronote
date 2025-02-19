export type JSONSchemaType =
    // only one type
    // string format types
    | "string" // single line text
    | "text" // multi line text
    | "datetime" // date and time string
    | "time" // time string
    | "date" // date string
    | "email" // email string
    | "hostname" // hostname string
    | "uri"
    | "uuid"
    | "color"
    | "link"
    | "null" // null only
    | "boolean" // true or false
    | "number"
    | "integer"
    | "float"
    | "currency"
    | "location"
    | "image"
    | "video"
    | "audio"
    | "file"
    | "binary"
    | "json"
    | "object"
    | "array"
    | "set"
    | "record"
    | "map"
    | "stack"
    | "queue"
    | "enum";

export interface JSONSchemaProperty {
    type: JSONSchemaType | JSONSchemaType[];
    description?: string;
    default?: string | number | boolean | null;
    minLength?: number; // if type is "string", "array"
    maxLength?: number; // if type is "string", "array"
    minimum?: number; // if type is "number", "integer"
    maximum?: number; // if type is "number", "integer"
    pattern?: string; // if type is "string"
    items?: JSONSchemaDefinition; // if type is "array", "set", "stack", "queue", "record"
    mapItems?: { key: JSONSchemaDefinition; value: JSONSchemaDefinition }; // if type is "map"
    properties?: Record<string, JSONSchemaDefinition>; // if type is "object"
    required?: string[];
}

export interface JSONSchemaDefinition {
    $schema?: string; // e.g. "http://json-schema.org/draft-07/schema#"
    $id?: string;
    type: JSONSchemaType | JSONSchemaType[];
    title?: string;
    description?: string;
    default?: string | number | boolean | null;
    minLength?: number; // if type is "string", "array"
    maxLength?: number; // if type is "string", "array"
    minimum?: number; // if type is "number", "integer"
    maximum?: number; // if type is "number", "integer"
    pattern?: string; // if type is "string"
    items?: JSONSchemaDefinition;
    mapItems?: { key: JSONSchemaDefinition; value: JSONSchemaDefinition }; // if type is "map"
    properties?: Record<string, JSONSchemaProperty>;
    required?: string[];
}

export class JSONSchemaStore {
    private schemas: Map<string, JSONSchemaDefinition> = new Map();

    addSchema(id: string, schema: JSONSchemaDefinition): void {
        if (this.schemas.has(id)) {
            throw new Error(`Schema with ID "${id}" already exists.`);
        }
        this.schemas.set(id, schema);
    }

    getSchema(id: string): JSONSchemaDefinition | null {
        return this.schemas.get(id) || null;
    }

    removeSchema(id: string): boolean {
        return this.schemas.delete(id);
    }

    listSchemas(): string[] {
        return Array.from(this.schemas.keys());
    }
}

export interface OperationData {}

export interface DataSchema<T extends OperationData, U extends DataSchema<T, U>> {
    getID(): string;
    toString(): string;
    operate(data: T): U;
}