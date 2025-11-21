export type ConditionType = 'and' | 'or';

/**
 * @todo state param needs to be added
 */
export type ConditionFunc = () => boolean;

export type ConditionValue<T> = {
    default: T;
    branches: ConditionBranch<T>[];
}

export type ConditionBranch<T> = ConditionValue<T> & {
    type: ConditionType;
    conditions: ConditionFunc[];
}