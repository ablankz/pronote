import { generateSortableUniqueID, generateUniqueID } from "../../utils/generate";
import { BranchOperationalTransformationValue } from "./value";

export class BranchOperationalTransformationState<T extends BranchOperationalTransformationValue<T>> {
    constructor(
        protected value: T,
        protected id: string = "",
        protected version: string = "",
        protected lastOperated: Date = new Date(),
    ) {
        if (!id) {
            this.id = generateUniqueID();
        }
        if (!version) {
            this.version = generateSortableUniqueID();
        }
    }

    getId(): string {
        return this.id;
    }

    getVersion(): string {
        return this.version;
    }

    generateBranch(): BranchOperationalTransformationState<T> {
        return new BranchOperationalTransformationState(this.value.deepCopy(), this.id, this.version);
    }

    addVersion(): string {
        this.version = generateSortableUniqueID();
        this.lastOperated = new Date();
        return this.version;
    }

    setVersion(version: string): void {
        this.version = version;
        this.lastOperated = new Date();
    }

    getLastOperated(): Date {
        return this.lastOperated;
    }

    valueOf(): string {
        return this.id + ":" + this.version;
    }

    equals(state: BranchOperationalTransformationState<T>): boolean {
        return this.id === state.id && this.version === state.version;
    }

    setValue(value: T): void {
        this.value = value;
    }

    getValue(): T {
        return this.value;
    }

    toString(): string {
        return this.value.toString();
    }
}