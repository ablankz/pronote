export class SBTOwner {
    constructor(
        protected id: string,
        protected name: string,
    ) {
    }

    getName(): string {
        return this.name;
    }

    toString(): string {
        return this.name;
    }
}