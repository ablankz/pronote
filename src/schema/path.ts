import { generateUniqueID } from "../utils/generate";
import { DataSchema, OperationData } from "./types";

export type PathFormatType = 
    | "absolute"
    | "relative";

export interface PathSchema {
    format?: PathFormatType;
    delimiter?: string;
    maxLen?: number;
    doubleWildcardPriority?: "head" | "tail";
}

export const PathOperations = {
    REGENERATE: "regenerate",
    UPDATE: "update",
    UP: "up",
    DOWN: "down",
} as const;

export type PathOperation = typeof PathOperations[keyof typeof PathOperations];

export interface PathOperationData extends OperationData {
    operation: PathOperation;
    regenerate?: {
        schema: PathSchema;
    };
    update?: {
        path: string;
    };
    up?: {
        count: number;
    };
    down?: {
        dir: string;
    };
}

export class Path implements DataSchema<PathOperationData, Path> {
    private original: string;
    private value: string;
    private type: PathFormatType;
    private doubleWildcardPriority: "head" | "tail";
    private delimiter: string;

    constructor(path: string, private schema: PathSchema, private id: string = "") {
        this.original = path;
        this.doubleWildcardPriority = schema.doubleWildcardPriority || "tail";
        this.delimiter = schema.delimiter || "/";

        if (id === "") {
            this.id = generateUniqueID();
        }

        if (schema.format === undefined) {
            if (path.startsWith(this.delimiter)) {
                this.type = "absolute";
            } else {
                this.type = "relative";
            }
        } else {
            switch (schema.format) {
                case "absolute":
                    if (!path.startsWith(this.delimiter)) {
                        throw new Error(`Invalid absolute path: ${path}`);
                    }
                    this.type = schema.format;
                    break;
                case "relative":
                    if (path.startsWith(this.delimiter)) {
                        throw new Error(`Invalid relative path: ${path}`);
                    }
                    this.type = schema.format;
                    break;
                default:
                    throw new Error(`Invalid path format: ${schema.format}`);
            }
        }
        if (schema.maxLen && path.length > schema.maxLen) {
            throw new Error(`Path exceeds maximum length: ${path}`);
        }
        const openBrackets = path.match(/\$\{/g);
        const closeBrackets = path.match(/\}/g);
        if (openBrackets && closeBrackets && openBrackets.length !== closeBrackets.length) {
            throw new Error(`Unbalanced brackets: ${path}`);
        }
        this.value = Path.cleanPath(path, this.delimiter);
    }

    getID(): string {
        return this.id;
    }

    regenerate(schema: PathSchema): Path {
        return new Path(this.original, schema, this.id);
    }

    update(path: string): Path {
        return new Path(path, this.schema, this.id);
    }

    operate(data: PathOperationData): Path {
        switch (data.operation) {
            case PathOperations.REGENERATE:
                return this.regenerate(data.regenerate?.schema || {});
            case PathOperations.UPDATE:
                return this.update(data.update?.path || "");
            case PathOperations.UP:
                return this.up(data.up?.count);
            case PathOperations.DOWN:
                return this.down(data.down?.dir || "");
            default:
                throw new Error(`Invalid operation: ${data.operation}`);
        }
    }

    static resolvePath(pathStr: string, variables: Record<string, string>): string {
        return pathStr.replace(/\$\{([^}]+)\}/g, (_, key) => {
            if (variables[key] === undefined) {
                return "${" + key + "}";
            }
            return variables[key];
        });
    }

    static cleanPath(path: string, delimiter: string = "/"): string {
        const parts = path.split(delimiter);
        const stack: string[] = [];

        for (const part of parts) {
            if (part === "..") {
                if (stack.length > 0 && stack[stack.length - 1] !== "..") {
                    stack.pop();
                }
            } else if (part !== "." && part !== "") {
                stack.push(part);
            }
        }

        return (path.startsWith(delimiter) ? delimiter : "") + stack.join(delimiter);
    }

    resolve(variables: Record<string, string>): Path {
        return new Path(Path.resolvePath(this.value, variables), this.schema, this.id);
    }

    up(count: number = 1): Path {
        const additional = Array.from({ length: count }, () => "..").join(this.delimiter);
        return new Path(this.value + this.delimiter + additional, this.schema, this.id);
    }

    down(dir: string): Path {
        return new Path(this.value + this.delimiter + dir, this.schema, this.id);
    }

    getType(): PathFormatType {
        return this.type;
    }

    getOriginal(): string {
        return this.original;
    }

    getPath(): string {
        return this.value;
    }

    match(path: string, base: "this" | "outer" = "outer"): boolean {
        const parts = base === "this" ? this.value.split(this.delimiter) : path.split(this.delimiter);
        const splitValue = base === "this" ? path.split(this.delimiter) : this.value.split(this.delimiter);

        let j = 0;
        for (let i = 0; i < parts.length; i++) {
            if (parts[i] === "**") {
                if (i === parts.length - 1) {
                    return true;
                }
                i++;
                const next = parts[i];
                if (next === "**") {
                    i--;
                    continue;
                }
                let found = false;
                if (next.includes("*")) {
                    const regexStr = next
                        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
                        .replace(/\*/g, ".*");
                    const regex = new RegExp(`^${regexStr}$`);
                    let k;
                    switch (this.doubleWildcardPriority) {
                        case "head":
                            while (j < splitValue.length) {
                                if (regex.test(splitValue[j])) {
                                    found = true;
                                    break;
                                }
                                j++;
                            }
                            break;
                        case "tail":
                            k = splitValue.length - 1;
                            while (k >= j) {
                                if (regex.test(splitValue[k])) {
                                    found = true;
                                    j = k;
                                    break;
                                }
                                k--;
                            }
                            break;
                    }
                } else {
                    let k;
                    switch (this.doubleWildcardPriority) {
                        case "head":
                            while (j < splitValue.length) {
                                if (next === splitValue[j]) {
                                    found = true;
                                    break;
                                }
                                j++;
                            }
                            break;
                        case "tail":
                            for (k = splitValue.length - 1; k >= j; k--) {
                                if (next === splitValue[k]) {
                                    found = true;
                                    j = k;
                                    break;
                                }
                            }
                            break;
                    }
                }
                if (!found) {
                    return false;
                }
            }

            if (parts[i].includes("*")) {
                const regexStr = parts[i]
                    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
                    .replace(/\*/g, ".*");
                const regex = new RegExp(`^${regexStr}$`);
                if (!regex.test(splitValue[j])) {
                    return false;
                }
            } else {
                if (parts[i] !== splitValue[j]) {
                    return false;
                }
            }
            j++;
        }

        return j === splitValue.length;
    }

    toString(): string {
        return this.value;
    }
}