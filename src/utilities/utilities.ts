import * as _ from 'lodash';

type BooleanFunction = (val: unknown) => boolean;


export const countIf = (arr: Array<unknown>, func: BooleanFunction): number => {
    return _.sumBy(arr, (elm: unknown): number => func(elm) ? 1: 0);
};

export const countNil = (arr: Array<unknown>): number => {
    return countIf(arr, _.isNil);
};

export const countNotNil = (arr: Array<unknown>): number => {
    return countIf(arr, _.negate(_.isNil));    
};
