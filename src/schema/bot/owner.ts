export class BOTOwner {
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

export class BOTOperationalOwner extends BOTOwner {
    constructor(
        protected id: string,
        protected name: string,
        protected operationalOwner: string,
    ) {
        super(id, name);
    }

    getOperationalOwner(): string {
        return this.operationalOwner;
    }

    toString(): string {
        return `${super.toString()} - ${this.operationalOwner}`;
    }
}