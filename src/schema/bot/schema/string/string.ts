import DiffMatchPatch from "../../../../utils/diff";
import { BranchOperationalTransformationValue } from "../../value";
import { StringOperateTypes, StringOperation } from "./operate";

export const StringBOTMergeStrategies = {
    STRING_PATCH_APPLY: "STRING_PATCH_APPLY",
    STRING_BEST_EFFORT: "STRING_BEST_EFFORT",
    STRING_LAST_WRITE_WINS: "STRING_LAST_WRITE_WINS",
} as const;
export type StringBOTMergeStrategy = typeof StringBOTMergeStrategies[keyof typeof StringBOTMergeStrategies];

export interface StringSchema {
    maxLen?: number;
    minLen?: number;
    regex?: string;
}

export class StringSBTValue extends BranchOperationalTransformationValue<StringSBTValue> {
    private dmp: DiffMatchPatch = new DiffMatchPatch();

    constructor(
        private str: string,
        private schema: StringSchema = {},
    ) {
        super();
    }

    validate() {
        if (this.schema.maxLen && this.str.length > this.schema.maxLen) {
            throw new Error(`String exceeds maximum length: ${this.str}`);
        }

        if (this.schema.minLen && this.str.length < this.schema.minLen) {
            throw new Error(`String is below minimum length: ${this.str}`);
        }

        if (this.schema.regex && !new RegExp(this.schema.regex).test(this.str)) {
            throw new Error(`String does not match regex: ${this.str}`);
        }
    }

    deepCopy(): StringSBTValue {
        return new StringSBTValue(this.str);
    }

    deepEquals(value: StringSBTValue): boolean {
        return this.str === value.str;
    }

    toString(): string {
        return this.str;
    }

    toJSON(): any {
        return this.str;
    }

    operate(operation: StringOperation): StringSBTValue {
        switch (operation.getOperateType()) {
            case StringOperateTypes.SET:
                return new StringSBTValue(operation.getSetOperation()?.str || "");
            case StringOperateTypes.PATCH:
                const patches = this.dmp.patch_make(operation.getPatchOperation()?.before || "", operation.getPatchOperation()?.after || "");
                const [mergedText, _] = this.dmp.patch_apply(patches, this.str);
                return new StringSBTValue(mergedText);
            case StringOperateTypes.CONCAT:
                return new StringSBTValue(this.str + operation.getConcatOperation()?.str);
            case StringOperateTypes.REPLACE:
                return new StringSBTValue(this.str.replace(operation.getReplaceOperation()?.from || "", operation.getReplaceOperation()?.to || ""));
            case StringOperateTypes.SPLIT:
                return new StringSBTValue(this.str.split(operation.getSplitOperation()?.separator || "").join(","));
            case StringOperateTypes.JOIN:
                return new StringSBTValue(this.str.split(",").join(operation.getJoinOperation()?.separator || ""));
            case StringOperateTypes.TO_UPPER:
                return new StringSBTValue(this.str.toUpperCase());
            case StringOperateTypes.TO_LOWER:
                return new StringSBTValue(this.str.toLowerCase());
            case StringOperateTypes.TRIM:
                return new StringSBTValue(this.str.trim());
            case StringOperateTypes.SLICE:
                return new StringSBTValue(this.str.slice(0, operation.getSliceOperation()?.length || 0));
            default:
                return this;
        }
    }

    reverse(operation: StringOperation, preValue: StringSBTValue): StringSBTValue {
        switch (operation.getOperateType()) {
            case StringOperateTypes.SET:
                return new StringSBTValue(preValue.str);
            case StringOperateTypes.PATCH:
                const patches = this.dmp.patch_make(operation.getPatchOperation()?.after || "", operation.getPatchOperation()?.before || "");
                const [mergedText, _] = this.dmp.patch_apply(patches, this.str);
                return new StringSBTValue(mergedText);
            case StringOperateTypes.CONCAT:
                return new StringSBTValue(
                    this.str.slice(0, this.str.length - (operation.getConcatOperation()?.str?.length || 0))
                );
            case StringOperateTypes.REPLACE:
                return new StringSBTValue(
                    this.str.replace(operation.getReplaceOperation()?.to || "", 
                    operation.getReplaceOperation()?.from || "")
                );
            case StringOperateTypes.SPLIT:
                return new StringSBTValue(
                    this.str.split(operation.getSplitOperation()?.separator || "").join(",")
                );
            case StringOperateTypes.JOIN:
                return new StringSBTValue(
                    this.str.split(",").join(operation.getJoinOperation()?.separator || "")
                );
            case StringOperateTypes.TO_UPPER:
                return new StringSBTValue(preValue.str);
            case StringOperateTypes.TO_LOWER:
                return new StringSBTValue(preValue.str);
            case StringOperateTypes.TRIM:
                return new StringSBTValue(preValue.str);
            case StringOperateTypes.SLICE:
                return new StringSBTValue(preValue.str);
            default:
                return this;
        }
    }
}
