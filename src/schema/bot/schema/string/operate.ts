import { BranchOperationalTransformationOperation } from "../../operation";
import { StringSBTValue } from "./string";

export const StringOperateTypes = {
    SET: "SET",
    PATCH: "PATCH",
    CONCAT: "CONCAT",
    REPLACE: "REPLACE",
    SPLIT: "SPLIT",
    JOIN: "JOIN",
    TO_UPPER: "TO_UPPER",
    TO_LOWER: "TO_LOWER",
    TRIM: "TRIM",
    SLICE: "SLICE",
} as const;
export type StringOperateType = typeof StringOperateTypes[keyof typeof StringOperateTypes];

export type StringSetOperationType = {
    str: string;
};

export type StringPatchOperationType = {
    before: string;
    after: string;
};

export type StringConcatOperationType = {
    str: string;
};

export type StringReplaceOperationType = {
    from: string;
    to: string;
};

export type StringSplitOperationType = {
    separator: string;
};

export type StringJoinOperationType = {
    separator: string;
};

export type StringSliceOperationType = {
    length: number;
};

export class StringOperation extends BranchOperationalTransformationOperation<StringSBTValue> {
    private setOperation?: StringSetOperationType;
    private patchOperation?: StringPatchOperationType;
    private concatOperation?: StringConcatOperationType;
    private replaceOperation?: StringReplaceOperationType;
    private splitOperation?: StringSplitOperationType;
    private joinOperation?: StringJoinOperationType;
    private sliceOperation?: StringSliceOperationType;

    constructor(
        private operateType: StringOperateType,
    ) {
        super();
    }

    setSetOperation(setOperation: StringSetOperationType): void {
        this.setOperation = setOperation;
    }

    setPatchOperation(patchOperation: StringPatchOperationType): void {
        this.patchOperation = patchOperation;
    }

    setConcatOperation(concatOperation: StringConcatOperationType): void {
        this.concatOperation = concatOperation;
    }

    setReplaceOperation(replaceOperation: StringReplaceOperationType): void {
        this.replaceOperation = replaceOperation;
    }

    setSplitOperation(splitOperation: StringSplitOperationType): void {
        this.splitOperation = splitOperation;
    }

    setJoinOperation(joinOperation: StringJoinOperationType): void {
        this.joinOperation = joinOperation;
    }

    setSliceOperation(sliceOperation: StringSliceOperationType): void {
        this.sliceOperation = sliceOperation;
    }

    getSetOperation(): StringSetOperationType|undefined {
        return this.setOperation;
    }

    getPatchOperation(): StringPatchOperationType|undefined {
        return this.patchOperation;
    }

    getConcatOperation(): StringConcatOperationType|undefined {
        return this.concatOperation;
    }

    getReplaceOperation(): StringReplaceOperationType|undefined {
        return this.replaceOperation;
    }

    getSplitOperation(): StringSplitOperationType|undefined {
        return this.splitOperation;
    }

    getJoinOperation(): StringJoinOperationType|undefined {
        return this.joinOperation;
    }

    getSliceOperation(): StringSliceOperationType|undefined {
        return this.sliceOperation;
    }

    toString(): string {
        switch (this.operateType) {
            case StringOperateTypes.SET:
                return `${this.operateType}(${JSON.stringify(this.setOperation)})`;
            case StringOperateTypes.PATCH:
                return `${this.operateType}(${JSON.stringify(this.patchOperation)})`;
            case StringOperateTypes.CONCAT:
                return `${this.operateType}(${JSON.stringify(this.concatOperation)})`;
            case StringOperateTypes.REPLACE:
                return `${this.operateType}(${JSON.stringify(this.replaceOperation)})`;
            case StringOperateTypes.SPLIT:
                return `${this.operateType}(${JSON.stringify(this.splitOperation)})`;
            case StringOperateTypes.JOIN:
                return `${this.operateType}(${JSON.stringify(this.joinOperation)})`;
            case StringOperateTypes.TO_UPPER:
            case StringOperateTypes.TO_LOWER:
            case StringOperateTypes.TRIM:
                return `${this.operateType}()`;
            case StringOperateTypes.SLICE:
                return `${this.operateType}(${JSON.stringify(this.sliceOperation)})`;
            default:
                return "";
        }
    }

    getOperateType(): StringOperateType {
        return this.operateType;
    }
}

export class StringOperator {
    static set(str: string): StringOperation {
        const operation = new StringOperation(StringOperateTypes.SET);
        operation.setSetOperation({str});
        return operation;
    }

    static patch(before: string, after: string): StringOperation {
        const operation = new StringOperation(StringOperateTypes.PATCH);
        operation.setPatchOperation({before, after});
        return operation;
    }

    static concat(str: string): StringOperation {
        const operation = new StringOperation(StringOperateTypes.CONCAT);
        operation.setConcatOperation({str});
        return operation;
    }

    static replace(from: string, to: string): StringOperation {
        const operation = new StringOperation(StringOperateTypes.REPLACE);
        operation.setReplaceOperation({from, to});
        return operation;
    }

    static split(separator: string): StringOperation {
        const operation = new StringOperation(StringOperateTypes.SPLIT);
        operation.setSplitOperation({separator});
        return operation;
    }

    static join(separator: string): StringOperation {
        const operation = new StringOperation(StringOperateTypes.JOIN);
        operation.setJoinOperation({separator});
        return operation;
    }

    static toUpper(): StringOperation {
        const operation = new StringOperation(StringOperateTypes.TO_UPPER);
        return operation;
    }

    static toLower(): StringOperation {
        const operation = new StringOperation(StringOperateTypes.TO_LOWER);
        return operation;
    }

    static trim(): StringOperation {
        const operation = new StringOperation(StringOperateTypes.TRIM);
        return operation;
    }

    static slice(length: number): StringOperation {
        const operation = new StringOperation(StringOperateTypes.SLICE);
        operation.setSliceOperation({length});
        return operation;
    }
}