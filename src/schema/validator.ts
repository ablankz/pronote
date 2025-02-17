import { JSONSchemaDefinition, JSONSchemaType } from "./types";

export class JSONSchemaValidator {
    validate(data: unknown, schema: JSONSchemaDefinition, path: string = "$"): string[] {
        let errors: string[] = [];

        const validateType = (value: unknown, expectedTypes: JSONSchemaType | JSONSchemaType[], path: string) => {
            const types = Array.isArray(expectedTypes) ? expectedTypes : [expectedTypes];

            for (const type of types) {
                switch (type) {
                    case "string":
                        if (typeof value === "string") return [];
                        break;
                    case "number":
                        if (typeof value === "number") return [];
                        break;
                    case "boolean":
                        if (typeof value === "boolean") return [];
                        break;
                    case "object":
                        if (typeof value === "object" && value !== null && !Array.isArray(value)) return [];
                        break;
                    case "array":
                        if (Array.isArray(value)) return [];
                        break;
                    case "set":
                        if (value instanceof Set) return [];
                        break;
                    case "record":
                        if (typeof value === "object" && value !== null && !Array.isArray(value)) return [];
                        break;
                    case "map":
                        if (value instanceof Map) return [];
                        break;
                    case "stack":
                        if (Array.isArray(value)) return [];
                        break;
                    case "queue":
                        if (Array.isArray(value)) return [];
                        break;
                    case "null":
                        if (value === null) return [];
                        break;
                    case "integer":
                        if (typeof value === "number" && Number.isInteger(value)) return [];
                        break;
                    // case "any":
                    //     return [];
                }
            }
            return [`${path} should be of type ${types.join(" or ")}, but got ${typeof value}`];
        };

        errors.push(...validateType(data, schema.type, path));

        if (typeof data === "string" && schema.type === "string") {
            if (schema.minLength !== undefined && data.length < schema.minLength) {
                errors.push(`${path} must have at least ${schema.minLength} characters`);
            }
            if (schema.maxLength !== undefined && data.length > schema.maxLength) {
                errors.push(`${path} must have at most ${schema.maxLength} characters`);
            }
            if (schema.pattern !== undefined) {
                const regex = new RegExp(schema.pattern);
                if (!regex.test(data)) {
                    errors.push(`${path} does not match pattern ${schema.pattern}`);
                }
            }

            // switch (schema.format) {
            //     case "datetime":
            //         if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(data)) {
            //             errors.push(`${path} must be in datetime format`);
            //         }
            //         break;
            //     case "time":
            //         if (!/^\d{2}:\d{2}:\d{2}Z$/.test(data)) {
            //             errors.push(`${path} must be in time format`);
            //         }
            //         break;
            //     case "date":
            //         if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
            //             errors.push(`${path} must be in date format`);
            //         }
            //         break;
            //     case "email":
            //         if (!/^.+@.+\..+$/.test(data)) {
            //             errors.push(`${path} must be in email format`);
            //         }
            //         break;
            //     case "hostname":
            //         if (!/^[a-zA-Z0-9.-]+$/.test(data)) {
            //             errors.push(`${path} must be in hostname format`);
            //         }
            //         break;
            //     case "ipv4":
            //         if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(data)) {
            //             errors.push(`${path} must be in ipv4 format`);
            //         }
            //         break;
            //     case "ipv6":
            //         if (!/^[0-9a-fA-F:]+$/.test(data)) {
            //             errors.push(`${path} must be in ipv6 format`);
            //         }
            //         break;
            //     case "uri":
            //         if (!/^https?:\/\/.+$/.test(data)) {
            //             errors.push(`${path} must be in uri format`);
            //         }
            //         break;
            //     case "uuid":
            //         if (!/^[0-9a-fA-F-]+$/.test(data)) {
            //             errors.push(`${path} must be in uuid format`);
            //         }
            //         break;
            // }
        }

        if (typeof data === "number" && (schema.type === "number" || schema.type === "integer")) {
            if (schema.minimum !== undefined && data < schema.minimum) {
                errors.push(`${path} must be at least ${schema.minimum}`);
            }
            if (schema.maximum !== undefined && data > schema.maximum) {
                errors.push(`${path} must be at most ${schema.maximum}`);
            }
        }

        if (Array.isArray(data) && schema.type === "array") {
            if (schema.items) {
                data.forEach((item, index) => {
                    errors.push(...this.validate(item, schema.items!, `${path}[${index}]`));
                });
            }
        }

        if (data instanceof Set && schema.type === "set") {
            if (schema.items) {
                [...data].forEach((item, index) => {
                    errors.push(...this.validate(item, schema.items!, `${path}[${index}]`));
                });
            }
        }

        if (data instanceof Map && schema.type === "map") {
            if (schema.mapItems) {
                data.forEach((value, key) => {
                    errors.push(...this.validate(key, schema.mapItems!.key, `${path}.key`));
                    errors.push(...this.validate(value, schema.mapItems!.value, `${path}.value`));
                });
            }
        }

        if (typeof data === "object" && schema.type === "object" && data !== null) {
            if (schema.properties) {
                Object.entries(schema.properties).forEach(([key, propSchema]) => {
                    if (schema.required?.includes(key) && !(key in data)) {
                        errors.push(`${path}.${key} is required`);
                    }
                    if (key in data) {
                        errors.push(...this.validate((data as any)[key], propSchema, `${path}.${key}`));
                    }
                });
            }
        }

        return errors;
    }
}
