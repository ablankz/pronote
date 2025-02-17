export type ConditionType = 'and' | 'or';

export type Condition = () => boolean;

export type ConditionValue<T> = {
    default: T;
    branches: ConditionBranch<T>[];
}

export type ConditionBranch<T> = ConditionValue<T> & {
    type: ConditionType;
    conditions: Condition[];
}