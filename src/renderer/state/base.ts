export const StateBaseTypes = {
    STRING: "string",
    NUMBER: "number",
    BOOLEAN: "boolean",
    DATE: "date",
    TIME: "time",
    DATETIME: "datetime",
} as const;

export type StateBaseType = (typeof StateBaseTypes)[keyof typeof StateBaseTypes];