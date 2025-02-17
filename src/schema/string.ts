export type StringFormatType = 
    | "absolute"
    | "relative";

export interface StringSchema {
    format?: StringFormatType;
    maxLen?: number;
}

export class String {
    private original: string;
    private value: string;
    private type: StringFormatType;

    constructor(path: string, private schema: StringSchema) {
        this.original = path;
        if (schema.format === undefined) {
            if (path.startsWith("/")) {
                this.type = "absolute";
            } else {
                this.type = "relative";
            }
        } else {
            this.type = schema.format;
        }
        if (schema.maxLen && path.length > schema.maxLen) {
            throw new Error(`String exceeds maximum length: ${path}`);
        }
        this.value = String.cleanString(path);
    }

    static cleanString(path: string): string {
        const parts = path.split("/");
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

        return (path.startsWith("/") ? "/" : "") + stack.join("/");
    }

    up(): String {
        return new String(this.value + "/..", this.schema);
    }

    down(dir: string): String {
        return new String(this.value + "/" + dir, this.schema);
    }

    getType(): StringFormatType {
        return this.type;
    }

    getOriginal(): string {
        return this.original;
    }

    getString(): string {
        return this.value;
    }
}