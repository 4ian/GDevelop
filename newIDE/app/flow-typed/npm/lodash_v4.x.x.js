// flow-typed signature: 6ffeb5ba42262fa25fa1631fa91c9c35
// flow-typed version: 40e826f489/lodash_v4.x.x/flow_>=v0.104.x

declare module "lodash" {
  declare type Path = $ReadOnlyArray<string | number> | string | number;
  declare type __CurriedFunction1<A, R, AA: A> = (...r: [AA]) => R;
  declare type CurriedFunction1<A, R> = __CurriedFunction1<A, R, any>;

  declare type __CurriedFunction2<A, B, R, AA: A, BB: B> = ((
    ...r: [AA]
  ) => CurriedFunction1<BB, R>) &
    ((...r: [AA, BB]) => R);
  declare type CurriedFunction2<A, B, R> = __CurriedFunction2<A, B, R, any, any>;

  declare type __CurriedFunction3<A, B, C, R, AA: A, BB: B, CC: C> = ((
    ...r: [AA]
  ) => CurriedFunction2<BB, CC, R>) &
    ((...r: [AA, BB]) => CurriedFunction1<CC, R>) &
    ((...r: [AA, BB, CC]) => R);
  declare type CurriedFunction3<A, B, C, R> = __CurriedFunction3<A, B, C, R, any, any, any>;

  declare type __CurriedFunction4<
    A,
    B,
    C,
    D,
    R,
    AA: A,
    BB: B,
    CC: C,
    DD: D
  > = ((...r: [AA]) => CurriedFunction3<BB, CC, DD, R>) &
    ((...r: [AA, BB]) => CurriedFunction2<CC, DD, R>) &
    ((...r: [AA, BB, CC]) => CurriedFunction1<DD, R>) &
    ((...r: [AA, BB, CC, DD]) => R);
  declare type CurriedFunction4<A, B, C, D, R> = __CurriedFunction4<A, B, C, D, R, any, any, any, any>;

  declare type __CurriedFunction5<
    A,
    B,
    C,
    D,
    E,
    R,
    AA: A,
    BB: B,
    CC: C,
    DD: D,
    EE: E
  > = ((...r: [AA]) => CurriedFunction4<BB, CC, DD, EE, R>) &
    ((...r: [AA, BB]) => CurriedFunction3<CC, DD, EE, R>) &
    ((...r: [AA, BB, CC]) => CurriedFunction2<DD, EE, R>) &
    ((...r: [AA, BB, CC, DD]) => CurriedFunction1<EE, R>) &
    ((...r: [AA, BB, CC, DD, EE]) => R);
  declare type CurriedFunction5<A, B, C, D, E, R> = __CurriedFunction5<A, B, C, D, E, R, any, any, any, any, any>;

  declare type __CurriedFunction6<
    A,
    B,
    C,
    D,
    E,
    F,
    R,
    AA: A,
    BB: B,
    CC: C,
    DD: D,
    EE: E,
    FF: F
  > = ((...r: [AA]) => CurriedFunction5<BB, CC, DD, EE, FF, R>) &
    ((...r: [AA, BB]) => CurriedFunction4<CC, DD, EE, FF, R>) &
    ((...r: [AA, BB, CC]) => CurriedFunction3<DD, EE, FF, R>) &
    ((...r: [AA, BB, CC, DD]) => CurriedFunction2<EE, FF, R>) &
    ((...r: [AA, BB, CC, DD, EE]) => CurriedFunction1<FF, R>) &
    ((...r: [AA, BB, CC, DD, EE, FF]) => R);
  declare type CurriedFunction6<A, B, C, D, E, F, R> = __CurriedFunction6<A, B, C, D, E, F, R, any, any, any, any, any, any>;

  declare type Curry = (<A, R>((...r: [A]) => R) => CurriedFunction1<A, R>) &
    (<A, B, R>((...r: [A, B]) => R) => CurriedFunction2<A, B, R>) &
    (<A, B, C, R>((...r: [A, B, C]) => R) => CurriedFunction3<A, B, C, R>) &
    (<A, B, C, D, R>(
      (...r: [A, B, C, D]) => R
    ) => CurriedFunction4<A, B, C, D, R>) &
    (<A, B, C, D, E, R>(
      (...r: [A, B, C, D, E]) => R
    ) => CurriedFunction5<A, B, C, D, E, R>) &
    (<A, B, C, D, E, F, R>(
      (...r: [A, B, C, D, E, F]) => R
    ) => CurriedFunction6<A, B, C, D, E, F, R>);

  declare type UnaryFn<A, R> = (a: A) => R;

  declare type TemplateSettings = {
    escape?: RegExp,
    evaluate?: RegExp,
    imports?: Object,
    interpolate?: RegExp,
    variable?: string,
    ...
  };

  declare type TruncateOptions = {
    length?: number,
    omission?: string,
    separator?: RegExp | string,
    ...
  };

  declare type Cancelable = {
    cancel: () => void,
    flush: () => mixed,
    ...
  };

  declare type DebounceOptions = {
    leading?: boolean,
    maxWait?: number,
    trailing?: boolean,
    ...
  };

  declare type ThrottleOptions = {
    leading?: boolean,
    trailing?: boolean,
    ...
  };

  declare type NestedArray<T> = Array<Array<T>>;

  declare type matchesIterateeShorthand = { [key: any]: any, ... };
  declare type matchesPropertyIterateeShorthand = [string, any];
  declare type propertyIterateeShorthand = string;

  declare type OPredicate<A, O> =
    | ((value: A, key: string, object: O) => any)
    | matchesIterateeShorthand
    | matchesPropertyIterateeShorthand
    | propertyIterateeShorthand;

  declare type OIterateeWithResult<V, O, R> =
    | Object
    | string
    | ((value: V, key: string, object: O) => R);
  declare type OIteratee<O> = OIterateeWithResult<any, O, any>;
  declare type OFlatMapIteratee<T, U> = OIterateeWithResult<any, T, Array<U>>;

  declare type Predicate<T> =
    | ((value: T, index: number, array: Array<T>) => any)
    | matchesIterateeShorthand
    | matchesPropertyIterateeShorthand
    | propertyIterateeShorthand;

  declare type _ValueOnlyIteratee<T> = (value: T) => mixed;
  declare type ValueOnlyIteratee<T> = _ValueOnlyIteratee<T> | string;
  declare type _Iteratee<T> = (
    item: T,
    index: number,
    array: ?Array<T>
  ) => mixed;
  declare type Iteratee<T> = _Iteratee<T> | Object | string;
  declare type FlatMapIteratee<T, U> =
    | ((item: T, index: number, array: ?$ReadOnlyArray<T>) => Array<U>)
    | Object
    | string;
  declare type Comparator<T> = (item: T, item2: T) => boolean;

  declare type ReadOnlyMapIterator<T, U> =
    | ((item: T, index: number, array: $ReadOnlyArray<T>) => U)
    | propertyIterateeShorthand;

  declare type OMapIterator<T, O, U> =
    | ((item: T, key: string, object: O) => U)
    | propertyIterateeShorthand;

  declare class Lodash {
    // Array
    chunk<T>(array?: ?$ReadOnlyArray<T>, size?: ?number): Array<Array<T>>;
    compact<T, N: ?T>(array?: ?$ReadOnlyArray<N>): Array<T>;
    concat<T>(
      base?: ?$ReadOnlyArray<T>,
      ...elements: Array<any>
    ): Array<T | any>;
    difference<T>(
      array?: ?$ReadOnlyArray<T>,
      ...values: Array<?$ReadOnlyArray<T>>
    ): Array<T>;
    differenceBy<T, U>(
      array?: ?$ReadOnlyArray<T>,
      values?: ?$ReadOnlyArray<U>,
      iteratee?: ?ValueOnlyIteratee<T | U>
    ): Array<T>;
    differenceWith<T, U>(
      array?: ?$ReadOnlyArray<T>,
      values?: ?$ReadOnlyArray<U>,
      comparator?: ?(item: T, item2: U) => boolean
    ): Array<T>;
    drop<T>(array?: ?$ReadOnlyArray<T>, n?: ?number): Array<T>;
    dropRight<T>(array?: ?$ReadOnlyArray<T>, n?: ?number): Array<T>;
    dropRightWhile<T>(array?: ?$ReadOnlyArray<T>, predicate?: ?Predicate<T>): Array<T>;
    dropWhile<T>(array?: ?$ReadOnlyArray<T>, predicate?: ?Predicate<T>): Array<T>;
    fill<T, U>(
      array?: ?Array<T>,
      value?: ?U,
      start?: ?number,
      end?: ?number
    ): Array<T | U>;
    findIndex<T>(
      array: $ReadOnlyArray<T>,
      predicate?: ?Predicate<T>,
      fromIndex?: ?number
    ): number;
    findIndex<T>(
      array: void | null,
      predicate?: ?Predicate<T>,
      fromIndex?: ?number
    ): -1;
    findLastIndex<T>(
      array: $ReadOnlyArray<T>,
      predicate?: ?Predicate<T>,
      fromIndex?: ?number
    ): number;
    findLastIndex<T>(
      array: void | null,
      predicate?: ?Predicate<T>,
      fromIndex?: ?number
    ): -1;
    // alias of _.head
    first<T>(array: ?$ReadOnlyArray<T>): T;
    flatten<T, X>(array?: ?$ReadOnlyArray<$ReadOnlyArray<T> | X>): Array<T | X>;
    flattenDeep<T>(array?: ?$ReadOnlyArray<any>): Array<T>;
    flattenDepth(array?: ?$ReadOnlyArray<any>, depth?: ?number): Array<any>;
    fromPairs<A, B>(pairs?: ?$ReadOnlyArray<[A, B]>): {| [key: A]: B |};
    head<T>(array: ?$ReadOnlyArray<T>): T;
    indexOf<T>(array: $ReadOnlyArray<T>, value: T, fromIndex?: number): number;
    indexOf<T>(array: void | null, value?: ?T, fromIndex?: ?number): -1;
    initial<T>(array: ?$ReadOnlyArray<T>): Array<T>;
    intersection<T>(...arrays?: Array<$ReadOnlyArray<T>>): Array<T>;
    //Workaround until (...parameter: T, parameter2: U) works
    intersectionBy<T>(
      a1?: ?$ReadOnlyArray<T>,
      iteratee?: ?ValueOnlyIteratee<T>
    ): Array<T>;
    intersectionBy<T>(
      a1?: ?$ReadOnlyArray<T>,
      a2?: ?$ReadOnlyArray<T>,
      iteratee?: ?ValueOnlyIteratee<T>
    ): Array<T>;
    intersectionBy<T>(
      a1?: ?$ReadOnlyArray<T>,
      a2?: ?$ReadOnlyArray<T>,
      a3?: ?$ReadOnlyArray<T>,
      iteratee?: ?ValueOnlyIteratee<T>
    ): Array<T>;
    intersectionBy<T>(
      a1?: ?$ReadOnlyArray<T>,
      a2?: ?$ReadOnlyArray<T>,
      a3?: ?$ReadOnlyArray<T>,
      a4?: ?$ReadOnlyArray<T>,
      iteratee?: ?ValueOnlyIteratee<T>
    ): Array<T>;
    //Workaround until (...parameter: T, parameter2: U) works
    intersectionWith<T>(
      a1?: ?$ReadOnlyArray<T>,
      comparator?: ?Comparator<T>
    ): Array<T>;
    intersectionWith<T>(
      a1?: ?$ReadOnlyArray<T>,
      a2?: ?$ReadOnlyArray<T>,
      comparator?: ?Comparator<T>
    ): Array<T>;
    intersectionWith<T>(
      a1?: ?$ReadOnlyArray<T>,
      a2?: ?$ReadOnlyArray<T>,
      a3?: ?$ReadOnlyArray<T>,
      comparator?: ?Comparator<T>
    ): Array<T>;
    intersectionWith<T>(
      a1?: ?$ReadOnlyArray<T>,
      a2?: ?$ReadOnlyArray<T>,
      a3?: ?$ReadOnlyArray<T>,
      a4?: ?$ReadOnlyArray<T>,
      comparator?: ?Comparator<T>
    ): Array<T>;
    join<T>(array: $ReadOnlyArray<T>, separator?: ?string): string;
    join<T>(array: void | null, separator?: ?string): "";
    last<T>(array: ?$ReadOnlyArray<T>): T;
    lastIndexOf<T>(array: $ReadOnlyArray<T>, value?: ?T, fromIndex?: ?number): number;
    lastIndexOf<T>(array: void | null, value?: ?T, fromIndex?: ?number): -1;
    nth<T>(array: $ReadOnlyArray<T>, n?: ?number): T;
    nth(array: void | null, n?: ?number): void;
    pull<T>(array: Array<T>, ...values?: $ReadOnlyArray<?T>): Array<T>;
    pull<T: void | null>(array: T, ...values?: $ReadOnlyArray<?any>): T;
    pullAll<T>(array: Array<T>, values?: ?$ReadOnlyArray<T>): Array<T>;
    pullAll<T: void | null>(array: T, values?: ?$ReadOnlyArray<any>): T;
    pullAllBy<T>(
      array: Array<T>,
      values?: ?$ReadOnlyArray<T>,
      iteratee?: ?ValueOnlyIteratee<T>
    ): Array<T>;
    pullAllBy<T: void | null>(
      array: T,
      values?: ?$ReadOnlyArray<any>,
      iteratee?: ?ValueOnlyIteratee<any>
    ): T;
   pullAllWith<T: void | null>(
      array: T,
      values?: ?$ReadOnlyArray<any>,
      comparator?: ?Function
    ): T;
    pullAllWith<T>(array: Array<T>, values?: ?(Array<T>), comparator?: ?Function): Array<T>;
    pullAt<T>(array?: ?Array<T>, ...indexed?: Array<?number>): Array<T>;
    pullAt<T>(array?: ?Array<T>, indexed?: ?Array<number>): Array<T>;
    remove<T>(array?: ?Array<T>, predicate?: ?Predicate<T>): Array<T>;
    reverse<T>(array: Array<T>): Array<T>;
    reverse<T: void | null>(array: T): T;
    slice<T>(
      array?: ?$ReadOnlyArray<T>,
      start?: ?number,
      end?: ?number
    ): Array<T>;
    sortedIndex<T>(array: $ReadOnlyArray<T>, value: T): number;
    sortedIndex<T>(array: void | null, value: ?T): 0;
    sortedIndexBy<T>(
      array: $ReadOnlyArray<T>,
      value?: ?T,
      iteratee?: ?ValueOnlyIteratee<T>
    ): number;
    sortedIndexBy<T>(
      array: void | null,
      value?: ?T,
      iteratee?: ?ValueOnlyIteratee<T>
    ): 0;
    sortedIndexOf<T>(array: $ReadOnlyArray<T>, value: T): number;
    sortedIndexOf<T>(array: void | null, value?: ?T): -1;
    sortedLastIndex<T>(array: $ReadOnlyArray<T>, value: T): number;
    sortedLastIndex<T>(array: void | null, value?: ?T): 0;
    sortedLastIndexBy<T>(
      array: $ReadOnlyArray<T>,
      value: T,
      iteratee?: ValueOnlyIteratee<T>
    ): number;
    sortedLastIndexBy<T>(
      array: void | null,
      value?: ?T,
      iteratee?: ?ValueOnlyIteratee<T>
    ): 0;
    sortedLastIndexOf<T>(array: $ReadOnlyArray<T>, value: T): number;
    sortedLastIndexOf<T>(array: void | null, value?: ?T): -1;
    sortedUniq<T>(array?: ?$ReadOnlyArray<T>): Array<T>;
    sortedUniqBy<T>(
      array?: ?$ReadOnlyArray<T>,
      iteratee?: ?ValueOnlyIteratee<T>
    ): Array<T>;
    tail<T>(array?: ?$ReadOnlyArray<T>): Array<T>;
    take<T>(array?: ?$ReadOnlyArray<T>, n?: ?number): Array<T>;
    takeRight<T>(array?: ?$ReadOnlyArray<T>, n?: ?number): Array<T>;
    takeRightWhile<T>(array?: ?$ReadOnlyArray<T>, predicate?: ?Predicate<T>): Array<T>;
    takeWhile<T>(array?: ?$ReadOnlyArray<T>, predicate?: ?Predicate<T>): Array<T>;
    union<T>(...arrays?: Array<$ReadOnlyArray<T>>): Array<T>;
    //Workaround until (...parameter: T, parameter2: U) works
    unionBy<T>(
      a1?: ?$ReadOnlyArray<T>,
      iteratee?: ?ValueOnlyIteratee<T>
    ): Array<T>;
    unionBy<T>(
      a1?: ?$ReadOnlyArray<T>,
      a2: $ReadOnlyArray<T>,
      iteratee?: ValueOnlyIteratee<T>
    ): Array<T>;
    unionBy<T>(
      a1: $ReadOnlyArray<T>,
      a2: $ReadOnlyArray<T>,
      a3: $ReadOnlyArray<T>,
      iteratee?: ValueOnlyIteratee<T>
    ): Array<T>;
    unionBy<T>(
      a1: $ReadOnlyArray<T>,
      a2: $ReadOnlyArray<T>,
      a3: $ReadOnlyArray<T>,
      a4: $ReadOnlyArray<T>,
      iteratee?: ValueOnlyIteratee<T>
    ): Array<T>;
    //Workaround until (...parameter: T, parameter2: U) works
    unionWith<T>(a1?: ?$ReadOnlyArray<T>, comparator?: ?Comparator<T>): Array<T>;
    unionWith<T>(
      a1: $ReadOnlyArray<T>,
      a2: $ReadOnlyArray<T>,
      comparator?: Comparator<T>
    ): Array<T>;
    unionWith<T>(
      a1: $ReadOnlyArray<T>,
      a2: $ReadOnlyArray<T>,
      a3: $ReadOnlyArray<T>,
      comparator?: Comparator<T>
    ): Array<T>;
    unionWith<T>(
      a1: $ReadOnlyArray<T>,
      a2: $ReadOnlyArray<T>,
      a3: $ReadOnlyArray<T>,
      a4: $ReadOnlyArray<T>,
      comparator?: Comparator<T>
    ): Array<T>;
    uniq<T>(array?: ?$ReadOnlyArray<T>): Array<T>;
    uniqBy<T>(array?: ?$ReadOnlyArray<T>, iteratee?: ?ValueOnlyIteratee<T>): Array<T>;
    uniqWith<T>(array?: ?$ReadOnlyArray<T>, comparator?: ?Comparator<T>): Array<T>;
    unzip<T>(array?: ?$ReadOnlyArray<T>): Array<T>;
    unzipWith<T>(array: ?$ReadOnlyArray<T>, iteratee?: ?Iteratee<T>): Array<T>;
    without<T>(array?: ?$ReadOnlyArray<T>, ...values?: Array<?T>): Array<T>;
    xor<T>(...array: $ReadOnlyArray<$ReadOnlyArray<T>>): Array<T>;
    //Workaround until (...parameter: T, parameter2: U) works
    xorBy<T>(a1?: ?$ReadOnlyArray<T>, iteratee?: ?ValueOnlyIteratee<T>): Array<T>;
    xorBy<T>(
      a1: $ReadOnlyArray<T>,
      a2: $ReadOnlyArray<T>,
      iteratee?: ValueOnlyIteratee<T>
    ): Array<T>;
    xorBy<T>(
      a1: $ReadOnlyArray<T>,
      a2: $ReadOnlyArray<T>,
      a3: $ReadOnlyArray<T>,
      iteratee?: ValueOnlyIteratee<T>
    ): Array<T>;
    xorBy<T>(
      a1: $ReadOnlyArray<T>,
      a2: $ReadOnlyArray<T>,
      a3: $ReadOnlyArray<T>,
      a4: $ReadOnlyArray<T>,
      iteratee?: ValueOnlyIteratee<T>
    ): Array<T>;
    //Workaround until (...parameter: T, parameter2: U) works
    xorWith<T>(a1?: ?$ReadOnlyArray<T>, comparator?: ?Comparator<T>): Array<T>;
    xorWith<T>(
      a1: $ReadOnlyArray<T>,
      a2: $ReadOnlyArray<T>,
      comparator?: Comparator<T>
    ): Array<T>;
    xorWith<T>(
      a1: $ReadOnlyArray<T>,
      a2: $ReadOnlyArray<T>,
      a3: $ReadOnlyArray<T>,
      comparator?: Comparator<T>
    ): Array<T>;
    xorWith<T>(
      a1: $ReadOnlyArray<T>,
      a2: $ReadOnlyArray<T>,
      a3: $ReadOnlyArray<T>,
      a4: $ReadOnlyArray<T>,
      comparator?: Comparator<T>
    ): Array<T>;
    zip<A, B>(a1?: ?($ReadOnlyArray<A>), a2?: ?($ReadOnlyArray<B>)): Array<[A, B]>;
    zip<A, B, C>(a1: $ReadOnlyArray<A>, a2: $ReadOnlyArray<B>, a3: $ReadOnlyArray<C>): Array<[A, B, C]>;
    zip<A, B, C, D>(a1: $ReadOnlyArray<A>, a2: $ReadOnlyArray<B>, a3: $ReadOnlyArray<C>, a4: $ReadOnlyArray<D>): Array<[A, B, C, D]>;
    zip<A, B, C, D, E>(
      a1: $ReadOnlyArray<A>,
      a2: $ReadOnlyArray<B>,
      a3: $ReadOnlyArray<C>,
      a4: $ReadOnlyArray<D>,
      a5: $ReadOnlyArray<E>
    ): Array<[A, B, C, D, E]>;

    zipObject<K, V>(props: $ReadOnlyArray<K>, values?: ?$ReadOnlyArray<V>): { [key: K]: V, ... };
    zipObject<K, V>(props: void | null, values?: ?$ReadOnlyArray<V>): {...};
    zipObjectDeep(props: $ReadOnlyArray<any>, values?: ?any): Object;
    zipObjectDeep(props: void | null, values?: ?any): {...};

    zipWith<A>(a1?: ?$ReadOnlyArray<A>): Array<[A]>;
    zipWith<T, A>(a1: $ReadOnlyArray<A>, iteratee: (A) => T): Array<T>;

    zipWith<A, B>(a1: $ReadOnlyArray<A>, a2: $ReadOnlyArray<B>): Array<[A, B]>;
    zipWith<T, A, B>(
      a1: $ReadOnlyArray<A>,
      a2: $ReadOnlyArray<B>,
      iteratee: (A, B) => T
    ): Array<T>;

    zipWith<A, B, C>(
      a1: $ReadOnlyArray<A>,
      a2: $ReadOnlyArray<B>,
      a3: $ReadOnlyArray<C>
    ): Array<[A, B, C]>;
    zipWith<T, A, B, C>(
      a1: $ReadOnlyArray<A>,
      a2: $ReadOnlyArray<B>,
      a3: $ReadOnlyArray<C>,
      iteratee: (A, B, C) => T
    ): Array<T>;

    zipWith<A, B, C, D>(
      a1: $ReadOnlyArray<A>,
      a2: $ReadOnlyArray<B>,
      a3: $ReadOnlyArray<C>,
      a4: $ReadOnlyArray<D>
    ): Array<[A, B, C, D]>;
    zipWith<T, A, B, C, D>(
      a1: $ReadOnlyArray<A>,
      a2: $ReadOnlyArray<B>,
      a3: $ReadOnlyArray<C>,
      a4: $ReadOnlyArray<D>,
      iteratee: (A, B, C, D) => T
    ): Array<T>;

    // Collection
    countBy<T>(array: $ReadOnlyArray<T>, iteratee?: ?ValueOnlyIteratee<T>): { [string]: number, ... };
    countBy<T>(array: void | null, iteratee?: ?ValueOnlyIteratee<T>): {...};
    countBy<T: Object>(object: T, iteratee?: ?ValueOnlyIteratee<T>): { [string]: number, ... };
    // alias of _.forEach
    each<T>(array: $ReadOnlyArray<T>, iteratee?: ?Iteratee<T>): Array<T>;
    each<T: void | null>(array: T, iteratee?: ?Iteratee<any>): T;
    each<T: Object>(object: T, iteratee?: ?OIteratee<T>): T;
    // alias of _.forEachRight
    eachRight<T>(array: $ReadOnlyArray<T>, iteratee?: ?Iteratee<T>): Array<T>;
    eachRight<T: void | null>(array: T, iteratee?: ?Iteratee<any>): T;
    eachRight<T: Object>(object: T, iteratee?: OIteratee<T>): T;
    every<T>(array?: ?$ReadOnlyArray<T>, iteratee?: ?Iteratee<T>): boolean;
    every<T: Object>(object: T, iteratee?: OIteratee<T>): boolean;
    filter<T>(array?: ?$ReadOnlyArray<T>, predicate?: ?Predicate<T>): Array<T>;
    filter<A, T: { [id: any]: A, ... }>(
      object: T,
      predicate?: OPredicate<A, T>
    ): Array<A>;
    find<T>(
      array: $ReadOnlyArray<T>,
      predicate?: ?Predicate<T>,
      fromIndex?: ?number
    ): T | void;
    find<T>(
      array: void | null,
      predicate?: ?Predicate<T>,
      fromIndex?: ?number
    ): void;
    find<V, A, T: { [id: any]: A, ... }>(
      object: T,
      predicate?: OPredicate<A, T>,
      fromIndex?: number
    ): V;
    findLast<T>(
      array: ?$ReadOnlyArray<T>,
      predicate?: ?Predicate<T>,
      fromIndex?: ?number
    ): T | void;
    findLast<V, A, T: { [id: any]: A, ... }>(
      object: T,
      predicate?: ?OPredicate<A, T>
    ): V;
    flatMap<T, U>(
      array?: ?$ReadOnlyArray<T>,
      iteratee?: ?FlatMapIteratee<T, U>
    ): Array<U>;
    flatMap<T: Object, U>(
      object: T,
      iteratee?: OFlatMapIteratee<T, U>
    ): Array<U>;
    flatMapDeep<T, U>(
      array?: ?$ReadOnlyArray<T>,
      iteratee?: ?FlatMapIteratee<T, U>
    ): Array<U>;
    flatMapDeep<T: Object, U>(
      object: T,
      iteratee?: ?OFlatMapIteratee<T, U>
    ): Array<U>;
    flatMapDepth<T, U>(
      array?: ?$ReadOnlyArray<T>,
      iteratee?: ?FlatMapIteratee<T, U>,
      depth?: ?number
    ): Array<U>;
    flatMapDepth<T: Object, U>(
      object: T,
      iteratee?: OFlatMapIteratee<T, U>,
      depth?: number
    ): Array<U>;
    forEach<T>(array: $ReadOnlyArray<T>, iteratee?: ?Iteratee<T>): Array<T>;
    forEach<T: void | null>(array: T, iteratee?: ?Iteratee<any>): T;
    forEach<T: Object>(object: T, iteratee?: ?OIteratee<T>): T;
    forEachRight<T>(
      array: $ReadOnlyArray<T>,
      iteratee?: ?Iteratee<T>
    ): Array<T>;
    forEachRight<T: void | null>(array: T, iteratee?: ?Iteratee<any>): T;
    forEachRight<T: Object>(object: T, iteratee?: ?OIteratee<T>): T;
    groupBy<V, T>(
      array: $ReadOnlyArray<T>,
      iteratee?: ?ValueOnlyIteratee<T>
    ): { [key: V]: Array<T>, ... };
    groupBy(array: void | null, iteratee?: ?ValueOnlyIteratee<any>): {...};
    groupBy<V, A, T: { [id: any]: A, ... }>(
      object: T,
      iteratee?: ValueOnlyIteratee<A>
    ): { [key: V]: Array<A>, ... };
    includes<T>(
      array: $ReadOnlyArray<T>,
      value: T,
      fromIndex?: ?number
    ): boolean;
    includes<T>(array: void | null, value?: ?T, fromIndex?: ?number): false;
    includes<T: Object>(object: T, value: any, fromIndex?: number): boolean;
    includes(str: string, value: string, fromIndex?: number): boolean;
    invokeMap<T>(
      array?: ?$ReadOnlyArray<T>,
      path?: ?((value: T) => Path) | Path,
      ...args?: Array<any>
    ): Array<any>;
    invokeMap<T: Object>(
      object: T,
      path: ((value: any) => Path) | Path,
      ...args?: Array<any>
    ): Array<any>;
    keyBy<T, V>(
      array: $ReadOnlyArray<T>,
      iteratee?: ?ValueOnlyIteratee<T>
    ): { [key: V]: T, ... };
    keyBy(array: void | null, iteratee?: ?ValueOnlyIteratee<any>): {...};
    keyBy<V, A, I, T: { [id: I]: A, ... }>(
      object: T,
      iteratee?: ?ValueOnlyIteratee<A>
    ): { [key: V]: A, ... };
    map<T, U>(
      array?: ?$ReadOnlyArray<T>,
      iteratee?: ?ReadOnlyMapIterator<T, U>
    ): Array<U>;
    map<V, T: Object, U>(
      object: ?T,
      iteratee?: OMapIterator<V, T, U>
    ): Array<U>;
    map(
      str: ?string,
      iteratee?: (char: string, index: number, str: string) => any
    ): string;
    orderBy<T>(
      array: $ReadOnlyArray<T>,
      iteratees?: ?$ReadOnlyArray<Iteratee<T>> | ?string,
      orders?: ?$ReadOnlyArray<"asc" | "desc"> | ?string
    ): Array<T>;
    orderBy<T>(
      array: null | void,
      iteratees?: ?$ReadOnlyArray<Iteratee<T>> | ?string,
      orders?: ?$ReadOnlyArray<"asc" | "desc"> | ?string
    ): Array<T>;
    orderBy<V, T: {...}>(
      object: T,
      iteratees?: $ReadOnlyArray<OIteratee<any>> | string,
      orders?: $ReadOnlyArray<"asc" | "desc"> | string
    ): Array<V>;
    partition<T>(
      array?: ?$ReadOnlyArray<T>,
      predicate?: ?Predicate<T>
    ): [Array<T>, Array<T>];
    partition<V, A, T: { [id: any]: A, ... }>(
      object: T,
      predicate?: OPredicate<A, T>
    ): [Array<V>, Array<V>];
    reduce<T, U>(
      array: $ReadOnlyArray<T>,
      iteratee?: (
        accumulator: U,
        value: T,
        index: number,
        array: ?Array<T>
      ) => U,
      accumulator?: U
    ): U;
    reduce<T, U>(
      array: void | null,
      iteratee?: ?(
        accumulator: U,
        value: T,
        index: number,
        array: ?Array<T>
      ) => U,
      accumulator?: ?U
    ): void | null;
    reduce<T: Object, U>(
      object: T,
      iteratee?: (accumulator: U, value: any, key: string, object: T) => U,
      accumulator?: U
    ): U;
    reduceRight<T, U>(
      array: void | null,
      iteratee?: ?(
        accumulator: U,
        value: T,
        index: number,
        array: ?Array<T>
      ) => U,
      accumulator?: ?U
    ): void | null;
    reduceRight<T, U>(
      array: $ReadOnlyArray<T>,
      iteratee?: ?(
        accumulator: U,
        value: T,
        index: number,
        array: ?Array<T>
      ) => U,
      accumulator?: ?U
    ): U;
    reduceRight<T: Object, U>(
      object: T,
      iteratee?: ?(accumulator: U, value: any, key: string, object: T) => U,
      accumulator?: ?U
    ): U;
    reject<T>(array: ?$ReadOnlyArray<T>, predicate?: Predicate<T>): Array<T>;
    reject<V: Object, A, T: { [id: any]: A, ... }>(
      object?: ?T,
      predicate?: ?OPredicate<A, T>
    ): Array<V>;
    sample<T>(array: ?Array<T>): T;
    sample<V, T: Object>(object: T): V;
    sampleSize<T>(array?: ?Array<T>, n?: ?number): Array<T>;
    sampleSize<V, T: Object>(object: T, n?: number): Array<V>;
    shuffle<T>(array: ?Array<T>): Array<T>;
    shuffle<V, T: Object>(object: T): Array<V>;
    size(collection: $ReadOnlyArray<any> | Object | string): number;
    some<T>(array: void | null, predicate?: ?Predicate<T>): false;
    some<T>(array: ?$ReadOnlyArray<T>, predicate?: Predicate<T>): boolean;
    some<A, T: { [id: any]: A, ... }>(
      object?: ?T,
      predicate?: OPredicate<A, T>
    ): boolean;
    sortBy<T>(
      array: ?$ReadOnlyArray<T>,
      ...iteratees?: $ReadOnlyArray<Iteratee<T>>
    ): Array<T>;
    sortBy<T>(
      array: ?$ReadOnlyArray<T>,
      iteratees?: $ReadOnlyArray<Iteratee<T>>
    ): Array<T>;
    sortBy<V, T: Object>(
      object: T,
      ...iteratees?: Array<OIteratee<T>>
    ): Array<V>;
    sortBy<V, T: Object>(
      object: T,
      iteratees?: $ReadOnlyArray<OIteratee<T>>
    ): Array<V>;

    // Date
    now(): number;

    // Function
    after(n: number, fn: Function): Function;
    ary(func: Function, n?: number): Function;
    before(n: number, fn: Function): Function;
    bind<F:(...Array<any>) => any>(func: F, thisArg: any, ...partials: Array<any>): F;
    bindKey(obj?: ?Object, key?: ?string, ...partials?: Array<?any>): Function;
    curry: Curry;
    curry(func: Function, arity?: number): Function;
    curryRight(func: Function, arity?: number): Function;
    debounce<F: (...Array<any>) => any>(
      func: F,
      wait?: number,
      options?: DebounceOptions
    ): F & Cancelable;
    defer(func: (...Array<any>) => any, ...args?: Array<any>): TimeoutID;
    delay(func: Function, wait: number, ...args?: Array<any>): TimeoutID;
    flip<R>(func: (...Array<any>) => R): (...Array<any>) => R;
    memoize<A, R>(func: (...A) => R, resolver?: (...A) => any): (...A) => R;
    negate<A, R>(predicate: (...A) => R): (...A) => boolean;
    once<F: (...Array<any>) => any>(func: F): F;
    overArgs(func?: ?Function, ...transforms?: Array<Function>): Function;
    overArgs(func?: ?Function, transforms?: ?Array<Function>): Function;
    partial<R>(func: (...Array<any>) => R, ...partials: Array<any>): (...Array<any>) => R;
    partialRight<R>(func: (...Array<any>) => R, ...partials: Array<any>): (...Array<any>) => R;
    partialRight<R>(func: (...Array<any>) => R, partials: Array<any>): (...Array<any>) => R;
    rearg(func: Function, ...indexes: Array<number>): Function;
    rearg(func: Function, indexes: Array<number>): Function;
    rest(func: Function, start?: number): Function;
    spread(func: Function): Function;
    throttle<F: (...Array<any>) => any>(
      func: F,
      wait?: number,
      options?: ThrottleOptions
    ): F & Cancelable;
    unary<F: (...Array<any>) => any>(func: F): F;
    wrap(value?: any, wrapper?: ?Function): Function;

    // Lang
    castArray(value: any): Array<any>;
    clone<T>(value: T): T;
    cloneDeep<T>(value: T): T;
    cloneDeepWith<T, U>(
      value: T,
      customizer?: ?(value: T, key: number | string, object: T, stack: any) => U
    ): U;
    cloneWith<T, U>(
      value: T,
      customizer?: ?(value: T, key: number | string, object: T, stack: any) => U
    ): U;
    conformsTo<T: { [key: string]: mixed, ... }>(
      source: T,
      predicates: T & { [key: string]: (x: any) => boolean, ... }
    ): boolean;
    eq(value: any, other: any): boolean;
    gt(value: any, other: any): boolean;
    gte(value: any, other: any): boolean;
    isArguments(value: void | null): false;
    isArguments(value: any): boolean;
    isArray(value: Array<any>): true;
    isArray(value: any): false;
    isArrayBuffer(value: ArrayBuffer): true;
    isArrayBuffer(value: any): false;
    isArrayLike(value: Array<any> | string | { length: number, ... }): true;
    isArrayLike(value: any): false;
    isArrayLikeObject(value: { length: number, ... } | Array<any>): true;
    isArrayLikeObject(value: any): false;
    isBoolean(value: boolean): true;
    isBoolean(value: any): false;
    isBuffer(value: void | null): false;
    isBuffer(value: any): boolean;
    isDate(value: Date): true;
    isDate(value: any): false;
    isElement(value: any): true;
    isElement(value: any): false;
    isEmpty(value: void | null | "" | {...} | [] | number | boolean): true;
    isEmpty(value: any): boolean;
    isEqual(value: any, other: any): boolean;
    isEqualWith<T, U>(
      value?: ?T,
      other?: ?U,
      customizer?: ?(
        objValue: any,
        otherValue: any,
        key: number | string,
        object: T,
        other: U,
        stack: any
      ) => boolean | void
    ): boolean;
    isError(value: Error): true;
    isError(value: any): false;
    isFinite(value: number): boolean;
    isFinite(value: any): false;
    isFunction(value: Function): true;
    isFunction(value: any): false;
    isInteger(value: number): boolean;
    isInteger(value: any): false;
    isLength(value: void | null): false;
    isLength(value: any): boolean;
    isMap(value: Map<any, any>): true;
    isMap(value: any): false;
    isMatch(object?: ?Object, source?: ?Object): boolean;
    isMatchWith<T: Object, U: Object>(
      object?: ?T,
      source?: ?U,
      customizer?: ?(
        objValue: any,
        srcValue: any,
        key: number | string,
        object: T,
        source: U
      ) => boolean | void
    ): boolean;
    isNaN(value: number): boolean;
    isNaN(value: any): false;
    isNative(value: number | string | void | null | Object): false;
    isNative(value: any): boolean;
    isNil(value: void | null): true;
    isNil(value: any): false;
    isNull(value: null): true;
    isNull(value: any): false;
    isNumber(value: number): true;
    isNumber(value: any): false;
    isObject(value: any): boolean;
    isObjectLike(value: void | null): false;
    isObjectLike(value: any): boolean;
    isPlainObject(value: any): boolean;
    isRegExp(value: RegExp): true;
    isRegExp(value: any): false;
    isSafeInteger(value: number): boolean;
    isSafeInteger(value: any): false;
    isSet(value: Set<any>): true;
    isSet(value: any): false;
    isString(value: string): true;
    isString(value: any): false;
    isSymbol(value: Symbol): true;
    isSymbol(value: any): false;
    isTypedArray(value: $TypedArray): true;
    isTypedArray(value: any): false;
    isUndefined(value: void): true;
    isUndefined(value: any): false;
    isWeakMap(value: WeakMap<any, any>): true;
    isWeakMap(value: any): false;
    isWeakSet(value: WeakSet<any>): true;
    isWeakSet(value: any): false;
    lt(value: any, other: any): boolean;
    lte(value: any, other: any): boolean;
    toArray(value: any): Array<any>;
    toFinite(value: void | null): 0;
    toFinite(value: any): number;
    toInteger(value: void | null): 0;
    toInteger(value: any): number;
    toLength(value: void | null): 0;
    toLength(value: any): number;
    toNumber(value: void | null): 0;
    toNumber(value: any): number;
    toPlainObject(value: any): Object;
    toSafeInteger(value: void | null): 0;
    toSafeInteger(value: any): number;
    toString(value: void | null): "";
    toString(value: any): string;

    // Math
    add(augend: number, addend: number): number;
    ceil(number: number, precision?: number): number;
    divide(dividend: number, divisor: number): number;
    floor(number: number, precision?: number): number;
    max<T>(array: ?$ReadOnlyArray<T>): T;
    maxBy<T>(array: ?$ReadOnlyArray<T>, iteratee?: Iteratee<T>): T;
    mean(array: Array<any>): number;
    meanBy<T>(array: Array<T>, iteratee?: Iteratee<T>): number;
    min<T>(array: ?$ReadOnlyArray<T>): T;
    minBy<T>(array: ?$ReadOnlyArray<T>, iteratee?: Iteratee<T>): T;
    multiply(multiplier: number, multiplicand: number): number;
    round(number: number, precision?: number): number;
    subtract(minuend: number, subtrahend: number): number;
    sum(array: Array<any>): number;
    sumBy<T>(array: $ReadOnlyArray<T>, iteratee?: Iteratee<T>): number;

    // number
    clamp(number?: number, lower?: ?number, upper?: ?number): number;
    clamp(number: ?number, lower?: ?number, upper?: ?number): 0;
    inRange(number: number, start?: number, end: number): boolean;
    random(lower?: number, upper?: number, floating?: boolean): number;

    // Object
    assign(object?: ?Object, ...sources?: Array<?Object>): Object;
    assignIn(): {...};
    assignIn<A, B>(a: A, b: B): A & B;
    assignIn<A, B, C>(a: A, b: B, c: C): A & B & C;
    assignIn<A, B, C, D>(a: A, b: B, c: C, d: D): A & B & C & D;
    assignIn<A, B, C, D, E>(a: A, b: B, c: C, d: D, e: E): A & B & C & D & E;
    assignInWith(): {...};
    assignInWith<T: Object, A: Object>(
      object: T,
      s1: A,
      customizer?: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A
      ) => any | void
    ): Object;
    assignInWith<T: Object, A: Object, B: Object>(
      object: T,
      s1: A,
      s2: B,
      customizer?: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A | B
      ) => any | void
    ): Object;
    assignInWith<T: Object, A: Object, B: Object, C: Object>(
      object: T,
      s1: A,
      s2: B,
      s3: C,
      customizer?: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A | B | C
      ) => any | void
    ): Object;
    assignInWith<T: Object, A: Object, B: Object, C: Object, D: Object>(
      object: T,
      s1: A,
      s2: B,
      s3: C,
      s4: D,
      customizer?: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A | B | C | D
      ) => any | void
    ): Object;
    assignWith(): {...};
    assignWith<T: Object, A: Object>(
      object: T,
      s1: A,
      customizer?: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A
      ) => any | void
    ): Object;
    assignWith<T: Object, A: Object, B: Object>(
      object: T,
      s1: A,
      s2: B,
      customizer?: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A | B
      ) => any | void
    ): Object;
    assignWith<T: Object, A: Object, B: Object, C: Object>(
      object: T,
      s1: A,
      s2: B,
      s3: C,
      customizer?: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A | B | C
      ) => any | void
    ): Object;
    assignWith<T: Object, A: Object, B: Object, C: Object, D: Object>(
      object: T,
      s1: A,
      s2: B,
      s3: C,
      s4: D,
      customizer?: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A | B | C | D
      ) => any | void
    ): Object;
    at(object?: ?Object, ...paths: Array<string>): Array<any>;
    at(object?: ?Object, paths: Array<string>): Array<any>;
    create(prototype: void | null, properties: void | null): {...};
    create<T>(prototype: T, properties: Object): T;
    create(prototype: any, properties: void | null): {...};
    defaults(object?: ?Object, ...sources?: Array<?Object>): Object;
    defaultsDeep(object?: ?Object, ...sources?: Array<?Object>): Object;
    // alias for _.toPairs
    entries(object?: ?Object): Array<[string, any]>;
    // alias for _.toPairsIn
    entriesIn(object?: ?Object): Array<[string, any]>;
    // alias for _.assignIn
    extend<A, B>(a?: ?A, b?: ?B): A & B;
    extend<A, B, C>(a: A, b: B, c: C): A & B & C;
    extend<A, B, C, D>(a: A, b: B, c: C, d: D): A & B & C & D;
    extend<A, B, C, D, E>(a: A, b: B, c: C, d: D, e: E): A & B & C & D & E;
    // alias for _.assignInWith
    extendWith<T: Object, A: Object>(
      object?: ?T,
      s1?: ?A,
      customizer?: ?(
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A
      ) => any | void
    ): Object;
    extendWith<T: Object, A: Object, B: Object>(
      object: T,
      s1: A,
      s2: B,
      customizer?: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A | B
      ) => any | void
    ): Object;
    extendWith<T: Object, A: Object, B: Object, C: Object>(
      object: T,
      s1: A,
      s2: B,
      s3: C,
      customizer?: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A | B | C
      ) => any | void
    ): Object;
    extendWith<T: Object, A: Object, B: Object, C: Object, D: Object>(
      object: T,
      s1: A,
      s2: B,
      s3: C,
      s4: D,
      customizer?: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A | B | C | D
      ) => any | void
    ): Object;
    findKey<A, T: { [id: any]: A, ... }>(
      object: T,
      predicate?: ?OPredicate<A, T>
    ): string | void;
    findKey<A, T: { [id: any]: A, ... }>(
      object: void | null,
      predicate?: ?OPredicate<A, T>
    ): void;
    findLastKey<A, T: { [id: any]: A, ... }>(
      object: T,
      predicate?: ?OPredicate<A, T>
    ): string | void;
    findLastKey<A, T: { [id: any]: A, ... }>(
      object: void | null,
      predicate?: ?OPredicate<A, T>
    ): void;
    forIn(object: Object, iteratee?: ?OIteratee<any>): Object;
    forIn(object: void | null, iteratee?: ?OIteratee<any>): null;
    forInRight(object: Object, iteratee?: ?OIteratee<any>): Object;
    forInRight(object: void | null, iteratee?: ?OIteratee<any>): null;
    forOwn(object: Object, iteratee?: ?OIteratee<any>): Object;
    forOwn(object: void | null, iteratee?: ?OIteratee<any>): null;
    forOwnRight(object: Object, iteratee?: ?OIteratee<any>): Object;
    forOwnRight(object: void | null, iteratee?: ?OIteratee<any>): null;
    functions(object?: ?Object): Array<string>;
    functionsIn(object?: ?Object): Array<string>;
    get(
      object?: ?Object | ?$ReadOnlyArray<any> | void | null,
      path?: ?Path,
      defaultValue?: any
    ): any;
    has(object: Object, path: Path): boolean;
    has(object: Object, path: void | null): false;
    has(object: void | null, path?: ?Path): false;
    hasIn(object: Object, path: Path): boolean;
    hasIn(object: Object, path: void | null): false;
    hasIn(object: void | null, path?: ?Path): false;
    invert(object: Object, multiVal?: ?boolean): Object;
    invert(object: void | null, multiVal?: ?boolean): {...};
    invertBy(object: Object, iteratee?: ?Function): Object;
    invertBy(object: void | null, iteratee?: ?Function): {...};
    invoke(
      object?: ?Object,
      path?: ?Path,
      ...args?: Array<any>
    ): any;
    keys<K>(object?: ?{ [key: K]: any, ... }): Array<K>;
    keys(object?: ?Object): Array<string>;
    keysIn(object?: ?Object): Array<string>;
    mapKeys(object: Object, iteratee?: ?OIteratee<any>): Object;
    mapKeys(object: void | null, iteratee?: ?OIteratee<any>): {...};
    mapValues(object: Object, iteratee?: ?OIteratee<any>): Object;
    mapValues(object: void | null, iteratee?: ?OIteratee<any>): {...};
    merge(object?: ?Object, ...sources?: Array<?Object>): Object;
    mergeWith(): {...};
    mergeWith<T: Object, A: Object>(
      object: T,
      customizer?: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A
      ) => any | void
    ): Object;
    mergeWith<T: Object, A: Object, B: Object>(
      object: T,
      s1: A,
      s2: B,
      customizer?: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A | B
      ) => any | void
    ): Object;
    mergeWith<T: Object, A: Object, B: Object, C: Object>(
      object: T,
      s1: A,
      s2: B,
      s3: C,
      customizer?: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A | B | C
      ) => any | void
    ): Object;
    mergeWith<T: Object, A: Object, B: Object, C: Object, D: Object>(
      object: T,
      s1: A,
      s2: B,
      s3: C,
      s4: D,
      customizer?: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A | B | C | D
      ) => any | void
    ): Object;
    omit(object?: ?Object, ...props: $ReadOnlyArray<string>): Object;
    omit(object?: ?Object, props: $ReadOnlyArray<string>): Object;
    omitBy<A, T: $ReadOnly<{ [id: any]: A, ... } | { [id: number]: A, ... }>>(
      object: $ReadOnly<T>,
      predicate?: ?OPredicate<A, T>
    ): Object;
    omitBy<A, T>(object: void | null, predicate?: ?OPredicate<A, T>): {...};
    pick(object?: ?Object, ...props: $ReadOnlyArray<string>): Object;
    pick(object?: ?Object, props: $ReadOnlyArray<string>): Object;
    pickBy<A, T: $ReadOnly<{ [id: any]: A, ... } | { [id: number]: A, ... }>>(
      object: $ReadOnly<T>,
      predicate?: ?OPredicate<A, T>
    ): Object;
    pickBy<A, T>(object: void | null, predicate?: ?OPredicate<A, T>): {...};
    result(
      object?: ?Object,
      path?: ?Path,
      defaultValue?: any
    ): any;
    set(object: Object, path?: ?Path, value: any): Object;
    set<T: void | null>(
      object: T,
      path?: ?Path,
      value?: ?any
    ): T;
    setWith<T>(
      object: T,
      path?: ?Path,
      value: any,
      customizer?: (nsValue: any, key: string, nsObject: T) => any
    ): Object;
    setWith<T: void | null>(
      object: T,
      path?: ?Path,
      value?: ?any,
      customizer?: ?(nsValue: any, key: string, nsObject: T) => any
    ): T;
    toPairs(object?: ?Object | Array<any>): Array<[string, any]>;
    toPairsIn(object?: ?Object): Array<[string, any]>;
    transform(
      collection: Object | $ReadOnlyArray<any>,
      iteratee?: ?OIteratee<any>,
      accumulator?: any
    ): any;
    transform(
      collection: void | null,
      iteratee?: ?OIteratee<any>,
      accumulator?: ?any
    ): {...};
    unset(object: void | null, path?: ?Path): true;
    unset(object: Object, path?: ?Path): boolean;
    update(object: Object, path: Path, updater: Function): Object;
    update<T: void | null>(
      object: T,
      path?: ?Path,
      updater?: ?Function
    ): T;
    updateWith(
      object: Object,
      path?: ?Path,
      updater?: ?Function,
      customizer?: ?Function
    ): Object;
    updateWith<T: void | null>(
      object: T,
      path?: ?Path,
      updater?: ?Function,
      customizer?: ?Function
    ): T;
    values(object?: ?Object): Array<any>;
    valuesIn(object?: ?Object): Array<any>;

    // Seq
    // harder to read, but this is _()
    (value: any): any;
    chain<T>(value: T): any;
    tap<T>(value: T, interceptor: (value: T) => any): T;
    thru<T1, T2>(value: T1, interceptor: (value: T1) => T2): T2;
    // TODO: _.prototype.*

    // String
    camelCase(string: string): string;
    camelCase(string: void | null): "";
    capitalize(string: string): string;
    capitalize(string: void | null): "";
    deburr(string: string): string;
    deburr(string: void | null): "";
    endsWith(string: string, target?: string, position?: ?number): boolean;
    endsWith(string: void | null, target?: ?string, position?: ?number): false;
    escape(string: string): string;
    escape(string: void | null): "";
    escapeRegExp(string: string): string;
    escapeRegExp(string: void | null): "";
    kebabCase(string: string): string;
    kebabCase(string: void | null): "";
    lowerCase(string: string): string;
    lowerCase(string: void | null): "";
    lowerFirst(string: string): string;
    lowerFirst(string: void | null): "";
    pad(string?: ?string, length?: ?number, chars?: ?string): string;
    padEnd(string?: ?string, length?: ?number, chars?: ?string): string;
    padStart(string?: ?string, length?: ?number, chars?: ?string): string;
    parseInt(string: string, radix?: ?number): number;
    repeat(string: string, n?: ?number): string;
    repeat(string: void | null, n?: ?number): "";
    replace(
      string: string,
      pattern: RegExp | string,
      replacement: ((string: string) => string) | string
    ): string;
    replace(
      string: void | null,
      pattern?: ?RegExp | ?string,
      replacement: ?((string: string) => string) | ?string
    ): "";
    snakeCase(string: string): string;
    snakeCase(string: void | null): "";
    split(
      string?: ?string,
      separator?: ?RegExp | ?string,
      limit?: ?number
    ): Array<string>;
    startCase(string: string): string;
    startCase(string: void | null): "";
    startsWith(string: string, target?: string, position?: number): boolean;
    startsWith(
      string: void | null,
      target?: ?string,
      position?: ?number
    ): false;
    template(string?: ?string, options?: ?TemplateSettings): Function;
    toLower(string: string): string;
    toLower(string: void | null): "";
    toUpper(string: string): string;
    toUpper(string: void | null): "";
    trim(string: string, chars?: string): string;
    trim(string: void | null, chars?: ?string): "";
    trimEnd(string: string, chars?: ?string): string;
    trimEnd(string: void | null, chars?: ?string): "";
    trimStart(string: string, chars?: ?string): string;
    trimStart(string: void | null, chars?: ?string): "";
    truncate(string: string, options?: TruncateOptions): string;
    truncate(string: void | null, options?: ?TruncateOptions): "";
    unescape(string: string): string;
    unescape(string: void | null): "";
    upperCase(string: string): string;
    upperCase(string: void | null): "";
    upperFirst(string: string): string;
    upperFirst(string: void | null): "";
    words(string?: ?string, pattern?: ?RegExp | ?string): Array<string>;

    // Util
    attempt(func: Function, ...args: Array<any>): any;
    bindAll(object: Object, methodNames?: ?Array<string>): Object;
    bindAll<T: void | null>(object: T, methodNames?: ?Array<string>): T;
    bindAll(object: Object, ...methodNames: Array<string>): Object;
    cond(pairs?: ?NestedArray<Function>): Function;
    conforms(source?: ?Object): Function;
    constant<T>(value: T): () => T;
    defaultTo<T1: void | null, T2>(value: T1, defaultValue: T2): T2;
    defaultTo<T1: string | boolean, T2>(
      value: T1,
      defaultValue: T2
    ): T1;
    // NaN is a number instead of its own type, otherwise it would behave like null/void
    defaultTo<T1: number, T2>(value: T1, defaultValue: T2): T1 | T2;
    flow: any & ((funcs: Array<Function>) => Function);
    flowRight: any & ((funcs: Array<Function>) => Function);
    identity<T>(value: T): T;
    iteratee(func?: any): Function;
    matches(source?: ?Object): Function;
    matchesProperty(path?: ?Path, srcValue: any): Function;
    method(path?: ?Path, ...args?: Array<any>): Function;
    methodOf(object?: ?Object, ...args?: Array<any>): Function;
    mixin<T: Function | Object>(
      object?: T,
      source: Object,
      options?: { chain: boolean, ... }
    ): T;
    noConflict(): Lodash;
    noop(...args: Array<mixed>): void;
    nthArg(n?: ?number): Function;
    over(...iteratees: Array<Function>): Function;
    over(iteratees: Array<Function>): Function;
    overEvery(...predicates: Array<Function>): Function;
    overEvery(predicates: Array<Function>): Function;
    overSome(...predicates: Array<Function>): Function;
    overSome(predicates: Array<Function>): Function;
    property(path?: ?Path): Function;
    propertyOf(object?: ?Object): Function;
    range(start: number, end: number, step?: number): Array<number>;
    range(end: number, step?: number): Array<number>;
    rangeRight(start?: ?number, end?: ?number, step?: ?number): Array<number>;
    rangeRight(end?: ?number, step?: ?number): Array<number>;
    runInContext(context?: ?Object): Function;

    stubArray(): Array<any>;
    stubFalse(): false;
    stubObject(): {...};
    stubString(): "";
    stubTrue(): true;
    times(n?: ?number, ...rest?: Array<void | null>): Array<number>;
    times<T>(n: number, iteratee: (i: number) => T): Array<T>;
    toPath(value: any): Array<string>;
    uniqueId(prefix?: ?string): string;

    // Properties
    VERSION: string;
    templateSettings: TemplateSettings;
  }

  declare module.exports: Lodash;
}

declare module "lodash/fp" {
  declare type Path = $ReadOnlyArray<string | number> | string | number;
  declare type __CurriedFunction1<A, R, AA: A> = (...r: [AA]) => R;
  declare type CurriedFunction1<A, R> = __CurriedFunction1<A, R, any>;

  declare type __CurriedFunction2<A, B, R, AA: A, BB: B> = ((
    ...r: [AA]
  ) => CurriedFunction1<BB, R>) &
    ((...r: [AA, BB]) => R);
  declare type CurriedFunction2<A, B, R> = __CurriedFunction2<A, B, R, any, any>;

  declare type __CurriedFunction3<A, B, C, R, AA: A, BB: B, CC: C> = ((
    ...r: [AA]
  ) => CurriedFunction2<BB, CC, R>) &
    ((...r: [AA, BB]) => CurriedFunction1<CC, R>) &
    ((...r: [AA, BB, CC]) => R);
  declare type CurriedFunction3<A, B, C, R> = __CurriedFunction3<A, B, C, R, any, any, any>;

  declare type __CurriedFunction4<
    A,
    B,
    C,
    D,
    R,
    AA: A,
    BB: B,
    CC: C,
    DD: D
  > = ((...r: [AA]) => CurriedFunction3<BB, CC, DD, R>) &
    ((...r: [AA, BB]) => CurriedFunction2<CC, DD, R>) &
    ((...r: [AA, BB, CC]) => CurriedFunction1<DD, R>) &
    ((...r: [AA, BB, CC, DD]) => R);
  declare type CurriedFunction4<A, B, C, D, R> = __CurriedFunction4<A, B, C, D, R, any, any, any, any>;

  declare type __CurriedFunction5<
    A,
    B,
    C,
    D,
    E,
    R,
    AA: A,
    BB: B,
    CC: C,
    DD: D,
    EE: E
  > = ((...r: [AA]) => CurriedFunction4<BB, CC, DD, EE, R>) &
    ((...r: [AA, BB]) => CurriedFunction3<CC, DD, EE, R>) &
    ((...r: [AA, BB, CC]) => CurriedFunction2<DD, EE, R>) &
    ((...r: [AA, BB, CC, DD]) => CurriedFunction1<EE, R>) &
    ((...r: [AA, BB, CC, DD, EE]) => R);
  declare type CurriedFunction5<A, B, C, D, E, R> = __CurriedFunction5<A, B, C, D, E, R, any, any, any, any, any>;

  declare type __CurriedFunction6<
    A,
    B,
    C,
    D,
    E,
    F,
    R,
    AA: A,
    BB: B,
    CC: C,
    DD: D,
    EE: E,
    FF: F
  > = ((...r: [AA]) => CurriedFunction5<BB, CC, DD, EE, FF, R>) &
    ((...r: [AA, BB]) => CurriedFunction4<CC, DD, EE, FF, R>) &
    ((...r: [AA, BB, CC]) => CurriedFunction3<DD, EE, FF, R>) &
    ((...r: [AA, BB, CC, DD]) => CurriedFunction2<EE, FF, R>) &
    ((...r: [AA, BB, CC, DD, EE]) => CurriedFunction1<FF, R>) &
    ((...r: [AA, BB, CC, DD, EE, FF]) => R);
  declare type CurriedFunction6<A, B, C, D, E, F, R> = __CurriedFunction6<A, B, C, D, E, F, R, any, any, any, any, any, any>;

  declare type Curry = (<A, R>((...r: [A]) => R) => CurriedFunction1<A, R>) &
    (<A, B, R>((...r: [A, B]) => R) => CurriedFunction2<A, B, R>) &
    (<A, B, C, R>((...r: [A, B, C]) => R) => CurriedFunction3<A, B, C, R>) &
    (<A, B, C, D, R>(
      (...r: [A, B, C, D]) => R
    ) => CurriedFunction4<A, B, C, D, R>) &
    (<A, B, C, D, E, R>(
      (...r: [A, B, C, D, E]) => R
    ) => CurriedFunction5<A, B, C, D, E, R>) &
    (<A, B, C, D, E, F, R>(
      (...r: [A, B, C, D, E, F]) => R
    ) => CurriedFunction6<A, B, C, D, E, F, R>);

  declare type UnaryFn<A, R> = (a: A) => R;

  declare type TemplateSettings = {
    escape?: RegExp,
    evaluate?: RegExp,
    imports?: Object,
    interpolate?: RegExp,
    variable?: string,
    ...
  };

  declare type TruncateOptions = {
    length?: number,
    omission?: string,
    separator?: RegExp | string,
    ...
  };

  declare type DebounceOptions = {
    leading?: boolean,
    maxWait?: number,
    trailing?: boolean,
    ...
  };

  declare type ThrottleOptions = {
    leading?: boolean,
    trailing?: boolean,
    ...
  };

  declare type NestedArray<T> = Array<Array<T>>;

  declare type matchesIterateeShorthand = { [string | number]: any, ... };
  declare type matchesPropertyIterateeShorthand = [string, any];
  declare type propertyIterateeShorthand = string;

  declare type OPredicate<A> =
    | ((value: A) => any)
    | matchesIterateeShorthand
    | matchesPropertyIterateeShorthand
    | propertyIterateeShorthand;

  declare type OIterateeWithResult<V, R> = Object | string | ((value: V) => R);
  declare type OIteratee<O> = OIterateeWithResult<any, any>;
  declare type OFlatMapIteratee<T, U> = OIterateeWithResult<any, Array<U>>;

  declare type Predicate<T> =
    | ((value: T) => any)
    | matchesIterateeShorthand
    | matchesPropertyIterateeShorthand
    | propertyIterateeShorthand;

  declare type _ValueOnlyIteratee<T> = (value: T) => mixed;
  declare type ValueOnlyIteratee<T> = _ValueOnlyIteratee<T> | string;
  declare type _Iteratee<T> = (item: T) => mixed;
  declare type Iteratee<T> = _Iteratee<T> | Object | string;
  declare type FlatMapIteratee<T, U> =
    | ((item: T) => Array<U>)
    | Object
    | string;
  declare type Comparator<T> = (item: T, item2: T) => boolean;

  declare type MapIterator<T, U> = ((item: T) => U) | propertyIterateeShorthand;

  declare type OMapIterator<T, U> =
    | ((item: T) => U)
    | propertyIterateeShorthand;

  declare class Lodash {
    // Array
    chunk<T>(size: number): (array: Array<T>) => Array<Array<T>>;
    chunk<T>(size: number, array: Array<T>): Array<Array<T>>;
    compact<T, N: ?T>(array?: ?$ReadOnlyArray<N>): Array<T>;
    concat<T, U, A: Array<T> | T, B: Array<U> | U>(
      base: A
    ): (elements: B) => Array<T | U>;
    concat<T, U, A: Array<T> | T, B: Array<U> | U>(
      base: A,
      elements: B
    ): Array<T | U>;
    difference<T>(values: $ReadOnlyArray<T>): (array: $ReadOnlyArray<T>) => Array<T>;
    difference<T>(values: $ReadOnlyArray<T>, array: $ReadOnlyArray<T>): Array<T>;
    differenceBy<T>(
      iteratee: ValueOnlyIteratee<T>
    ): ((values: $ReadOnlyArray<T>) => (array: $ReadOnlyArray<T>) => Array<T>) &
      ((values: $ReadOnlyArray<T>, array: $ReadOnlyArray<T>) => Array<T>);
    differenceBy<T>(
      iteratee: ValueOnlyIteratee<T>,
      values: $ReadOnlyArray<T>
    ): (array: $ReadOnlyArray<T>) => Array<T>;
    differenceBy<T>(
      iteratee: ValueOnlyIteratee<T>,
      values: $ReadOnlyArray<T>,
      array: $ReadOnlyArray<T>
    ): Array<T>;
    differenceWith<T>(
      comparator: Comparator<T>
    ): ((first: $ReadOnly<T>) => (second: $ReadOnly<T>) => Array<T>) &
      ((first: $ReadOnly<T>, second: $ReadOnly<T>) => Array<T>);
    differenceWith<T>(
      comparator: Comparator<T>,
      first: $ReadOnly<T>
    ): (second: $ReadOnly<T>) => Array<T>;
    differenceWith<T>(
      comparator: Comparator<T>,
      first: $ReadOnly<T>,
      second: $ReadOnly<T>
    ): Array<T>;
    drop<T>(n: number): (array: Array<T>) => Array<T>;
    drop<T>(n: number, array: Array<T>): Array<T>;
    dropLast<T>(n: number): (array: Array<T>) => Array<T>;
    dropLast<T>(n: number, array: Array<T>): Array<T>;
    dropRight<T>(n: number): (array: Array<T>) => Array<T>;
    dropRight<T>(n: number, array: Array<T>): Array<T>;
    dropRightWhile<T>(predicate: Predicate<T>): (array: Array<T>) => Array<T>;
    dropRightWhile<T>(predicate: Predicate<T>, array: Array<T>): Array<T>;
    dropWhile<T>(predicate: Predicate<T>): (array: Array<T>) => Array<T>;
    dropWhile<T>(predicate: Predicate<T>, array: Array<T>): Array<T>;
    dropLastWhile<T>(predicate: Predicate<T>): (array: Array<T>) => Array<T>;
    dropLastWhile<T>(predicate: Predicate<T>, array: Array<T>): Array<T>;
    fill<T, U>(
      start: number
    ): ((
      end: number
    ) => ((value: U) => (array: Array<T>) => Array<T | U>) &
      ((value: U, array: Array<T>) => Array<T | U>)) &
      ((end: number, value: U) => (array: Array<T>) => Array<T | U>) &
      ((end: number, value: U, array: Array<T>) => Array<T | U>);
    fill<T, U>(
      start: number,
      end: number
    ): ((value: U) => (array: Array<T>) => Array<T | U>) &
      ((value: U, array: Array<T>) => Array<T | U>);
    fill<T, U>(
      start: number,
      end: number,
      value: U
    ): (array: Array<T>) => Array<T | U>;
    fill<T, U>(
      start: number,
      end: number,
      value: U,
      array: Array<T>
    ): Array<T | U>;
    findIndex<T>(predicate: Predicate<T>): (array: $ReadOnlyArray<T>) => number;
    findIndex<T>(predicate: Predicate<T>, array: $ReadOnlyArray<T>): number;
    findIndexFrom<T>(
      predicate: Predicate<T>
    ): ((fromIndex: number) => (array: $ReadOnlyArray<T>) => number) &
      ((fromIndex: number, array: $ReadOnlyArray<T>) => number);
    findIndexFrom<T>(
      predicate: Predicate<T>,
      fromIndex: number
    ): (array: $ReadOnlyArray<T>) => number;
    findIndexFrom<T>(
      predicate: Predicate<T>,
      fromIndex: number,
      array: $ReadOnlyArray<T>
    ): number;
    findLastIndex<T>(
      predicate: Predicate<T>
    ): (array: $ReadOnlyArray<T>) => number;
    findLastIndex<T>(predicate: Predicate<T>, array: $ReadOnlyArray<T>): number;
    findLastIndexFrom<T>(
      predicate: Predicate<T>
    ): ((fromIndex: number) => (array: $ReadOnlyArray<T>) => number) &
      ((fromIndex: number, array: $ReadOnlyArray<T>) => number);
    findLastIndexFrom<T>(
      predicate: Predicate<T>,
      fromIndex: number
    ): (array: $ReadOnlyArray<T>) => number;
    findLastIndexFrom<T>(
      predicate: Predicate<T>,
      fromIndex: number,
      array: $ReadOnlyArray<T>
    ): number;
    // alias of _.head
    first<T>(array: $ReadOnlyArray<T>): T;
    flatten<T, X>(array: Array<Array<T> | X>): Array<T | X>;
    unnest<T, X>(array: Array<Array<T> | X>): Array<T | X>;
    flattenDeep<T>(array: Array<any>): Array<T>;
    flattenDepth(depth: number): (array: Array<any>) => Array<any>;
    flattenDepth(depth: number, array: Array<any>): Array<any>;
    fromPairs<A, B>(pairs: $ReadOnlyArray<[A, B]>): {| [key: A]: B |};
    head<T>(array: $ReadOnlyArray<T>): T;
    indexOf<T>(value: T): (array: Array<T>) => number;
    indexOf<T>(value: T, array: Array<T>): number;
    indexOfFrom<T>(
      value: T
    ): ((fromIndex: number) => (array: Array<T>) => number) &
      ((fromIndex: number, array: Array<T>) => number);
    indexOfFrom<T>(value: T, fromIndex: number): (array: Array<T>) => number;
    indexOfFrom<T>(value: T, fromIndex: number, array: Array<T>): number;
    initial<T>(array: Array<T>): Array<T>;
    init<T>(array: Array<T>): Array<T>;
    intersection<T>(a1: Array<T>): (a2: Array<T>) => Array<T>;
    intersection<T>(a1: Array<T>, a2: Array<T>): Array<T>;
    intersectionBy<T>(
      iteratee: ValueOnlyIteratee<T>
    ): ((a1: Array<T>) => (a2: Array<T>) => Array<T>) &
      ((a1: Array<T>, a2: Array<T>) => Array<T>);
    intersectionBy<T>(
      iteratee: ValueOnlyIteratee<T>,
      a1: Array<T>
    ): (a2: Array<T>) => Array<T>;
    intersectionBy<T>(
      iteratee: ValueOnlyIteratee<T>,
      a1: Array<T>,
      a2: Array<T>
    ): Array<T>;
    intersectionWith<T>(
      comparator: Comparator<T>
    ): ((a1: Array<T>) => (a2: Array<T>) => Array<T>) &
      ((a1: Array<T>, a2: Array<T>) => Array<T>);
    intersectionWith<T>(
      comparator: Comparator<T>,
      a1: Array<T>
    ): (a2: Array<T>) => Array<T>;
    intersectionWith<T>(
      comparator: Comparator<T>,
      a1: Array<T>,
      a2: Array<T>
    ): Array<T>;
    join<T>(separator: string): (array: Array<T>) => string;
    join<T>(separator: string, array: Array<T>): string;
    last<T>(array: Array<T>): T;
    lastIndexOf<T>(value: T): (array: Array<T>) => number;
    lastIndexOf<T>(value: T, array: Array<T>): number;
    lastIndexOfFrom<T>(
      value: T
    ): ((fromIndex: number) => (array: Array<T>) => number) &
      ((fromIndex: number, array: Array<T>) => number);
    lastIndexOfFrom<T>(
      value: T,
      fromIndex: number
    ): (array: Array<T>) => number;
    lastIndexOfFrom<T>(value: T, fromIndex: number, array: Array<T>): number;
    nth<T>(n: number): (array: Array<T>) => T;
    nth<T>(n: number, array: Array<T>): T;
    pull<T>(value: T): (array: Array<T>) => Array<T>;
    pull<T>(value: T, array: Array<T>): Array<T>;
    pullAll<T>(values: $ReadOnlyArray<T>): (array: Array<T>) => Array<T>;
    pullAll<T>(values: $ReadOnlyArray<T>, array: Array<T>): Array<T>;
    pullAllBy<T>(
      iteratee: ValueOnlyIteratee<T>
    ): ((values: $ReadOnlyArray<T>) => (array: Array<T>) => Array<T>) &
      ((values: $ReadOnlyArray<T>, array: Array<T>) => Array<T>);
    pullAllBy<T>(
      iteratee: ValueOnlyIteratee<T>,
      values: $ReadOnlyArray<T>
    ): (array: Array<T>) => Array<T>;
    pullAllBy<T>(
      iteratee: ValueOnlyIteratee<T>,
      values: $ReadOnlyArray<T>,
      array: Array<T>
    ): Array<T>;
    pullAllWith<T>(
      comparator: Function
    ): ((values: Array<T>) => (array: Array<T>) => Array<T>) &
      ((values: Array<T>, array: Array<T>) => Array<T>);
    pullAllWith<T>(comparator: Function, values: Array<T>): (array: Array<T>) => Array<T>;
    pullAllWith<T>(comparator: Function, values: Array<T>, array: Array<T>): Array<T>;
    pullAt<T>(indexed: Array<number>): (array: Array<T>) => Array<T>;
    pullAt<T>(indexed: Array<number>, array: Array<T>): Array<T>;
    remove<T>(predicate: Predicate<T>): (array: Array<T>) => Array<T>;
    remove<T>(predicate: Predicate<T>, array: Array<T>): Array<T>;
    reverse<T>(array: Array<T>): Array<T>;
    slice<T>(
      start: number
    ): ((end: number) => (array: Array<T>) => Array<T>) &
      ((end: number, array: Array<T>) => Array<T>);
    slice<T>(start: number, end: number): (array: Array<T>) => Array<T>;
    slice<T>(start: number, end: number, array: Array<T>): Array<T>;
    sortedIndex<T>(value: T): (array: Array<T>) => number;
    sortedIndex<T>(value: T, array: Array<T>): number;
    sortedIndexBy<T>(
      iteratee: ValueOnlyIteratee<T>
    ): ((value: T) => (array: Array<T>) => number) &
      ((value: T, array: Array<T>) => number);
    sortedIndexBy<T>(
      iteratee: ValueOnlyIteratee<T>,
      value: T
    ): (array: Array<T>) => number;
    sortedIndexBy<T>(
      iteratee: ValueOnlyIteratee<T>,
      value: T,
      array: Array<T>
    ): number;
    sortedIndexOf<T>(value: T): (array: Array<T>) => number;
    sortedIndexOf<T>(value: T, array: Array<T>): number;
    sortedLastIndex<T>(value: T): (array: Array<T>) => number;
    sortedLastIndex<T>(value: T, array: Array<T>): number;
    sortedLastIndexBy<T>(
      iteratee: ValueOnlyIteratee<T>
    ): ((value: T) => (array: Array<T>) => number) &
      ((value: T, array: Array<T>) => number);
    sortedLastIndexBy<T>(
      iteratee: ValueOnlyIteratee<T>,
      value: T
    ): (array: Array<T>) => number;
    sortedLastIndexBy<T>(
      iteratee: ValueOnlyIteratee<T>,
      value: T,
      array: Array<T>
    ): number;
    sortedLastIndexOf<T>(value: T): (array: Array<T>) => number;
    sortedLastIndexOf<T>(value: T, array: Array<T>): number;
    sortedUniq<T>(array: Array<T>): Array<T>;
    sortedUniqBy<T>(iteratee: ValueOnlyIteratee<T>, array: Array<T>): Array<T>;
    tail<T>(array: Array<T>): Array<T>;
    take<T>(n: number): (array: $ReadOnlyArray<T>) => Array<T>;
    take<T>(n: number, array: $ReadOnlyArray<T>): Array<T>;
    takeRight<T>(n: number): (array: $ReadOnlyArray<T>) => Array<T>;
    takeRight<T>(n: number, array: $ReadOnlyArray<T>): Array<T>;
    takeLast<T>(n: number): (array: Array<T>) => Array<T>;
    takeLast<T>(n: number, array: Array<T>): Array<T>;
    takeRightWhile<T>(predicate: Predicate<T>): (array: Array<T>) => Array<T>;
    takeRightWhile<T>(predicate: Predicate<T>, array: Array<T>): Array<T>;
    takeLastWhile<T>(predicate: Predicate<T>): (array: Array<T>) => Array<T>;
    takeLastWhile<T>(predicate: Predicate<T>, array: Array<T>): Array<T>;
    takeWhile<T>(predicate: Predicate<T>): (array: Array<T>) => Array<T>;
    takeWhile<T>(predicate: Predicate<T>, array: Array<T>): Array<T>;
    union<T>(a1: Array<T>): (a2: Array<T>) => Array<T>;
    union<T>(a1: Array<T>, a2: Array<T>): Array<T>;
    unionBy<T>(
      iteratee: ValueOnlyIteratee<T>
    ): ((a1: Array<T>) => (a2: Array<T>) => Array<T>) &
      ((a1: Array<T>, a2: Array<T>) => Array<T>);
    unionBy<T>(
      iteratee: ValueOnlyIteratee<T>,
      a1: Array<T>
    ): (a2: Array<T>) => Array<T>;
    unionBy<T>(
      iteratee: ValueOnlyIteratee<T>,
      a1: Array<T>,
      a2: Array<T>
    ): Array<T>;
    unionWith<T>(
      comparator: Comparator<T>
    ): ((a1: Array<T>) => (a2: Array<T>) => Array<T>) &
      ((a1: Array<T>, a2: Array<T>) => Array<T>);
    unionWith<T>(
      comparator: Comparator<T>,
      a1: Array<T>
    ): (a2: Array<T>) => Array<T>;
    unionWith<T>(
      comparator: Comparator<T>,
      a1: Array<T>,
      a2: Array<T>
    ): Array<T>;
    uniq<T>(array: Array<T>): Array<T>;
    uniqBy<T>(iteratee: ValueOnlyIteratee<T>): (array: Array<T>) => Array<T>;
    uniqBy<T>(iteratee: ValueOnlyIteratee<T>, array: Array<T>): Array<T>;
    uniqWith<T>(comparator: Comparator<T>): (array: Array<T>) => Array<T>;
    uniqWith<T>(comparator: Comparator<T>, array: Array<T>): Array<T>;
    unzip<T>(array: Array<T>): Array<T>;
    unzipWith<T>(iteratee: Iteratee<T>): (array: Array<T>) => Array<T>;
    unzipWith<T>(iteratee: Iteratee<T>, array: Array<T>): Array<T>;
    without<T>(values: Array<T>): (array: Array<T>) => Array<T>;
    without<T>(values: Array<T>, array: Array<T>): Array<T>;
    xor<T>(a1: Array<T>): (a2: Array<T>) => Array<T>;
    xor<T>(a1: Array<T>, a2: Array<T>): Array<T>;
    symmetricDifference<T>(a1: Array<T>): (a2: Array<T>) => Array<T>;
    symmetricDifference<T>(a1: Array<T>, a2: Array<T>): Array<T>;
    xorBy<T>(
      iteratee: ValueOnlyIteratee<T>
    ): ((a1: Array<T>) => (a2: Array<T>) => Array<T>) &
      ((a1: Array<T>, a2: Array<T>) => Array<T>);
    xorBy<T>(
      iteratee: ValueOnlyIteratee<T>,
      a1: Array<T>
    ): (a2: Array<T>) => Array<T>;
    xorBy<T>(
      iteratee: ValueOnlyIteratee<T>,
      a1: Array<T>,
      a2: Array<T>
    ): Array<T>;
    symmetricDifferenceBy<T>(
      iteratee: ValueOnlyIteratee<T>
    ): ((a1: Array<T>) => (a2: Array<T>) => Array<T>) &
      ((a1: Array<T>, a2: Array<T>) => Array<T>);
    symmetricDifferenceBy<T>(
      iteratee: ValueOnlyIteratee<T>,
      a1: Array<T>
    ): (a2: Array<T>) => Array<T>;
    symmetricDifferenceBy<T>(
      iteratee: ValueOnlyIteratee<T>,
      a1: Array<T>,
      a2: Array<T>
    ): Array<T>;
    xorWith<T>(
      comparator: Comparator<T>
    ): ((a1: Array<T>) => (a2: Array<T>) => Array<T>) &
      ((a1: Array<T>, a2: Array<T>) => Array<T>);
    xorWith<T>(
      comparator: Comparator<T>,
      a1: Array<T>
    ): (a2: Array<T>) => Array<T>;
    xorWith<T>(comparator: Comparator<T>, a1: Array<T>, a2: Array<T>): Array<T>;
    symmetricDifferenceWith<T>(
      comparator: Comparator<T>
    ): ((a1: Array<T>) => (a2: Array<T>) => Array<T>) &
      ((a1: Array<T>, a2: Array<T>) => Array<T>);
    symmetricDifferenceWith<T>(
      comparator: Comparator<T>,
      a1: Array<T>
    ): (a2: Array<T>) => Array<T>;
    symmetricDifferenceWith<T>(
      comparator: Comparator<T>,
      a1: Array<T>,
      a2: Array<T>
    ): Array<T>;
    zip<A, B>(a1: Array<A>): (a2: Array<B>) => Array<[A, B]>;
    zip<A, B>(a1: Array<A>, a2: Array<B>): Array<[A, B]>;
    zipAll(arrays: Array<Array<any>>): Array<any>;
    zipObject<K, V>(props?: Array<K>): (values?: Array<V>) => { [key: K]: V, ... };
    zipObject<K, V>(props?: Array<K>, values?: Array<V>): { [key: K]: V, ... };
    zipObj(props: Array<any>): (values: Array<any>) => Object;
    zipObj(props: Array<any>, values: Array<any>): Object;
    zipObjectDeep(props: Array<any>): (values: any) => Object;
    zipObjectDeep(props: Array<any>, values: any): Object;
    zipWith<T>(
      iteratee: Iteratee<T>
    ): ((a1: NestedArray<T>) => (a2: NestedArray<T>) => Array<T>) &
      ((a1: NestedArray<T>, a2: NestedArray<T>) => Array<T>);
    zipWith<T>(
      iteratee: Iteratee<T>,
      a1: NestedArray<T>
    ): (a2: NestedArray<T>) => Array<T>;
    zipWith<T>(
      iteratee: Iteratee<T>,
      a1: NestedArray<T>,
      a2: NestedArray<T>
    ): Array<T>;
    // Collection
    countBy<T>(
      iteratee: ValueOnlyIteratee<T>
    ): (collection: Array<T> | { [id: any]: T, ... }) => { [string]: number, ... };
    countBy<T>(
      iteratee: ValueOnlyIteratee<T>,
      collection: Array<T> | { [id: any]: T, ... }
    ): { [string]: number, ... };
    // alias of _.forEach
    each<T>(
      iteratee: Iteratee<T> | OIteratee<T>
    ): (collection: $ReadOnlyArray<T> | { [id: any]: T, ... }) => Array<T>;
    each<T>(
      iteratee: Iteratee<T> | OIteratee<T>,
      collection: $ReadOnlyArray<T> | { [id: any]: T, ... }
    ): Array<T>;
    // alias of _.forEachRight
    eachRight<T>(
      iteratee: Iteratee<T> | OIteratee<T>
    ): (collection: $ReadOnlyArray<T> | { [id: any]: T, ... }) => Array<T>;
    eachRight<T>(
      iteratee: Iteratee<T> | OIteratee<T>,
      collection: $ReadOnlyArray<T> | { [id: any]: T, ... }
    ): Array<T>;
    every<T>(
      iteratee: Iteratee<T> | OIteratee<T>
    ): (collection: $ReadOnlyArray<T> | { [id: any]: T, ... }) => boolean;
    every<T>(
      iteratee: Iteratee<T> | OIteratee<T>,
      collection: $ReadOnlyArray<T> | { [id: any]: T, ... }
    ): boolean;
    all<T>(
      iteratee: Iteratee<T> | OIteratee<T>
    ): (collection: Array<T> | { [id: any]: T, ... }) => boolean;
    all<T>(
      iteratee: Iteratee<T> | OIteratee<T>,
      collection: Array<T> | { [id: any]: T, ... }
    ): boolean;
    filter<T>(
      predicate: Predicate<T> | OPredicate<T>
    ): (collection: $ReadOnlyArray<T> | { [id: any]: T, ... }) => Array<T>;
    filter<T>(
      predicate: Predicate<T> | OPredicate<T>,
      collection: $ReadOnlyArray<T> | { [id: any]: T, ... }
    ): Array<T>;
    find<T>(
      predicate: Predicate<T> | OPredicate<T>
    ): (collection: $ReadOnlyArray<T> | { [id: any]: T, ... }) => T | void;
    find<T>(
      predicate: Predicate<T> | OPredicate<T>,
      collection: $ReadOnlyArray<T> | { [id: any]: T, ... }
    ): T | void;
    findFrom<T>(
      predicate: Predicate<T> | OPredicate<T>
    ): ((
      fromIndex: number
    ) => (collection: $ReadOnlyArray<T> | { [id: any]: T, ... }) => T | void) &
      ((
        fromIndex: number,
        collection: $ReadOnlyArray<T> | { [id: any]: T, ... }
      ) => T | void);
    findFrom<T>(
      predicate: Predicate<T> | OPredicate<T>,
      fromIndex: number
    ): (collection: Array<T> | { [id: any]: T, ... }) => T | void;
    findFrom<T>(
      predicate: Predicate<T> | OPredicate<T>,
      fromIndex: number,
      collection: $ReadOnlyArray<T> | { [id: any]: T, ... }
    ): T | void;
    findLast<T>(
      predicate: Predicate<T> | OPredicate<T>
    ): (collection: $ReadOnlyArray<T> | { [id: any]: T, ... }) => T | void;
    findLast<T>(
      predicate: Predicate<T> | OPredicate<T>,
      collection: $ReadOnlyArray<T> | { [id: any]: T, ... }
    ): T | void;
    findLastFrom<T>(
      predicate: Predicate<T> | OPredicate<T>
    ): ((
      fromIndex: number
    ) => (collection: $ReadOnlyArray<T> | { [id: any]: T, ... }) => T | void) &
      ((
        fromIndex: number,
        collection: $ReadOnlyArray<T> | { [id: any]: T, ... }
      ) => T | void);
    findLastFrom<T>(
      predicate: Predicate<T> | OPredicate<T>,
      fromIndex: number
    ): (collection: $ReadOnlyArray<T> | { [id: any]: T, ... }) => T | void;
    findLastFrom<T>(
      predicate: Predicate<T> | OPredicate<T>,
      fromIndex: number,
      collection: $ReadOnlyArray<T> | { [id: any]: T, ... }
    ): T | void;
    flatMap<T, U>(
      iteratee: FlatMapIteratee<T, U> | OFlatMapIteratee<T, U>
    ): (collection: Array<T> | { [id: any]: T, ... }) => Array<U>;
    flatMap<T, U>(
      iteratee: FlatMapIteratee<T, U> | OFlatMapIteratee<T, U>,
      collection: Array<T> | { [id: any]: T, ... }
    ): Array<U>;
    flatMapDeep<T, U>(
      iteratee: FlatMapIteratee<T, U> | OFlatMapIteratee<T, U>
    ): (collection: Array<T> | { [id: any]: T, ... }) => Array<U>;
    flatMapDeep<T, U>(
      iteratee: FlatMapIteratee<T, U> | OFlatMapIteratee<T, U>,
      collection: Array<T> | { [id: any]: T, ... }
    ): Array<U>;
    flatMapDepth<T, U>(
      iteratee: FlatMapIteratee<T, U> | OFlatMapIteratee<T, U>
    ): ((
      depth: number
    ) => (collection: Array<T> | { [id: any]: T, ... }) => Array<U>) &
      ((depth: number, collection: Array<T> | { [id: any]: T, ... }) => Array<U>);
    flatMapDepth<T, U>(
      iteratee: FlatMapIteratee<T, U> | OFlatMapIteratee<T, U>,
      depth: number
    ): (collection: Array<T> | { [id: any]: T, ... }) => Array<U>;
    flatMapDepth<T, U>(
      iteratee: FlatMapIteratee<T, U> | OFlatMapIteratee<T, U>,
      depth: number,
      collection: Array<T> | { [id: any]: T, ... }
    ): Array<U>;
    forEach<T>(
      iteratee: Iteratee<T> | OIteratee<T>
    ): (collection: $ReadOnlyArray<T> | { [id: any]: T, ... }) => Array<T>;
    forEach<T>(
      iteratee: Iteratee<T> | OIteratee<T>,
      collection: $ReadOnlyArray<T> | { [id: any]: T, ... }
    ): Array<T>;
    forEachRight<T>(
      iteratee: Iteratee<T> | OIteratee<T>
    ): (collection: $ReadOnlyArray<T> | { [id: any]: T, ... }) => Array<T>;
    forEachRight<T>(
      iteratee: Iteratee<T> | OIteratee<T>,
      collection: $ReadOnlyArray<T> | { [id: any]: T, ... }
    ): Array<T>;
    groupBy<V, T>(
      iteratee: ValueOnlyIteratee<T>
    ): (
      collection: $ReadOnlyArray<T> | { [id: any]: T, ... }
    ) => { [key: V]: Array<T>, ... };
    groupBy<V, T>(
      iteratee: ValueOnlyIteratee<T>,
      collection: $ReadOnlyArray<T> | { [id: any]: T, ... }
    ): { [key: V]: Array<T>, ... };
    includes<T>(value: T): (collection: Array<T> | { [id: any]: T, ... }) => boolean;
    includes<T>(value: T, collection: Array<T> | { [id: any]: T, ... }): boolean;
    includes(value: string): (str: string) => boolean;
    includes(value: string, str: string): boolean;
    contains(value: string): (str: string) => boolean;
    contains(value: string, str: string): boolean;
    contains<T>(value: T): (collection: Array<T> | { [id: any]: T, ... }) => boolean;
    contains<T>(value: T, collection: Array<T> | { [id: any]: T, ... }): boolean;
    includesFrom(
      value: string
    ): ((fromIndex: number) => (str: string) => boolean) &
      ((fromIndex: number, str: string) => boolean);
    includesFrom(value: string, fromIndex: number): (str: string) => boolean;
    includesFrom(value: string, fromIndex: number, str: string): boolean;
    includesFrom<T>(
      value: T
    ): ((fromIndex: number) => (collection: Array<T>) => boolean) &
      ((fromIndex: number, collection: Array<T>) => boolean);
    includesFrom<T>(
      value: T,
      fromIndex: number
    ): (collection: Array<T>) => boolean;
    includesFrom<T>(value: T, fromIndex: number, collection: Array<T>): boolean;
    invokeMap<T>(
      path: ((value: T) => Path) | Path
    ): (collection: Array<T> | { [id: any]: T, ... }) => Array<any>;
    invokeMap<T>(
      path: ((value: T) => Path) | Path,
      collection: Array<T> | { [id: any]: T, ... }
    ): Array<any>;
    invokeArgsMap<T>(
      path: ((value: T) => Path) | Path
    ): ((
      collection: Array<T> | { [id: any]: T, ... }
    ) => (args: Array<any>) => Array<any>) &
      ((
        collection: Array<T> | { [id: any]: T, ... },
        args: Array<any>
      ) => Array<any>);
    invokeArgsMap<T>(
      path: ((value: T) => Path) | Path,
      collection: Array<T> | { [id: any]: T, ... }
    ): (args: Array<any>) => Array<any>;
    invokeArgsMap<T>(
      path: ((value: T) => Path) | Path,
      collection: Array<T> | { [id: any]: T, ... },
      args: Array<any>
    ): Array<any>;
    keyBy<T, V>(
      iteratee: ValueOnlyIteratee<T>
    ): (collection: $ReadOnlyArray<T> | { [id: any]: T, ... }) => { [key: V]: T, ... };
    keyBy<T, V>(
      iteratee: ValueOnlyIteratee<T>,
      collection: $ReadOnlyArray<T> | { [id: any]: T, ... }
    ): { [key: V]: T, ... };
    indexBy<T, V>(
      iteratee: ValueOnlyIteratee<T>
    ): (collection: $ReadOnlyArray<T> | { [id: any]: T, ... }) => { [key: V]: T, ... };
    indexBy<T, V>(
      iteratee: ValueOnlyIteratee<T>,
      collection: $ReadOnlyArray<T> | { [id: any]: T, ... }
    ): { [key: V]: T, ... };
    map<T, U>(
      iteratee: MapIterator<T, U> | OMapIterator<T, U>
    ): (collection: $ReadOnlyArray<T> | { [id: any]: T, ... }) => Array<U>;
    map<T, U>(
      iteratee: MapIterator<T, U> | OMapIterator<T, U>,
      collection: $ReadOnlyArray<T> | { [id: any]: T, ... }
    ): Array<U>;
    map(iteratee: (char: string) => any): (str: string) => string;
    map(iteratee: (char: string) => any, str: string): string;
    pluck<T, U>(
      iteratee: MapIterator<T, U> | OMapIterator<T, U>
    ): (collection: Array<T> | { [id: any]: T, ... }) => Array<U>;
    pluck<T, U>(
      iteratee: MapIterator<T, U> | OMapIterator<T, U>,
      collection: Array<T> | { [id: any]: T, ... }
    ): Array<U>;
    pluck(iteratee: (char: string) => any): (str: string) => string;
    pluck(iteratee: (char: string) => any, str: string): string;
    orderBy<T>(
      iteratees: $ReadOnlyArray<Iteratee<T> | OIteratee<any>> | string
    ): ((
      orders: $ReadOnlyArray<"asc" | "desc"> | string
    ) => (collection: $ReadOnlyArray<T> | { [id: any]: T, ... }) => Array<T>) &
      ((
        orders: $ReadOnlyArray<"asc" | "desc"> | string,
        collection: $ReadOnlyArray<T> | { [id: any]: T, ... }
      ) => Array<T>);
    orderBy<T>(
      iteratees: $ReadOnlyArray<Iteratee<T> | OIteratee<any>> | string,
      orders: $ReadOnlyArray<"asc" | "desc"> | string
    ): (collection: $ReadOnlyArray<T> | { [id: any]: T, ... }) => Array<T>;
    orderBy<T>(
      iteratees: $ReadOnlyArray<Iteratee<T> | OIteratee<any>> | string,
      orders: $ReadOnlyArray<"asc" | "desc"> | string,
      collection: $ReadOnlyArray<T> | { [id: any]: T, ... }
    ): Array<T>;
    partition<T>(
      predicate: Predicate<T> | OPredicate<T>
    ): (collection: Array<T> | { [id: any]: T, ... }) => [Array<T>, Array<T>];
    partition<T>(
      predicate: Predicate<T> | OPredicate<T>,
      collection: Array<T> | { [id: any]: T, ... }
    ): [Array<T>, Array<T>];
    reduce<T, U>(
      iteratee: (accumulator: U, value: T) => U
    ): ((accumulator: U) => (collection: Array<T> | { [id: any]: T, ... }) => U) &
      ((accumulator: U, collection: Array<T> | { [id: any]: T, ... }) => U);
    reduce<T, U>(
      iteratee: (accumulator: U, value: T) => U,
      accumulator: U
    ): (collection: Array<T> | { [id: any]: T, ... }) => U;
    reduce<T, U>(
      iteratee: (accumulator: U, value: T) => U,
      accumulator: U,
      collection: Array<T> | { [id: any]: T, ... }
    ): U;
    reduceRight<T, U>(
      iteratee: (value: T, accumulator: U) => U
    ): ((accumulator: U) => (collection: Array<T> | { [id: any]: T, ... }) => U) &
      ((accumulator: U, collection: Array<T> | { [id: any]: T, ... }) => U);
    reduceRight<T, U>(
      iteratee: (value: T, accumulator: U) => U,
      accumulator: U
    ): (collection: Array<T> | { [id: any]: T, ... }) => U;
    reduceRight<T, U>(
      iteratee: (value: T, accumulator: U) => U,
      accumulator: U,
      collection: Array<T> | { [id: any]: T, ... }
    ): U;
    reject<T>(
      predicate: Predicate<T> | OPredicate<T>
    ): (collection: Array<T> | { [id: any]: T, ... }) => Array<T>;
    reject<T>(
      predicate: Predicate<T> | OPredicate<T>,
      collection: Array<T> | { [id: any]: T, ... }
    ): Array<T>;
    sample<T>(collection: Array<T> | { [id: any]: T, ... }): T;
    sampleSize<T>(
      n: number
    ): (collection: Array<T> | { [id: any]: T, ... }) => Array<T>;
    sampleSize<T>(n: number, collection: Array<T> | { [id: any]: T, ... }): Array<T>;
    shuffle<T>(collection: Array<T> | { [id: any]: T, ... }): Array<T>;
    size(collection: $ReadOnlyArray<any> | Object | string): number;
    some<T>(
      predicate: Predicate<T> | OPredicate<T>
    ): (collection: $ReadOnlyArray<T> | { [id: any]: T, ... }) => boolean;
    some<T>(
      predicate: Predicate<T> | OPredicate<T>,
      collection: $ReadOnlyArray<T> | { [id: any]: T, ... }
    ): boolean;
    any<T>(
      predicate: Predicate<T> | OPredicate<T>
    ): (collection: $ReadOnlyArray<T> | { [id: any]: T, ... }) => boolean;
    any<T>(
      predicate: Predicate<T> | OPredicate<T>,
      collection: $ReadOnlyArray<T> | { [id: any]: T, ... }
    ): boolean;
    sortBy<T>(
      iteratees:
        | $ReadOnlyArray<Iteratee<T> | OIteratee<T>>
        | Iteratee<T>
        | OIteratee<T>
    ): (collection: $ReadOnlyArray<T> | { [id: any]: T, ... }) => Array<T>;
    sortBy<T>(
      iteratees:
        | $ReadOnlyArray<Iteratee<T> | OIteratee<T>>
        | Iteratee<T>
        | OIteratee<T>,
      collection: $ReadOnlyArray<T> | { [id: any]: T, ... }
    ): Array<T>;

    // Date
    now(): number;

    // Function
    after(fn: Function): (n: number) => Function;
    after(fn: Function, n: number): Function;
    ary(func: Function): Function;
    nAry(n: number): (func: Function) => Function;
    nAry(n: number, func: Function): Function;
    before(fn: Function): (n: number) => Function;
    before(fn: Function, n: number): Function;
    bind(func: Function): (thisArg: any) => Function;
    bind(func: Function, thisArg: any): Function;
    bindKey(obj: Object): (key: string) => Function;
    bindKey(obj: Object, key: string): Function;
    curry: Curry;
    curryN(arity: number): (func: Function) => Function;
    curryN(arity: number, func: Function): Function;
    curryRight(func: Function): Function;
    curryRightN(arity: number): (func: Function) => Function;
    curryRightN(arity: number, func: Function): Function;
    debounce(wait: number): <A, R>(func: (...A) => R) => (...A) => R;
    debounce<A, R>(wait: number, func: (...A) => R): (...A) => R;
    defer(func: (...Array<any>) => any): TimeoutID;
    delay(wait: number): (func: Function) => TimeoutID;
    delay(wait: number, func: Function): TimeoutID;
    flip(func: Function): Function;
    memoize<F: Function>(func: F): F;
    negate<A, R>(predicate: (...A) => R): (...A) => boolean;
    complement(predicate: Function): Function;
    once(func: Function): Function;
    overArgs(func: Function): (transforms: Array<Function>) => Function;
    overArgs(func: Function, transforms: Array<Function>): Function;
    useWith(func: Function): (transforms: Array<Function>) => Function;
    useWith(func: Function, transforms: Array<Function>): Function;
    partial(func: Function): (partials: Array<any>) => Function;
    partial(func: Function, partials: Array<any>): Function;
    partialRight(func: Function): (partials: Array<any>) => Function;
    partialRight(func: Function, partials: Array<any>): Function;
    rearg(indexes: Array<number>): (func: Function) => Function;
    rearg(indexes: Array<number>, func: Function): Function;
    rest(func: Function): Function;
    unapply(func: Function): Function;
    restFrom(start: number): (func: Function) => Function;
    restFrom(start: number, func: Function): Function;
    spread(func: Function): Function;
    apply(func: Function): Function;
    spreadFrom(start: number): (func: Function) => Function;
    spreadFrom(start: number, func: Function): Function;
    throttle<A, R>(wait: number): (func: (...A) => R) => (...A) => R;
    throttle<A, R>(wait: number, func: (...A) => R): (...A) => R;
    unary<T, R>(func: (T, ...Array<any>) => R): (T) => R;
    wrap(wrapper: Function): (value: any) => Function;
    wrap(wrapper: Function, value: any): Function;

    // Lang
    castArray(value: any): Array<any>;
    clone<T>(value: T): T;
    cloneDeep<T>(value: T): T;
    cloneDeepWith<T, U>(
      customizer: (value: T, key: number | string, object: T, stack: any) => U
    ): (value: T) => U;
    cloneDeepWith<T, U>(
      customizer: (value: T, key: number | string, object: T, stack: any) => U,
      value: T
    ): U;
    cloneWith<T, U>(
      customizer: (value: T, key: number | string, object: T, stack: any) => U
    ): (value: T) => U;
    cloneWith<T, U>(
      customizer: (value: T, key: number | string, object: T, stack: any) => U,
      value: T
    ): U;
    conformsTo<T: { [key: string]: mixed, ... }>(
      predicates: T & { [key: string]: (x: any) => boolean, ... }
    ): (source: T) => boolean;
    conformsTo<T: { [key: string]: mixed, ... }>(
      predicates: T & { [key: string]: (x: any) => boolean, ... },
      source: T
    ): boolean;
    where<T: { [key: string]: mixed, ... }>(
      predicates: T & { [key: string]: (x: any) => boolean, ... }
    ): (source: T) => boolean;
    where<T: { [key: string]: mixed, ... }>(
      predicates: T & { [key: string]: (x: any) => boolean, ... },
      source: T
    ): boolean;
    conforms<T: { [key: string]: mixed, ... }>(
      predicates: T & { [key: string]: (x: any) => boolean, ... }
    ): (source: T) => boolean;
    conforms<T: { [key: string]: mixed, ... }>(
      predicates: T & { [key: string]: (x: any) => boolean, ... },
      source: T
    ): boolean;
    eq(value: any): (other: any) => boolean;
    eq(value: any, other: any): boolean;
    identical(value: any): (other: any) => boolean;
    identical(value: any, other: any): boolean;
    gt(value: any): (other: any) => boolean;
    gt(value: any, other: any): boolean;
    gte(value: any): (other: any) => boolean;
    gte(value: any, other: any): boolean;
    isArguments(value: any): boolean;
    isArray(value: any): boolean;
    isArrayBuffer(value: any): boolean;
    isArrayLike(value: any): boolean;
    isArrayLikeObject(value: any): boolean;
    isBoolean(value: any): boolean;
    isBuffer(value: any): boolean;
    isDate(value: any): boolean;
    isElement(value: any): boolean;
    isEmpty(value: any): boolean;
    isEqual(value: any): (other: any) => boolean;
    isEqual(value: any, other: any): boolean;
    equals(value: any): (other: any) => boolean;
    equals(value: any, other: any): boolean;
    isEqualWith<T, U>(
      customizer: (
        objValue: any,
        otherValue: any,
        key: number | string,
        object: T,
        other: U,
        stack: any
      ) => boolean | void
    ): ((value: T) => (other: U) => boolean) &
      ((value: T, other: U) => boolean);
    isEqualWith<T, U>(
      customizer: (
        objValue: any,
        otherValue: any,
        key: number | string,
        object: T,
        other: U,
        stack: any
      ) => boolean | void,
      value: T
    ): (other: U) => boolean;
    isEqualWith<T, U>(
      customizer: (
        objValue: any,
        otherValue: any,
        key: number | string,
        object: T,
        other: U,
        stack: any
      ) => boolean | void,
      value: T,
      other: U
    ): boolean;
    isError(value: any): boolean;
    isFinite(value: any): boolean;
    isFunction(value: any): boolean;
    isInteger(value: any): boolean;
    isLength(value: any): boolean;
    isMap(value: any): boolean;
    isMatch(source: Object): (object: Object) => boolean;
    isMatch(source: Object, object: Object): boolean;
    whereEq(source: Object): (object: Object) => boolean;
    whereEq(source: Object, object: Object): boolean;
    isMatchWith<T: Object, U: Object>(
      customizer: (
        objValue: any,
        srcValue: any,
        key: number | string,
        object: T,
        source: U
      ) => boolean | void
    ): ((source: U) => (object: T) => boolean) &
      ((source: U, object: T) => boolean);
    isMatchWith<T: Object, U: Object>(
      customizer: (
        objValue: any,
        srcValue: any,
        key: number | string,
        object: T,
        source: U
      ) => boolean | void,
      source: U
    ): (object: T) => boolean;
    isMatchWith<T: Object, U: Object>(
      customizer: (
        objValue: any,
        srcValue: any,
        key: number | string,
        object: T,
        source: U
      ) => boolean | void,
      source: U,
      object: T
    ): boolean;
    isNaN(value: any): boolean;
    isNative(value: any): boolean;
    isNil(value: any): boolean;
    isNull(value: any): boolean;
    isNumber(value: any): boolean;
    isObject(value: any): boolean;
    isObjectLike(value: any): boolean;
    isPlainObject(value: any): boolean;
    isRegExp(value: any): boolean;
    isSafeInteger(value: any): boolean;
    isSet(value: any): boolean;
    isString(value: string): true;
    isString(value: any): false;
    isSymbol(value: any): boolean;
    isTypedArray(value: any): boolean;
    isUndefined(value: any): boolean;
    isWeakMap(value: any): boolean;
    isWeakSet(value: any): boolean;
    lt(value: any): (other: any) => boolean;
    lt(value: any, other: any): boolean;
    lte(value: any): (other: any) => boolean;
    lte(value: any, other: any): boolean;
    toArray(value: any): Array<any>;
    toFinite(value: any): number;
    toInteger(value: any): number;
    toLength(value: any): number;
    toNumber(value: any): number;
    toPlainObject(value: any): Object;
    toSafeInteger(value: any): number;
    toString(value: any): string;

    // Math
    add(augend: number): (addend: number) => number;
    add(augend: number, addend: number): number;
    ceil(number: number): number;
    divide(dividend: number): (divisor: number) => number;
    divide(dividend: number, divisor: number): number;
    floor(number: number): number;
    max<T>(array: Array<T>): T;
    maxBy<T>(iteratee: Iteratee<T>): (array: Array<T>) => T;
    maxBy<T>(iteratee: Iteratee<T>, array: Array<T>): T;
    mean(array: Array<any>): number;
    meanBy<T>(iteratee: Iteratee<T>): (array: Array<T>) => number;
    meanBy<T>(iteratee: Iteratee<T>, array: Array<T>): number;
    min<T>(array: Array<T>): T;
    minBy<T>(iteratee: Iteratee<T>): (array: Array<T>) => T;
    minBy<T>(iteratee: Iteratee<T>, array: Array<T>): T;
    multiply(multiplier: number): (multiplicand: number) => number;
    multiply(multiplier: number, multiplicand: number): number;
    round(number: number): number;
    subtract(minuend: number): (subtrahend: number) => number;
    subtract(minuend: number, subtrahend: number): number;
    sum(array: Array<any>): number;
    sumBy<T>(iteratee: Iteratee<T>): (array: Array<T>) => number;
    sumBy<T>(iteratee: Iteratee<T>, array: Array<T>): number;

    // number
    clamp(
      lower: number
    ): ((upper: number) => (number: number) => number) &
      ((upper: number, number: number) => number);
    clamp(lower: number, upper: number): (number: number) => number;
    clamp(lower: number, upper: number, number: number): number;
    inRange(
      start: number
    ): ((end: number) => (number: number) => boolean) &
      ((end: number, number: number) => boolean);
    inRange(start: number, end: number): (number: number) => boolean;
    inRange(start: number, end: number, number: number): boolean;
    random(lower: number): (upper: number) => number;
    random(lower: number, upper: number): number;

    // Object
    assign(object: Object): (source: Object) => Object;
    assign(object: Object, source: Object): Object;
    assignAll(objects: Array<Object>): Object;
    assignInAll(objects: Array<Object>): Object;
    extendAll(objects: Array<Object>): Object;
    assignIn<A, B>(a: A): (b: B) => A & B;
    assignIn<A, B>(a: A, b: B): A & B;
    assignInWith<T: Object, A: Object>(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A
      ) => any | void
    ): ((object: T) => (s1: A) => Object) & ((object: T, s1: A) => Object);
    assignInWith<T: Object, A: Object>(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A
      ) => any | void,
      object: T
    ): (s1: A) => Object;
    assignInWith<T: Object, A: Object>(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A
      ) => any | void,
      object: T,
      s1: A
    ): Object;
    assignWith<T: Object, A: Object>(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A
      ) => any | void
    ): ((object: T) => (s1: A) => Object) & ((object: T, s1: A) => Object);
    assignWith<T: Object, A: Object>(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A
      ) => any | void,
      object: T
    ): (s1: A) => Object;
    assignWith<T: Object, A: Object>(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A
      ) => any | void,
      object: T,
      s1: A
    ): Object;
    assignInAllWith(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: Object,
        source: Object
      ) => any | void
    ): (objects: Array<Object>) => Object;
    assignInAllWith(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: Object,
        source: Object
      ) => any | void,
      objects: Array<Object>
    ): Object;
    extendAllWith(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: Object,
        source: Object
      ) => any | void
    ): (objects: Array<Object>) => Object;
    extendAllWith(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: Object,
        source: Object
      ) => any | void,
      objects: Array<Object>
    ): Object;
    assignAllWith(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: Object,
        source: Object
      ) => any | void
    ): (objects: Array<Object>) => Object;
    assignAllWith(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: Object,
        source: Object
      ) => any | void,
      objects: Array<Object>
    ): Object;
    at(paths: Array<string>): (object: Object) => Array<any>;
    at(paths: Array<string>, object: Object): Array<any>;
    props(paths: Array<string>): (object: Object) => Array<any>;
    props(paths: Array<string>, object: Object): Array<any>;
    paths(paths: Array<string>): (object: Object) => Array<any>;
    paths(paths: Array<string>, object: Object): Array<any>;
    create<T>(prototype: T): T;
    defaults(source: Object): (object: Object) => Object;
    defaults(source: Object, object: Object): Object;
    defaultsAll(objects: Array<Object>): Object;
    defaultsDeep(source: Object): (object: Object) => Object;
    defaultsDeep(source: Object, object: Object): Object;
    defaultsDeepAll(objects: Array<Object>): Object;
    // alias for _.toPairs
    entries(object: Object): Array<[string, any]>;
    // alias for _.toPairsIn
    entriesIn(object: Object): Array<[string, any]>;
    // alias for _.assignIn
    extend<A, B>(a: A): (b: B) => A & B;
    extend<A, B>(a: A, b: B): A & B;
    // alias for _.assignInWith
    extendWith<T: Object, A: Object>(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A
      ) => any | void
    ): ((object: T) => (s1: A) => Object) & ((object: T, s1: A) => Object);
    extendWith<T: Object, A: Object>(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A
      ) => any | void,
      object: T
    ): (s1: A) => Object;
    extendWith<T: Object, A: Object>(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A
      ) => any | void,
      object: T,
      s1: A
    ): Object;
    findKey<A, T: { [id: any]: A, ... }>(
      predicate: OPredicate<A>
    ): (object: T) => string | void;
    findKey<A, T: { [id: any]: A, ... }>(
      predicate: OPredicate<A>,
      object: T
    ): string | void;
    findLastKey<A, T: { [id: any]: A, ... }>(
      predicate: OPredicate<A>
    ): (object: T) => string | void;
    findLastKey<A, T: { [id: any]: A, ... }>(
      predicate: OPredicate<A>,
      object: T
    ): string | void;
    forIn(iteratee: OIteratee<any>): (object: Object) => Object;
    forIn(iteratee: OIteratee<any>, object: Object): Object;
    forInRight(iteratee: OIteratee<any>): (object: Object) => Object;
    forInRight(iteratee: OIteratee<any>, object: Object): Object;
    forOwn(iteratee: OIteratee<any>): (object: Object) => Object;
    forOwn(iteratee: OIteratee<any>, object: Object): Object;
    forOwnRight(iteratee: OIteratee<any>): (object: Object) => Object;
    forOwnRight(iteratee: OIteratee<any>, object: Object): Object;
    functions(object: Object): Array<string>;
    functionsIn(object: Object): Array<string>;
    get(
      path: Path
    ): (object: Object | $ReadOnlyArray<any> | void | null) => any;
    get(
      path: Path,
      object: Object | $ReadOnlyArray<any> | void | null
    ): any;
    prop(path: Path): (object: Object | Array<any>) => any;
    prop(path: Path, object: Object | Array<any>): any;
    path(path: Path): (object: Object | Array<any>) => any;
    path(path: Path, object: Object | Array<any>): any;
    getOr(
      defaultValue: any
    ): ((
      path: Path
    ) => (object: Object | Array<any>) => any) &
      ((
        path: Path,
        object: Object | $ReadOnlyArray<any> | void | null
      ) => any);
    getOr(
      defaultValue: any,
      path: Path
    ): (object: Object | $ReadOnlyArray<any> | void | null) => any;
    getOr(
      defaultValue: any,
      path: Path,
      object: Object | $ReadOnlyArray<any> | void | null
    ): any;
    propOr(
      defaultValue: any
    ): ((
      path: Path
    ) => (object: Object | Array<any>) => any) &
      ((path: Path, object: Object | Array<any>) => any);
    propOr(
      defaultValue: any,
      path: Path
    ): (object: Object | Array<any>) => any;
    propOr(
      defaultValue: any,
      path: Path,
      object: Object | Array<any>
    ): any;
    pathOr(
      defaultValue: any
    ): ((
      path: Path
    ) => (object: Object | Array<any>) => any) &
      ((path: Path, object: Object | Array<any>) => any);
    pathOr(
      defaultValue: any,
      path: Path
    ): (object: Object | Array<any>) => any;
    pathOr(
      defaultValue: any,
      path: Path,
      object: Object | Array<any>
    ): any;
    has(path: Path): (object: Object) => boolean;
    has(path: Path, object: Object): boolean;
    hasIn(path: Path): (object: Object) => boolean;
    hasIn(path: Path, object: Object): boolean;
    invert(object: Object): Object;
    invertObj(object: Object): Object;
    invertBy(iteratee: Function): (object: Object) => Object;
    invertBy(iteratee: Function, object: Object): Object;
    invoke(path: Path): (object: Object) => any;
    invoke(path: Path, object: Object): any;
    invokeArgs(
      path: Path
    ): ((object: Object) => (args: Array<any>) => any) &
      ((object: Object, args: Array<any>) => any);
    invokeArgs(
      path: Path,
      object: Object
    ): (args: Array<any>) => any;
    invokeArgs(
      path: Path,
      object: Object,
      args: Array<any>
    ): any;
    keys<K>(object: { [key: K]: any, ... }): Array<K>;
    keys(object: Object): Array<string>;
    keysIn(object: Object): Array<string>;
    mapKeys(iteratee: OIteratee<any>): (object: Object) => Object;
    mapKeys(iteratee: OIteratee<any>, object: Object): Object;
    mapValues(iteratee: OIteratee<any>): (object: Object) => Object;
    mapValues(iteratee: OIteratee<any>, object: Object): Object;
    merge(object: Object): (source: Object) => Object;
    merge(object: Object, source: Object): Object;
    mergeAll(objects: Array<Object>): Object;
    mergeWith<T: Object, A: Object, B: Object>(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A | B
      ) => any | void
    ): ((object: T) => (s1: A) => Object) & ((object: T, s1: A) => Object);
    mergeWith<T: Object, A: Object, B: Object>(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A | B
      ) => any | void,
      object: T
    ): (s1: A) => Object;
    mergeWith<T: Object, A: Object, B: Object>(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A | B
      ) => any | void,
      object: T,
      s1: A
    ): Object;
    mergeAllWith(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: Object,
        source: Object
      ) => any | void
    ): (objects: Array<Object>) => Object;
    mergeAllWith(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: Object,
        source: Object
      ) => any | void,
      objects: Array<Object>
    ): Object;
    omit(props: Array<string>): (object: Object) => Object;
    omit(props: Array<string>, object: Object): Object;
    omitAll(props: Array<string>): (object: Object) => Object;
    omitAll(props: Array<string>, object: Object): Object;
    omitBy<A, T: $ReadOnly<{ [id: any]: A, ... }>>(
      predicate: OPredicate<A>
    ): (object: T) => Object;
    omitBy<A, T: $ReadOnly<{ [id: any]: A, ... }>>(predicate: OPredicate<A>, object: T): Object;
    pick(...props: Array<string | {...}>): Object;
    pick(props: $ReadOnlyArray<string>, object: Object): Object;
    pick(...props: Array<string>): (object: Object) => Object;
    pick(props: $ReadOnlyArray<string>): (object: Object) => Object;
    pickAll(props: Array<string>): (object: Object) => Object;
    pickAll(props: Array<string>, object: Object): Object;
    pickBy<A, T: $ReadOnly<{ [id: any]: A, ... }>>(
      predicate: OPredicate<A>
    ): (object: T) => Object;
    pickBy<A, T: $ReadOnly<{ [id: any]: A, ... }>>(predicate: OPredicate<A>, object: T): Object;
    result(path: Path): (object: Object) => any;
    result(path: Path, object: Object): any;
    set(
      path: Path
    ): ((value: any) => (object: Object) => Object) &
      ((value: any, object: Object) => Object);
    set(path: Path, value: any): (object: Object) => Object;
    set(path: Path, value: any, object: Object): Object;
    assoc(
      path: Path
    ): ((value: any) => (object: Object) => Object) &
      ((value: any, object: Object) => Object);
    assoc(path: Path, value: any): (object: Object) => Object;
    assoc(path: Path, value: any, object: Object): Object;
    assocPath(
      path: Path
    ): ((value: any) => (object: Object) => Object) &
      ((value: any, object: Object) => Object);
    assocPath(
      path: Path,
      value: any
    ): (object: Object) => Object;
    assocPath(path: Path, value: any, object: Object): Object;
    setWith<T>(
      customizer: (nsValue: any, key: string, nsObject: T) => any
    ): ((
      path: Path
    ) => ((value: any) => (object: T) => Object) &
      ((value: any, object: T) => Object)) &
      ((path: Path, value: any) => (object: T) => Object) &
      ((path: Path, value: any, object: T) => Object);
    setWith<T>(
      customizer: (nsValue: any, key: string, nsObject: T) => any,
      path: Path
    ): ((value: any) => (object: T) => Object) &
      ((value: any, object: T) => Object);
    setWith<T>(
      customizer: (nsValue: any, key: string, nsObject: T) => any,
      path: Path,
      value: any
    ): (object: T) => Object;
    setWith<T>(
      customizer: (nsValue: any, key: string, nsObject: T) => any,
      path: Path,
      value: any,
      object: T
    ): Object;
    toPairs(object: Object | Array<any>): Array<[string, any]>;
    toPairsIn(object: Object): Array<[string, any]>;
    transform(
      iteratee: OIteratee<any>
    ): ((
      accumulator: any
    ) => (collection: Object | $ReadOnlyArray<any>) => any) &
      ((accumulator: any, collection: Object | $ReadOnlyArray<any>) => any);
    transform(
      iteratee: OIteratee<any>,
      accumulator: any
    ): (collection: Object | $ReadOnlyArray<any>) => any;
    transform(
      iteratee: OIteratee<any>,
      accumulator: any,
      collection: Object | $ReadOnlyArray<any>
    ): any;
    unset(path: Path): (object: Object) => Object;
    unset(path: Path, object: Object): Object;
    dissoc(path: Path): (object: Object) => Object;
    dissoc(path: Path, object: Object): Object;
    dissocPath(path: Path): (object: Object) => Object;
    dissocPath(path: Path, object: Object): Object;
    update(
      path: Path
    ): ((updater: Function) => (object: Object) => Object) &
      ((updater: Function, object: Object) => Object);
    update(
      path: Path,
      updater: Function
    ): (object: Object) => Object;
    update(path: Path, updater: Function, object: Object): Object;
    updateWith(
      customizer: Function
    ): ((
      path: Path
    ) => ((updater: Function) => (object: Object) => Object) &
      ((updater: Function, object: Object) => Object)) &
      ((
        path: Path,
        updater: Function
      ) => (object: Object) => Object) &
      ((path: Path, updater: Function, object: Object) => Object);
    updateWith(
      customizer: Function,
      path: Path
    ): ((updater: Function) => (object: Object) => Object) &
      ((updater: Function, object: Object) => Object);
    updateWith(
      customizer: Function,
      path: Path,
      updater: Function
    ): (object: Object) => Object;
    updateWith(
      customizer: Function,
      path: Path,
      updater: Function,
      object: Object
    ): Object;
    values(object: Object): Array<any>;
    valuesIn(object: Object): Array<any>;

    tap<T>(interceptor: (value: T) => any): (value: T) => T;
    tap<T>(interceptor: (value: T) => any, value: T): T;
    thru<T1, T2>(interceptor: (value: T1) => T2): (value: T1) => T2;
    thru<T1, T2>(interceptor: (value: T1) => T2, value: T1): T2;

    // String
    camelCase(string: string): string;
    capitalize(string: string): string;
    deburr(string: string): string;
    endsWith(target: string): (string: string) => boolean;
    endsWith(target: string, string: string): boolean;
    escape(string: string): string;
    escapeRegExp(string: string): string;
    kebabCase(string: string): string;
    lowerCase(string: string): string;
    lowerFirst(string: string): string;
    pad(length: number): (string: string) => string;
    pad(length: number, string: string): string;
    padChars(
      chars: string
    ): ((length: number) => (string: string) => string) &
      ((length: number, string: string) => string);
    padChars(chars: string, length: number): (string: string) => string;
    padChars(chars: string, length: number, string: string): string;
    padEnd(length: number): (string: string) => string;
    padEnd(length: number, string: string): string;
    padCharsEnd(
      chars: string
    ): ((length: number) => (string: string) => string) &
      ((length: number, string: string) => string);
    padCharsEnd(chars: string, length: number): (string: string) => string;
    padCharsEnd(chars: string, length: number, string: string): string;
    padStart(length: number): (string: string) => string;
    padStart(length: number, string: string): string;
    padCharsStart(
      chars: string
    ): ((length: number) => (string: string) => string) &
      ((length: number, string: string) => string);
    padCharsStart(chars: string, length: number): (string: string) => string;
    padCharsStart(chars: string, length: number, string: string): string;
    parseInt(radix: number): (string: string) => number;
    parseInt(radix: number, string: string): number;
    repeat(n: number): (string: string) => string;
    repeat(n: number, string: string): string;
    replace(
      pattern: RegExp | string
    ): ((
      replacement: ((string: string) => string) | string
    ) => (string: string) => string) &
      ((
        replacement: ((string: string) => string) | string,
        string: string
      ) => string);
    replace(
      pattern: RegExp | string,
      replacement: ((string: string) => string) | string
    ): (string: string) => string;
    replace(
      pattern: RegExp | string,
      replacement: ((string: string) => string) | string,
      string: string
    ): string;
    snakeCase(string: string): string;
    split(separator: RegExp | string): (string: string) => Array<string>;
    split(separator: RegExp | string, string: string): Array<string>;
    startCase(string: string): string;
    startsWith(target: string): (string: string) => boolean;
    startsWith(target: string, string: string): boolean;
    template(string: string): Function;
    toLower(string: string): string;
    toUpper(string: string): string;
    trim(string: string): string;
    trimChars(chars: string): (string: string) => string;
    trimChars(chars: string, string: string): string;
    trimEnd(string: string): string;
    trimCharsEnd(chars: string): (string: string) => string;
    trimCharsEnd(chars: string, string: string): string;
    trimStart(string: string): string;
    trimCharsStart(chars: string): (string: string) => string;
    trimCharsStart(chars: string, string: string): string;
    truncate(options: TruncateOptions): (string: string) => string;
    truncate(options: TruncateOptions, string: string): string;
    unescape(string: string): string;
    upperCase(string: string): string;
    upperFirst(string: string): string;
    words(string: string): Array<string>;

    // Util
    attempt(func: Function): any;
    bindAll(methodNames: Array<string>): (object: Object) => Object;
    bindAll(methodNames: Array<string>, object: Object): Object;
    cond(pairs: NestedArray<Function>): Function;
    constant<T>(value: T): () => T;
    always<T>(value: T): () => T;
    defaultTo<T1: void | null, T2>(defaultValue: T2): (value: T1) => T2;
    defaultTo<T1: void | null, T2>(defaultValue: T2, value: T1): T2;
    defaultTo<T1: string | boolean, T2>(
      defaultValue: T2
    ): (value: T1) => T1;
    defaultTo<T1: string | boolean, T2>(
      defaultValue: T2,
      value: T1
    ): T1;
    // NaN is a number instead of its own type, otherwise it would behave like null/void
    defaultTo<T1: number, T2>(defaultValue: T2): (value: T1) => T1 | T2;
    defaultTo<T1: number, T2>(defaultValue: T2, value: T1): T1 | T2;
    flow: any & ((funcs: Array<Function>) => Function);
    pipe: any & ((funcs: Array<Function>) => Function);
    flowRight: any & ((funcs: Array<Function>) => Function);
    compose: any & ((funcs: Array<Function>) => Function);
    compose(funcs: Array<Function>): Function;
    identity<T>(value: T): T;
    iteratee(func: any): Function;
    matches(source: Object): (object: Object) => boolean;
    matches(source: Object, object: Object): boolean;
    matchesProperty(path: Path): (srcValue: any) => Function;
    matchesProperty(path: Path, srcValue: any): Function;
    propEq(path: Path): (srcValue: any) => Function;
    propEq(path: Path, srcValue: any): Function;
    pathEq(path: Path): (srcValue: any) => Function;
    pathEq(path: Path, srcValue: any): Function;
    method(path: Path): Function;
    methodOf(object: Object): Function;
    mixin<T: Function | Object>(
      object: T
    ): ((source: Object) => (options: { chain: boolean, ... }) => T) &
      ((source: Object, options: { chain: boolean, ... }) => T);
    mixin<T: Function | Object>(
      object: T,
      source: Object
    ): (options: { chain: boolean, ... }) => T;
    mixin<T: Function | Object>(
      object: T,
      source: Object,
      options: { chain: boolean, ... }
    ): T;
    noConflict(): Lodash;
    noop(...args: Array<mixed>): void;
    nthArg(n: number): Function;
    over(iteratees: Array<Function>): Function;
    juxt(iteratees: Array<Function>): Function;
    overEvery(predicates: Array<Function>): Function;
    allPass(predicates: Array<Function>): Function;
    overSome(predicates: Array<Function>): Function;
    anyPass(predicates: Array<Function>): Function;
    property(
      path: Path
    ): (object: Object | Array<any>) => any;
    property(path: Path, object: Object | Array<any>): any;
    propertyOf(object: Object): (path: Path) => Function;
    propertyOf(object: Object, path: Path): Function;
    range(start: number): (end: number) => Array<number>;
    range(start: number, end: number): Array<number>;
    rangeStep(
      step: number
    ): ((start: number) => (end: number) => Array<number>) &
      ((start: number, end: number) => Array<number>);
    rangeStep(step: number, start: number): (end: number) => Array<number>;
    rangeStep(step: number, start: number, end: number): Array<number>;
    rangeRight(start: number): (end: number) => Array<number>;
    rangeRight(start: number, end: number): Array<number>;
    rangeStepRight(
      step: number
    ): ((start: number) => (end: number) => Array<number>) &
      ((start: number, end: number) => Array<number>);
    rangeStepRight(step: number, start: number): (end: number) => Array<number>;
    rangeStepRight(step: number, start: number, end: number): Array<number>;
    runInContext(context: Object): Function;

    stubArray(): Array<any>;
    stubFalse(): false;
    F(): false;
    stubObject(): {...};
    stubString(): "";
    stubTrue(): true;
    T(): true;
    times<T>(iteratee: (i: number) => T): (n: number) => Array<T>;
    times<T>(iteratee: (i: number) => T, n: number): Array<T>;
    toPath(value: any): Array<string>;
    uniqueId(prefix: string): string;

    __: any;
    placeholder: any;

    convert(options: {
      cap?: boolean,
      curry?: boolean,
      fixed?: boolean,
      immutable?: boolean,
      rearg?: boolean,
      ...
    }): void;

    // Properties
    VERSION: string;
    templateSettings: TemplateSettings;
  }

  declare module.exports: Lodash;
}

declare module "lodash/chunk" {
  declare module.exports: any;
}

declare module "lodash/compact" {
  declare module.exports: any;
}

declare module "lodash/concat" {
  declare module.exports: any;
}

declare module "lodash/difference" {
  declare module.exports: any;
}

declare module "lodash/differenceBy" {
  declare module.exports: any;
}

declare module "lodash/differenceWith" {
  declare module.exports: any;
}

declare module "lodash/drop" {
  declare module.exports: any;
}

declare module "lodash/dropRight" {
  declare module.exports: any;
}

declare module "lodash/dropRightWhile" {
  declare module.exports: any;
}

declare module "lodash/dropWhile" {
  declare module.exports: any;
}

declare module "lodash/fill" {
  declare module.exports: any;
}

declare module "lodash/findIndex" {
  declare module.exports: any;
}

declare module "lodash/findLastIndex" {
  declare module.exports: any;
}

declare module "lodash/first" {
  declare module.exports: any;
}

declare module "lodash/flatten" {
  declare module.exports: any;
}

declare module "lodash/flattenDeep" {
  declare module.exports: any;
}

declare module "lodash/flattenDepth" {
  declare module.exports: any;
}

declare module "lodash/fromPairs" {
  declare module.exports: any;
}

declare module "lodash/head" {
  declare module.exports: any;
}

declare module "lodash/indexOf" {
  declare module.exports: any;
}

declare module "lodash/initial" {
  declare module.exports: any;
}

declare module "lodash/intersection" {
  declare module.exports: any;
}

declare module "lodash/intersectionBy" {
  declare module.exports: any;
}

declare module "lodash/intersectionWith" {
  declare module.exports: any;
}

declare module "lodash/join" {
  declare module.exports: any;
}

declare module "lodash/last" {
  declare module.exports: any;
}

declare module "lodash/lastIndexOf" {
  declare module.exports: any;
}

declare module "lodash/nth" {
  declare module.exports: any;
}

declare module "lodash/pull" {
  declare module.exports: any;
}

declare module "lodash/pullAll" {
  declare module.exports: any;
}

declare module "lodash/pullAllBy" {
  declare module.exports: any;
}

declare module "lodash/pullAllWith" {
  declare module.exports: any;
}

declare module "lodash/pullAt" {
  declare module.exports: any;
}

declare module "lodash/remove" {
  declare module.exports: any;
}

declare module "lodash/reverse" {
  declare module.exports: any;
}

declare module "lodash/slice" {
  declare module.exports: any;
}

declare module "lodash/sortedIndex" {
  declare module.exports: any;
}

declare module "lodash/sortedIndexBy" {
  declare module.exports: any;
}

declare module "lodash/sortedIndexOf" {
  declare module.exports: any;
}

declare module "lodash/sortedLastIndex" {
  declare module.exports: any;
}

declare module "lodash/sortedLastIndexBy" {
  declare module.exports: any;
}

declare module "lodash/sortedLastIndexOf" {
  declare module.exports: any;
}

declare module "lodash/sortedUniq" {
  declare module.exports: any;
}

declare module "lodash/sortedUniqBy" {
  declare module.exports: any;
}

declare module "lodash/tail" {
  declare module.exports: any;
}

declare module "lodash/take" {
  declare module.exports: any;
}

declare module "lodash/takeRight" {
  declare module.exports: any;
}

declare module "lodash/takeRightWhile" {
  declare module.exports: any;
}

declare module "lodash/takeWhile" {
  declare module.exports: any;
}

declare module "lodash/union" {
  declare module.exports: any;
}

declare module "lodash/unionBy" {
  declare module.exports: any;
}

declare module "lodash/unionWith" {
  declare module.exports: any;
}

declare module "lodash/uniq" {
  declare module.exports: any;
}

declare module "lodash/uniqBy" {
  declare module.exports: any;
}

declare module "lodash/uniqWith" {
  declare module.exports: any;
}

declare module "lodash/unzip" {
  declare module.exports: any;
}

declare module "lodash/unzipWith" {
  declare module.exports: any;
}

declare module "lodash/without" {
  declare module.exports: any;
}

declare module "lodash/xor" {
  declare module.exports: any;
}

declare module "lodash/xorBy" {
  declare module.exports: any;
}

declare module "lodash/xorWith" {
  declare module.exports: any;
}

declare module "lodash/zip" {
  declare module.exports: any;
}

declare module "lodash/zipObject" {
  declare module.exports: any;
}

declare module "lodash/zipObjectDeep" {
  declare module.exports: any;
}

declare module "lodash/zipWith" {
  declare module.exports: any;
}

declare module "lodash/countBy" {
  declare module.exports: any;
}

declare module "lodash/each" {
  declare module.exports: any;
}

declare module "lodash/eachRight" {
  declare module.exports: any;
}

declare module "lodash/every" {
  declare module.exports: any;
}

declare module "lodash/filter" {
  declare module.exports: any;
}

declare module "lodash/find" {
  declare module.exports: any;
}

declare module "lodash/findLast" {
  declare module.exports: any;
}

declare module "lodash/flatMap" {
  declare module.exports: any;
}

declare module "lodash/flatMapDeep" {
  declare module.exports: any;
}

declare module "lodash/flatMapDepth" {
  declare module.exports: any;
}

declare module "lodash/forEach" {
  declare module.exports: any;
}

declare module "lodash/forEachRight" {
  declare module.exports: any;
}

declare module "lodash/groupBy" {
  declare module.exports: any;
}

declare module "lodash/includes" {
  declare module.exports: any;
}

declare module "lodash/invokeMap" {
  declare module.exports: any;
}

declare module "lodash/keyBy" {
  declare module.exports: any;
}

declare module "lodash/map" {
  declare module.exports: any;
}

declare module "lodash/orderBy" {
  declare module.exports: any;
}

declare module "lodash/partition" {
  declare module.exports: any;
}

declare module "lodash/reduce" {
  declare module.exports: any;
}

declare module "lodash/reduceRight" {
  declare module.exports: any;
}

declare module "lodash/reject" {
  declare module.exports: any;
}

declare module "lodash/sample" {
  declare module.exports: any;
}

declare module "lodash/sampleSize" {
  declare module.exports: any;
}

declare module "lodash/shuffle" {
  declare module.exports: any;
}

declare module "lodash/size" {
  declare module.exports: any;
}

declare module "lodash/some" {
  declare module.exports: any;
}

declare module "lodash/sortBy" {
  declare module.exports: any;
}

declare module "lodash/now" {
  declare module.exports: any;
}

declare module "lodash/after" {
  declare module.exports: any;
}

declare module "lodash/ary" {
  declare module.exports: any;
}

declare module "lodash/before" {
  declare module.exports: any;
}

declare module "lodash/bind" {
  declare module.exports: any;
}

declare module "lodash/bindKey" {
  declare module.exports: any;
}

declare module "lodash/curry" {
  declare module.exports: any;
}

declare module "lodash/curryRight" {
  declare module.exports: any;
}

declare module "lodash/debounce" {
  declare module.exports: any;
}

declare module "lodash/defer" {
  declare module.exports: any;
}

declare module "lodash/delay" {
  declare module.exports: any;
}

declare module "lodash/flip" {
  declare module.exports: any;
}

declare module "lodash/memoize" {
  declare module.exports: any;
}

declare module "lodash/negate" {
  declare module.exports: any;
}

declare module "lodash/once" {
  declare module.exports: any;
}

declare module "lodash/overArgs" {
  declare module.exports: any;
}

declare module "lodash/partial" {
  declare module.exports: any;
}

declare module "lodash/partialRight" {
  declare module.exports: any;
}

declare module "lodash/rearg" {
  declare module.exports: any;
}

declare module "lodash/rest" {
  declare module.exports: any;
}

declare module "lodash/spread" {
  declare module.exports: any;
}

declare module "lodash/throttle" {
  declare module.exports: any;
}

declare module "lodash/unary" {
  declare module.exports: any;
}

declare module "lodash/wrap" {
  declare module.exports: any;
}

declare module "lodash/castArray" {
  declare module.exports: any;
}

declare module "lodash/clone" {
  declare module.exports: any;
}

declare module "lodash/cloneDeep" {
  declare module.exports: any;
}

declare module "lodash/cloneDeepWith" {
  declare module.exports: any;
}

declare module "lodash/cloneWith" {
  declare module.exports: any;
}

declare module "lodash/conformsTo" {
  declare module.exports: any;
}

declare module "lodash/eq" {
  declare module.exports: any;
}

declare module "lodash/gt" {
  declare module.exports: any;
}

declare module "lodash/gte" {
  declare module.exports: any;
}

declare module "lodash/isArguments" {
  declare module.exports: any;
}

declare module "lodash/isArray" {
  declare module.exports: any;
}

declare module "lodash/isArrayBuffer" {
  declare module.exports: any;
}

declare module "lodash/isArrayLike" {
  declare module.exports: any;
}

declare module "lodash/isArrayLikeObject" {
  declare module.exports: any;
}

declare module "lodash/isBoolean" {
  declare module.exports: any;
}

declare module "lodash/isBuffer" {
  declare module.exports: any;
}

declare module "lodash/isDate" {
  declare module.exports: any;
}

declare module "lodash/isElement" {
  declare module.exports: any;
}

declare module "lodash/isEmpty" {
  declare module.exports: any;
}

declare module "lodash/isEqual" {
  declare module.exports: any;
}

declare module "lodash/isEqualWith" {
  declare module.exports: any;
}

declare module "lodash/isError" {
  declare module.exports: any;
}

declare module "lodash/isFinite" {
  declare module.exports: any;
}

declare module "lodash/isFunction" {
  declare module.exports: any;
}

declare module "lodash/isInteger" {
  declare module.exports: any;
}

declare module "lodash/isLength" {
  declare module.exports: any;
}

declare module "lodash/isMap" {
  declare module.exports: any;
}

declare module "lodash/isMatch" {
  declare module.exports: any;
}

declare module "lodash/isMatchWith" {
  declare module.exports: any;
}

declare module "lodash/isNaN" {
  declare module.exports: any;
}

declare module "lodash/isNative" {
  declare module.exports: any;
}

declare module "lodash/isNil" {
  declare module.exports: any;
}

declare module "lodash/isNull" {
  declare module.exports: any;
}

declare module "lodash/isNumber" {
  declare module.exports: any;
}

declare module "lodash/isObject" {
  declare module.exports: any;
}

declare module "lodash/isObjectLike" {
  declare module.exports: any;
}

declare module "lodash/isPlainObject" {
  declare module.exports: any;
}

declare module "lodash/isRegExp" {
  declare module.exports: any;
}

declare module "lodash/isSafeInteger" {
  declare module.exports: any;
}

declare module "lodash/isSet" {
  declare module.exports: any;
}

declare module "lodash/isString" {
  declare module.exports: any;
}

declare module "lodash/isSymbol" {
  declare module.exports: any;
}

declare module "lodash/isTypedArray" {
  declare module.exports: any;
}

declare module "lodash/isUndefined" {
  declare module.exports: any;
}

declare module "lodash/isWeakMap" {
  declare module.exports: any;
}

declare module "lodash/isWeakSet" {
  declare module.exports: any;
}

declare module "lodash/lt" {
  declare module.exports: any;
}

declare module "lodash/lte" {
  declare module.exports: any;
}

declare module "lodash/toArray" {
  declare module.exports: any;
}

declare module "lodash/toFinite" {
  declare module.exports: any;
}

declare module "lodash/toInteger" {
  declare module.exports: any;
}

declare module "lodash/toLength" {
  declare module.exports: any;
}

declare module "lodash/toNumber" {
  declare module.exports: any;
}

declare module "lodash/toPlainObject" {
  declare module.exports: any;
}

declare module "lodash/toSafeInteger" {
  declare module.exports: any;
}

declare module "lodash/toString" {
  declare module.exports: any;
}

declare module "lodash/add" {
  declare module.exports: any;
}

declare module "lodash/ceil" {
  declare module.exports: any;
}

declare module "lodash/divide" {
  declare module.exports: any;
}

declare module "lodash/floor" {
  declare module.exports: any;
}

declare module "lodash/max" {
  declare module.exports: any;
}

declare module "lodash/maxBy" {
  declare module.exports: any;
}

declare module "lodash/mean" {
  declare module.exports: any;
}

declare module "lodash/meanBy" {
  declare module.exports: any;
}

declare module "lodash/min" {
  declare module.exports: any;
}

declare module "lodash/minBy" {
  declare module.exports: any;
}

declare module "lodash/multiply" {
  declare module.exports: any;
}

declare module "lodash/round" {
  declare module.exports: any;
}

declare module "lodash/subtract" {
  declare module.exports: any;
}

declare module "lodash/sum" {
  declare module.exports: any;
}

declare module "lodash/sumBy" {
  declare module.exports: any;
}

declare module "lodash/clamp" {
  declare module.exports: any;
}

declare module "lodash/inRange" {
  declare module.exports: any;
}

declare module "lodash/random" {
  declare module.exports: any;
}

declare module "lodash/assign" {
  declare module.exports: any;
}

declare module "lodash/assignIn" {
  declare module.exports: any;
}

declare module "lodash/assignInWith" {
  declare module.exports: any;
}

declare module "lodash/assignWith" {
  declare module.exports: any;
}

declare module "lodash/at" {
  declare module.exports: any;
}

declare module "lodash/create" {
  declare module.exports: any;
}

declare module "lodash/defaults" {
  declare module.exports: any;
}

declare module "lodash/defaultsDeep" {
  declare module.exports: any;
}

declare module "lodash/entries" {
  declare module.exports: any;
}

declare module "lodash/entriesIn" {
  declare module.exports: any;
}

declare module "lodash/extend" {
  declare module.exports: any;
}

declare module "lodash/extendWith" {
  declare module.exports: any;
}

declare module "lodash/findKey" {
  declare module.exports: any;
}

declare module "lodash/findLastKey" {
  declare module.exports: any;
}

declare module "lodash/forIn" {
  declare module.exports: any;
}

declare module "lodash/forInRight" {
  declare module.exports: any;
}

declare module "lodash/forOwn" {
  declare module.exports: any;
}

declare module "lodash/forOwnRight" {
  declare module.exports: any;
}

declare module "lodash/functions" {
  declare module.exports: any;
}

declare module "lodash/functionsIn" {
  declare module.exports: any;
}

declare module "lodash/get" {
  declare module.exports: any;
}

declare module "lodash/has" {
  declare module.exports: any;
}

declare module "lodash/hasIn" {
  declare module.exports: any;
}

declare module "lodash/invert" {
  declare module.exports: any;
}

declare module "lodash/invertBy" {
  declare module.exports: any;
}

declare module "lodash/invoke" {
  declare module.exports: any;
}

declare module "lodash/keys" {
  declare module.exports: any;
}

declare module "lodash/keysIn" {
  declare module.exports: any;
}

declare module "lodash/mapKeys" {
  declare module.exports: any;
}

declare module "lodash/mapValues" {
  declare module.exports: any;
}

declare module "lodash/merge" {
  declare module.exports: any;
}

declare module "lodash/mergeWith" {
  declare module.exports: any;
}

declare module "lodash/omit" {
  declare module.exports: any;
}

declare module "lodash/omitBy" {
  declare module.exports: any;
}

declare module "lodash/pick" {
  declare module.exports: any;
}

declare module "lodash/pickBy" {
  declare module.exports: any;
}

declare module "lodash/result" {
  declare module.exports: any;
}

declare module "lodash/set" {
  declare module.exports: any;
}

declare module "lodash/setWith" {
  declare module.exports: any;
}

declare module "lodash/toPairs" {
  declare module.exports: any;
}

declare module "lodash/toPairsIn" {
  declare module.exports: any;
}

declare module "lodash/transform" {
  declare module.exports: any;
}

declare module "lodash/unset" {
  declare module.exports: any;
}

declare module "lodash/update" {
  declare module.exports: any;
}

declare module "lodash/updateWith" {
  declare module.exports: any;
}

declare module "lodash/values" {
  declare module.exports: any;
}

declare module "lodash/valuesIn" {
  declare module.exports: any;
}

declare module "lodash/chain" {
  declare module.exports: any;
}

declare module "lodash/tap" {
  declare module.exports: any;
}

declare module "lodash/thru" {
  declare module.exports: any;
}

declare module "lodash/camelCase" {
  declare module.exports: any;
}

declare module "lodash/capitalize" {
  declare module.exports: any;
}

declare module "lodash/deburr" {
  declare module.exports: any;
}

declare module "lodash/endsWith" {
  declare module.exports: any;
}

declare module "lodash/escape" {
  declare module.exports: any;
}

declare module "lodash/escapeRegExp" {
  declare module.exports: any;
}

declare module "lodash/kebabCase" {
  declare module.exports: any;
}

declare module "lodash/lowerCase" {
  declare module.exports: any;
}

declare module "lodash/lowerFirst" {
  declare module.exports: any;
}

declare module "lodash/pad" {
  declare module.exports: any;
}

declare module "lodash/padEnd" {
  declare module.exports: any;
}

declare module "lodash/padStart" {
  declare module.exports: any;
}

declare module "lodash/parseInt" {
  declare module.exports: any;
}

declare module "lodash/repeat" {
  declare module.exports: any;
}

declare module "lodash/replace" {
  declare module.exports: any;
}

declare module "lodash/snakeCase" {
  declare module.exports: any;
}

declare module "lodash/split" {
  declare module.exports: any;
}

declare module "lodash/startCase" {
  declare module.exports: any;
}

declare module "lodash/startsWith" {
  declare module.exports: any;
}

declare module "lodash/template" {
  declare module.exports: any;
}

declare module "lodash/toLower" {
  declare module.exports: any;
}

declare module "lodash/toUpper" {
  declare module.exports: any;
}

declare module "lodash/trim" {
  declare module.exports: any;
}

declare module "lodash/trimEnd" {
  declare module.exports: any;
}

declare module "lodash/trimStart" {
  declare module.exports: any;
}

declare module "lodash/truncate" {
  declare module.exports: any;
}

declare module "lodash/unescape" {
  declare module.exports: any;
}

declare module "lodash/upperCase" {
  declare module.exports: any;
}

declare module "lodash/upperFirst" {
  declare module.exports: any;
}

declare module "lodash/words" {
  declare module.exports: any;
}

declare module "lodash/attempt" {
  declare module.exports: any;
}

declare module "lodash/bindAll" {
  declare module.exports: any;
}

declare module "lodash/cond" {
  declare module.exports: any;
}

declare module "lodash/conforms" {
  declare module.exports: any;
}

declare module "lodash/constant" {
  declare module.exports: any;
}

declare module "lodash/defaultTo" {
  declare module.exports: any;
}

declare module "lodash/flow" {
  declare module.exports: any;
}

declare module "lodash/flowRight" {
  declare module.exports: any;
}

declare module "lodash/identity" {
  declare module.exports: any;
}

declare module "lodash/iteratee" {
  declare module.exports: any;
}

declare module "lodash/matches" {
  declare module.exports: any;
}

declare module "lodash/matchesProperty" {
  declare module.exports: any;
}

declare module "lodash/method" {
  declare module.exports: any;
}

declare module "lodash/methodOf" {
  declare module.exports: any;
}

declare module "lodash/mixin" {
  declare module.exports: any;
}

declare module "lodash/noConflict" {
  declare module.exports: any;
}

declare module "lodash/noop" {
  declare module.exports: any;
}

declare module "lodash/nthArg" {
  declare module.exports: any;
}

declare module "lodash/over" {
  declare module.exports: any;
}

declare module "lodash/overEvery" {
  declare module.exports: any;
}

declare module "lodash/overSome" {
  declare module.exports: any;
}

declare module "lodash/property" {
  declare module.exports: any;
}

declare module "lodash/propertyOf" {
  declare module.exports: any;
}

declare module "lodash/range" {
  declare module.exports: any;
}

declare module "lodash/rangeRight" {
  declare module.exports: any;
}

declare module "lodash/runInContext" {
  declare module.exports: any;
}

declare module "lodash/stubArray" {
  declare module.exports: any;
}

declare module "lodash/stubFalse" {
  declare module.exports: any;
}

declare module "lodash/stubObject" {
  declare module.exports: any;
}

declare module "lodash/stubString" {
  declare module.exports: any;
}

declare module "lodash/stubTrue" {
  declare module.exports: any;
}

declare module "lodash/times" {
  declare module.exports: any;
}

declare module "lodash/toPath" {
  declare module.exports: any;
}

declare module "lodash/uniqueId" {
  declare module.exports: any;
}

declare module "lodash/fp/chunk" {
  declare module.exports: any;
}

declare module "lodash/fp/compact" {
  declare module.exports: any;
}

declare module "lodash/fp/concat" {
  declare module.exports: any;
}

declare module "lodash/fp/difference" {
  declare module.exports: any;
}

declare module "lodash/fp/differenceBy" {
  declare module.exports: any;
}

declare module "lodash/fp/differenceWith" {
  declare module.exports: any;
}

declare module "lodash/fp/drop" {
  declare module.exports: any;
}

declare module "lodash/fp/dropLast" {
  declare module.exports: any;
}

declare module "lodash/fp/dropRight" {
  declare module.exports: any;
}

declare module "lodash/fp/dropRightWhile" {
  declare module.exports: any;
}

declare module "lodash/fp/dropWhile" {
  declare module.exports: any;
}

declare module "lodash/fp/dropLastWhile" {
  declare module.exports: any;
}

declare module "lodash/fp/fill" {
  declare module.exports: any;
}

declare module "lodash/fp/findIndex" {
  declare module.exports: any;
}

declare module "lodash/fp/findIndexFrom" {
  declare module.exports: any;
}

declare module "lodash/fp/findLastIndex" {
  declare module.exports: any;
}

declare module "lodash/fp/findLastIndexFrom" {
  declare module.exports: any;
}

declare module "lodash/fp/first" {
  declare module.exports: any;
}

declare module "lodash/fp/flatten" {
  declare module.exports: any;
}

declare module "lodash/fp/unnest" {
  declare module.exports: any;
}

declare module "lodash/fp/flattenDeep" {
  declare module.exports: any;
}

declare module "lodash/fp/flattenDepth" {
  declare module.exports: any;
}

declare module "lodash/fp/fromPairs" {
  declare module.exports: any;
}

declare module "lodash/fp/head" {
  declare module.exports: any;
}

declare module "lodash/fp/indexOf" {
  declare module.exports: any;
}

declare module "lodash/fp/indexOfFrom" {
  declare module.exports: any;
}

declare module "lodash/fp/initial" {
  declare module.exports: any;
}

declare module "lodash/fp/init" {
  declare module.exports: any;
}

declare module "lodash/fp/intersection" {
  declare module.exports: any;
}

declare module "lodash/fp/intersectionBy" {
  declare module.exports: any;
}

declare module "lodash/fp/intersectionWith" {
  declare module.exports: any;
}

declare module "lodash/fp/join" {
  declare module.exports: any;
}

declare module "lodash/fp/last" {
  declare module.exports: any;
}

declare module "lodash/fp/lastIndexOf" {
  declare module.exports: any;
}

declare module "lodash/fp/lastIndexOfFrom" {
  declare module.exports: any;
}

declare module "lodash/fp/nth" {
  declare module.exports: any;
}

declare module "lodash/fp/pull" {
  declare module.exports: any;
}

declare module "lodash/fp/pullAll" {
  declare module.exports: any;
}

declare module "lodash/fp/pullAllBy" {
  declare module.exports: any;
}

declare module "lodash/fp/pullAllWith" {
  declare module.exports: any;
}

declare module "lodash/fp/pullAt" {
  declare module.exports: any;
}

declare module "lodash/fp/remove" {
  declare module.exports: any;
}

declare module "lodash/fp/reverse" {
  declare module.exports: any;
}

declare module "lodash/fp/slice" {
  declare module.exports: any;
}

declare module "lodash/fp/sortedIndex" {
  declare module.exports: any;
}

declare module "lodash/fp/sortedIndexBy" {
  declare module.exports: any;
}

declare module "lodash/fp/sortedIndexOf" {
  declare module.exports: any;
}

declare module "lodash/fp/sortedLastIndex" {
  declare module.exports: any;
}

declare module "lodash/fp/sortedLastIndexBy" {
  declare module.exports: any;
}

declare module "lodash/fp/sortedLastIndexOf" {
  declare module.exports: any;
}

declare module "lodash/fp/sortedUniq" {
  declare module.exports: any;
}

declare module "lodash/fp/sortedUniqBy" {
  declare module.exports: any;
}

declare module "lodash/fp/tail" {
  declare module.exports: any;
}

declare module "lodash/fp/take" {
  declare module.exports: any;
}

declare module "lodash/fp/takeRight" {
  declare module.exports: any;
}

declare module "lodash/fp/takeLast" {
  declare module.exports: any;
}

declare module "lodash/fp/takeRightWhile" {
  declare module.exports: any;
}

declare module "lodash/fp/takeLastWhile" {
  declare module.exports: any;
}

declare module "lodash/fp/takeWhile" {
  declare module.exports: any;
}

declare module "lodash/fp/union" {
  declare module.exports: any;
}

declare module "lodash/fp/unionBy" {
  declare module.exports: any;
}

declare module "lodash/fp/unionWith" {
  declare module.exports: any;
}

declare module "lodash/fp/uniq" {
  declare module.exports: any;
}

declare module "lodash/fp/uniqBy" {
  declare module.exports: any;
}

declare module "lodash/fp/uniqWith" {
  declare module.exports: any;
}

declare module "lodash/fp/unzip" {
  declare module.exports: any;
}

declare module "lodash/fp/unzipWith" {
  declare module.exports: any;
}

declare module "lodash/fp/without" {
  declare module.exports: any;
}

declare module "lodash/fp/xor" {
  declare module.exports: any;
}

declare module "lodash/fp/symmetricDifference" {
  declare module.exports: any;
}

declare module "lodash/fp/xorBy" {
  declare module.exports: any;
}

declare module "lodash/fp/symmetricDifferenceBy" {
  declare module.exports: any;
}

declare module "lodash/fp/xorWith" {
  declare module.exports: any;
}

declare module "lodash/fp/symmetricDifferenceWith" {
  declare module.exports: any;
}

declare module "lodash/fp/zip" {
  declare module.exports: any;
}

declare module "lodash/fp/zipAll" {
  declare module.exports: any;
}

declare module "lodash/fp/zipObject" {
  declare module.exports: any;
}

declare module "lodash/fp/zipObj" {
  declare module.exports: any;
}

declare module "lodash/fp/zipObjectDeep" {
  declare module.exports: any;
}

declare module "lodash/fp/zipWith" {
  declare module.exports: any;
}

declare module "lodash/fp/countBy" {
  declare module.exports: any;
}

declare module "lodash/fp/each" {
  declare module.exports: any;
}

declare module "lodash/fp/eachRight" {
  declare module.exports: any;
}

declare module "lodash/fp/every" {
  declare module.exports: any;
}

declare module "lodash/fp/all" {
  declare module.exports: any;
}

declare module "lodash/fp/filter" {
  declare module.exports: any;
}

declare module "lodash/fp/find" {
  declare module.exports: any;
}

declare module "lodash/fp/findFrom" {
  declare module.exports: any;
}

declare module "lodash/fp/findLast" {
  declare module.exports: any;
}

declare module "lodash/fp/findLastFrom" {
  declare module.exports: any;
}

declare module "lodash/fp/flatMap" {
  declare module.exports: any;
}

declare module "lodash/fp/flatMapDeep" {
  declare module.exports: any;
}

declare module "lodash/fp/flatMapDepth" {
  declare module.exports: any;
}

declare module "lodash/fp/forEach" {
  declare module.exports: any;
}

declare module "lodash/fp/forEachRight" {
  declare module.exports: any;
}

declare module "lodash/fp/groupBy" {
  declare module.exports: any;
}

declare module "lodash/fp/includes" {
  declare module.exports: any;
}

declare module "lodash/fp/contains" {
  declare module.exports: any;
}

declare module "lodash/fp/includesFrom" {
  declare module.exports: any;
}

declare module "lodash/fp/invokeMap" {
  declare module.exports: any;
}

declare module "lodash/fp/invokeArgsMap" {
  declare module.exports: any;
}

declare module "lodash/fp/keyBy" {
  declare module.exports: any;
}

declare module "lodash/fp/indexBy" {
  declare module.exports: any;
}

declare module "lodash/fp/map" {
  declare module.exports: any;
}

declare module "lodash/fp/pluck" {
  declare module.exports: any;
}

declare module "lodash/fp/orderBy" {
  declare module.exports: any;
}

declare module "lodash/fp/partition" {
  declare module.exports: any;
}

declare module "lodash/fp/reduce" {
  declare module.exports: any;
}

declare module "lodash/fp/reduceRight" {
  declare module.exports: any;
}

declare module "lodash/fp/reject" {
  declare module.exports: any;
}

declare module "lodash/fp/sample" {
  declare module.exports: any;
}

declare module "lodash/fp/sampleSize" {
  declare module.exports: any;
}

declare module "lodash/fp/shuffle" {
  declare module.exports: any;
}

declare module "lodash/fp/size" {
  declare module.exports: any;
}

declare module "lodash/fp/some" {
  declare module.exports: any;
}

declare module "lodash/fp/any" {
  declare module.exports: any;
}

declare module "lodash/fp/sortBy" {
  declare module.exports: any;
}

declare module "lodash/fp/now" {
  declare module.exports: any;
}

declare module "lodash/fp/after" {
  declare module.exports: any;
}

declare module "lodash/fp/ary" {
  declare module.exports: any;
}

declare module "lodash/fp/nAry" {
  declare module.exports: any;
}

declare module "lodash/fp/before" {
  declare module.exports: any;
}

declare module "lodash/fp/bind" {
  declare module.exports: any;
}

declare module "lodash/fp/bindKey" {
  declare module.exports: any;
}

declare module "lodash/fp/curry" {
  declare module.exports: any;
}

declare module "lodash/fp/curryN" {
  declare module.exports: any;
}

declare module "lodash/fp/curryRight" {
  declare module.exports: any;
}

declare module "lodash/fp/curryRightN" {
  declare module.exports: any;
}

declare module "lodash/fp/debounce" {
  declare module.exports: any;
}

declare module "lodash/fp/defer" {
  declare module.exports: any;
}

declare module "lodash/fp/delay" {
  declare module.exports: any;
}

declare module "lodash/fp/flip" {
  declare module.exports: any;
}

declare module "lodash/fp/memoize" {
  declare module.exports: any;
}

declare module "lodash/fp/negate" {
  declare module.exports: any;
}

declare module "lodash/fp/complement" {
  declare module.exports: any;
}

declare module "lodash/fp/once" {
  declare module.exports: any;
}

declare module "lodash/fp/overArgs" {
  declare module.exports: any;
}

declare module "lodash/fp/useWith" {
  declare module.exports: any;
}

declare module "lodash/fp/partial" {
  declare module.exports: any;
}

declare module "lodash/fp/partialRight" {
  declare module.exports: any;
}

declare module "lodash/fp/rearg" {
  declare module.exports: any;
}

declare module "lodash/fp/rest" {
  declare module.exports: any;
}

declare module "lodash/fp/unapply" {
  declare module.exports: any;
}

declare module "lodash/fp/restFrom" {
  declare module.exports: any;
}

declare module "lodash/fp/spread" {
  declare module.exports: any;
}

declare module "lodash/fp/apply" {
  declare module.exports: any;
}

declare module "lodash/fp/spreadFrom" {
  declare module.exports: any;
}

declare module "lodash/fp/throttle" {
  declare module.exports: any;
}

declare module "lodash/fp/unary" {
  declare module.exports: any;
}

declare module "lodash/fp/wrap" {
  declare module.exports: any;
}

declare module "lodash/fp/castArray" {
  declare module.exports: any;
}

declare module "lodash/fp/clone" {
  declare module.exports: any;
}

declare module "lodash/fp/cloneDeep" {
  declare module.exports: any;
}

declare module "lodash/fp/cloneDeepWith" {
  declare module.exports: any;
}

declare module "lodash/fp/cloneWith" {
  declare module.exports: any;
}

declare module "lodash/fp/conformsTo" {
  declare module.exports: any;
}

declare module "lodash/fp/where" {
  declare module.exports: any;
}

declare module "lodash/fp/conforms" {
  declare module.exports: any;
}

declare module "lodash/fp/eq" {
  declare module.exports: any;
}

declare module "lodash/fp/identical" {
  declare module.exports: any;
}

declare module "lodash/fp/gt" {
  declare module.exports: any;
}

declare module "lodash/fp/gte" {
  declare module.exports: any;
}

declare module "lodash/fp/isArguments" {
  declare module.exports: any;
}

declare module "lodash/fp/isArray" {
  declare module.exports: any;
}

declare module "lodash/fp/isArrayBuffer" {
  declare module.exports: any;
}

declare module "lodash/fp/isArrayLike" {
  declare module.exports: any;
}

declare module "lodash/fp/isArrayLikeObject" {
  declare module.exports: any;
}

declare module "lodash/fp/isBoolean" {
  declare module.exports: any;
}

declare module "lodash/fp/isBuffer" {
  declare module.exports: any;
}

declare module "lodash/fp/isDate" {
  declare module.exports: any;
}

declare module "lodash/fp/isElement" {
  declare module.exports: any;
}

declare module "lodash/fp/isEmpty" {
  declare module.exports: any;
}

declare module "lodash/fp/isEqual" {
  declare module.exports: any;
}

declare module "lodash/fp/equals" {
  declare module.exports: any;
}

declare module "lodash/fp/isEqualWith" {
  declare module.exports: any;
}

declare module "lodash/fp/isError" {
  declare module.exports: any;
}

declare module "lodash/fp/isFinite" {
  declare module.exports: any;
}

declare module "lodash/fp/isFunction" {
  declare module.exports: any;
}

declare module "lodash/fp/isInteger" {
  declare module.exports: any;
}

declare module "lodash/fp/isLength" {
  declare module.exports: any;
}

declare module "lodash/fp/isMap" {
  declare module.exports: any;
}

declare module "lodash/fp/isMatch" {
  declare module.exports: any;
}

declare module "lodash/fp/whereEq" {
  declare module.exports: any;
}

declare module "lodash/fp/isMatchWith" {
  declare module.exports: any;
}

declare module "lodash/fp/isNaN" {
  declare module.exports: any;
}

declare module "lodash/fp/isNative" {
  declare module.exports: any;
}

declare module "lodash/fp/isNil" {
  declare module.exports: any;
}

declare module "lodash/fp/isNull" {
  declare module.exports: any;
}

declare module "lodash/fp/isNumber" {
  declare module.exports: any;
}

declare module "lodash/fp/isObject" {
  declare module.exports: any;
}

declare module "lodash/fp/isObjectLike" {
  declare module.exports: any;
}

declare module "lodash/fp/isPlainObject" {
  declare module.exports: any;
}

declare module "lodash/fp/isRegExp" {
  declare module.exports: any;
}

declare module "lodash/fp/isSafeInteger" {
  declare module.exports: any;
}

declare module "lodash/fp/isSet" {
  declare module.exports: any;
}

declare module "lodash/fp/isString" {
  declare module.exports: any;
}

declare module "lodash/fp/isSymbol" {
  declare module.exports: any;
}

declare module "lodash/fp/isTypedArray" {
  declare module.exports: any;
}

declare module "lodash/fp/isUndefined" {
  declare module.exports: any;
}

declare module "lodash/fp/isWeakMap" {
  declare module.exports: any;
}

declare module "lodash/fp/isWeakSet" {
  declare module.exports: any;
}

declare module "lodash/fp/lt" {
  declare module.exports: any;
}

declare module "lodash/fp/lte" {
  declare module.exports: any;
}

declare module "lodash/fp/toArray" {
  declare module.exports: any;
}

declare module "lodash/fp/toFinite" {
  declare module.exports: any;
}

declare module "lodash/fp/toInteger" {
  declare module.exports: any;
}

declare module "lodash/fp/toLength" {
  declare module.exports: any;
}

declare module "lodash/fp/toNumber" {
  declare module.exports: any;
}

declare module "lodash/fp/toPlainObject" {
  declare module.exports: any;
}

declare module "lodash/fp/toSafeInteger" {
  declare module.exports: any;
}

declare module "lodash/fp/toString" {
  declare module.exports: any;
}

declare module "lodash/fp/add" {
  declare module.exports: any;
}

declare module "lodash/fp/ceil" {
  declare module.exports: any;
}

declare module "lodash/fp/divide" {
  declare module.exports: any;
}

declare module "lodash/fp/floor" {
  declare module.exports: any;
}

declare module "lodash/fp/max" {
  declare module.exports: any;
}

declare module "lodash/fp/maxBy" {
  declare module.exports: any;
}

declare module "lodash/fp/mean" {
  declare module.exports: any;
}

declare module "lodash/fp/meanBy" {
  declare module.exports: any;
}

declare module "lodash/fp/min" {
  declare module.exports: any;
}

declare module "lodash/fp/minBy" {
  declare module.exports: any;
}

declare module "lodash/fp/multiply" {
  declare module.exports: any;
}

declare module "lodash/fp/round" {
  declare module.exports: any;
}

declare module "lodash/fp/subtract" {
  declare module.exports: any;
}

declare module "lodash/fp/sum" {
  declare module.exports: any;
}

declare module "lodash/fp/sumBy" {
  declare module.exports: any;
}

declare module "lodash/fp/clamp" {
  declare module.exports: any;
}

declare module "lodash/fp/inRange" {
  declare module.exports: any;
}

declare module "lodash/fp/random" {
  declare module.exports: any;
}

declare module "lodash/fp/assign" {
  declare module.exports: any;
}

declare module "lodash/fp/assignAll" {
  declare module.exports: any;
}

declare module "lodash/fp/assignInAll" {
  declare module.exports: any;
}

declare module "lodash/fp/extendAll" {
  declare module.exports: any;
}

declare module "lodash/fp/assignIn" {
  declare module.exports: any;
}

declare module "lodash/fp/assignInWith" {
  declare module.exports: any;
}

declare module "lodash/fp/assignWith" {
  declare module.exports: any;
}

declare module "lodash/fp/assignInAllWith" {
  declare module.exports: any;
}

declare module "lodash/fp/extendAllWith" {
  declare module.exports: any;
}

declare module "lodash/fp/assignAllWith" {
  declare module.exports: any;
}

declare module "lodash/fp/at" {
  declare module.exports: any;
}

declare module "lodash/fp/props" {
  declare module.exports: any;
}

declare module "lodash/fp/paths" {
  declare module.exports: any;
}

declare module "lodash/fp/create" {
  declare module.exports: any;
}

declare module "lodash/fp/defaults" {
  declare module.exports: any;
}

declare module "lodash/fp/defaultsAll" {
  declare module.exports: any;
}

declare module "lodash/fp/defaultsDeep" {
  declare module.exports: any;
}

declare module "lodash/fp/defaultsDeepAll" {
  declare module.exports: any;
}

declare module "lodash/fp/entries" {
  declare module.exports: any;
}

declare module "lodash/fp/entriesIn" {
  declare module.exports: any;
}

declare module "lodash/fp/extend" {
  declare module.exports: any;
}

declare module "lodash/fp/extendWith" {
  declare module.exports: any;
}

declare module "lodash/fp/findKey" {
  declare module.exports: any;
}

declare module "lodash/fp/findLastKey" {
  declare module.exports: any;
}

declare module "lodash/fp/forIn" {
  declare module.exports: any;
}

declare module "lodash/fp/forInRight" {
  declare module.exports: any;
}

declare module "lodash/fp/forOwn" {
  declare module.exports: any;
}

declare module "lodash/fp/forOwnRight" {
  declare module.exports: any;
}

declare module "lodash/fp/functions" {
  declare module.exports: any;
}

declare module "lodash/fp/functionsIn" {
  declare module.exports: any;
}

declare module "lodash/fp/get" {
  declare module.exports: any;
}

declare module "lodash/fp/prop" {
  declare module.exports: any;
}

declare module "lodash/fp/path" {
  declare module.exports: any;
}

declare module "lodash/fp/getOr" {
  declare module.exports: any;
}

declare module "lodash/fp/propOr" {
  declare module.exports: any;
}

declare module "lodash/fp/pathOr" {
  declare module.exports: any;
}

declare module "lodash/fp/has" {
  declare module.exports: any;
}

declare module "lodash/fp/hasIn" {
  declare module.exports: any;
}

declare module "lodash/fp/invert" {
  declare module.exports: any;
}

declare module "lodash/fp/invertObj" {
  declare module.exports: any;
}

declare module "lodash/fp/invertBy" {
  declare module.exports: any;
}

declare module "lodash/fp/invoke" {
  declare module.exports: any;
}

declare module "lodash/fp/invokeArgs" {
  declare module.exports: any;
}

declare module "lodash/fp/keys" {
  declare module.exports: any;
}

declare module "lodash/fp/keysIn" {
  declare module.exports: any;
}

declare module "lodash/fp/mapKeys" {
  declare module.exports: any;
}

declare module "lodash/fp/mapValues" {
  declare module.exports: any;
}

declare module "lodash/fp/merge" {
  declare module.exports: any;
}

declare module "lodash/fp/mergeAll" {
  declare module.exports: any;
}

declare module "lodash/fp/mergeWith" {
  declare module.exports: any;
}

declare module "lodash/fp/mergeAllWith" {
  declare module.exports: any;
}

declare module "lodash/fp/omit" {
  declare module.exports: any;
}

declare module "lodash/fp/omitAll" {
  declare module.exports: any;
}

declare module "lodash/fp/omitBy" {
  declare module.exports: any;
}

declare module "lodash/fp/pick" {
  declare module.exports: any;
}

declare module "lodash/fp/pickAll" {
  declare module.exports: any;
}

declare module "lodash/fp/pickBy" {
  declare module.exports: any;
}

declare module "lodash/fp/result" {
  declare module.exports: any;
}

declare module "lodash/fp/set" {
  declare module.exports: any;
}

declare module "lodash/fp/assoc" {
  declare module.exports: any;
}

declare module "lodash/fp/assocPath" {
  declare module.exports: any;
}

declare module "lodash/fp/setWith" {
  declare module.exports: any;
}

declare module "lodash/fp/toPairs" {
  declare module.exports: any;
}

declare module "lodash/fp/toPairsIn" {
  declare module.exports: any;
}

declare module "lodash/fp/transform" {
  declare module.exports: any;
}

declare module "lodash/fp/unset" {
  declare module.exports: any;
}

declare module "lodash/fp/dissoc" {
  declare module.exports: any;
}

declare module "lodash/fp/dissocPath" {
  declare module.exports: any;
}

declare module "lodash/fp/update" {
  declare module.exports: any;
}

declare module "lodash/fp/updateWith" {
  declare module.exports: any;
}

declare module "lodash/fp/values" {
  declare module.exports: any;
}

declare module "lodash/fp/valuesIn" {
  declare module.exports: any;
}

declare module "lodash/fp/tap" {
  declare module.exports: any;
}

declare module "lodash/fp/thru" {
  declare module.exports: any;
}

declare module "lodash/fp/camelCase" {
  declare module.exports: any;
}

declare module "lodash/fp/capitalize" {
  declare module.exports: any;
}

declare module "lodash/fp/deburr" {
  declare module.exports: any;
}

declare module "lodash/fp/endsWith" {
  declare module.exports: any;
}

declare module "lodash/fp/escape" {
  declare module.exports: any;
}

declare module "lodash/fp/escapeRegExp" {
  declare module.exports: any;
}

declare module "lodash/fp/kebabCase" {
  declare module.exports: any;
}

declare module "lodash/fp/lowerCase" {
  declare module.exports: any;
}

declare module "lodash/fp/lowerFirst" {
  declare module.exports: any;
}

declare module "lodash/fp/pad" {
  declare module.exports: any;
}

declare module "lodash/fp/padChars" {
  declare module.exports: any;
}

declare module "lodash/fp/padEnd" {
  declare module.exports: any;
}

declare module "lodash/fp/padCharsEnd" {
  declare module.exports: any;
}

declare module "lodash/fp/padStart" {
  declare module.exports: any;
}

declare module "lodash/fp/padCharsStart" {
  declare module.exports: any;
}

declare module "lodash/fp/parseInt" {
  declare module.exports: any;
}

declare module "lodash/fp/repeat" {
  declare module.exports: any;
}

declare module "lodash/fp/replace" {
  declare module.exports: any;
}

declare module "lodash/fp/snakeCase" {
  declare module.exports: any;
}

declare module "lodash/fp/split" {
  declare module.exports: any;
}

declare module "lodash/fp/startCase" {
  declare module.exports: any;
}

declare module "lodash/fp/startsWith" {
  declare module.exports: any;
}

declare module "lodash/fp/template" {
  declare module.exports: any;
}

declare module "lodash/fp/toLower" {
  declare module.exports: any;
}

declare module "lodash/fp/toUpper" {
  declare module.exports: any;
}

declare module "lodash/fp/trim" {
  declare module.exports: any;
}

declare module "lodash/fp/trimChars" {
  declare module.exports: any;
}

declare module "lodash/fp/trimEnd" {
  declare module.exports: any;
}

declare module "lodash/fp/trimCharsEnd" {
  declare module.exports: any;
}

declare module "lodash/fp/trimStart" {
  declare module.exports: any;
}

declare module "lodash/fp/trimCharsStart" {
  declare module.exports: any;
}

declare module "lodash/fp/truncate" {
  declare module.exports: any;
}

declare module "lodash/fp/unescape" {
  declare module.exports: any;
}

declare module "lodash/fp/upperCase" {
  declare module.exports: any;
}

declare module "lodash/fp/upperFirst" {
  declare module.exports: any;
}

declare module "lodash/fp/words" {
  declare module.exports: any;
}

declare module "lodash/fp/attempt" {
  declare module.exports: any;
}

declare module "lodash/fp/bindAll" {
  declare module.exports: any;
}

declare module "lodash/fp/cond" {
  declare module.exports: any;
}

declare module "lodash/fp/constant" {
  declare module.exports: any;
}

declare module "lodash/fp/always" {
  declare module.exports: any;
}

declare module "lodash/fp/defaultTo" {
  declare module.exports: any;
}

declare module "lodash/fp/flow" {
  declare module.exports: any;
}

declare module "lodash/fp/pipe" {
  declare module.exports: any;
}

declare module "lodash/fp/flowRight" {
  declare module.exports: any;
}

declare module "lodash/fp/compose" {
  declare module.exports: any;
}

declare module "lodash/fp/identity" {
  declare module.exports: any;
}

declare module "lodash/fp/iteratee" {
  declare module.exports: any;
}

declare module "lodash/fp/matches" {
  declare module.exports: any;
}

declare module "lodash/fp/matchesProperty" {
  declare module.exports: any;
}

declare module "lodash/fp/propEq" {
  declare module.exports: any;
}

declare module "lodash/fp/pathEq" {
  declare module.exports: any;
}

declare module "lodash/fp/method" {
  declare module.exports: any;
}

declare module "lodash/fp/methodOf" {
  declare module.exports: any;
}

declare module "lodash/fp/mixin" {
  declare module.exports: any;
}

declare module "lodash/fp/noConflict" {
  declare module.exports: any;
}

declare module "lodash/fp/noop" {
  declare module.exports: any;
}

declare module "lodash/fp/nthArg" {
  declare module.exports: any;
}

declare module "lodash/fp/over" {
  declare module.exports: any;
}

declare module "lodash/fp/juxt" {
  declare module.exports: any;
}

declare module "lodash/fp/overEvery" {
  declare module.exports: any;
}

declare module "lodash/fp/allPass" {
  declare module.exports: any;
}

declare module "lodash/fp/overSome" {
  declare module.exports: any;
}

declare module "lodash/fp/anyPass" {
  declare module.exports: any;
}

declare module "lodash/fp/property" {
  declare module.exports: any;
}

declare module "lodash/fp/propertyOf" {
  declare module.exports: any;
}

declare module "lodash/fp/range" {
  declare module.exports: any;
}

declare module "lodash/fp/rangeStep" {
  declare module.exports: any;
}

declare module "lodash/fp/rangeRight" {
  declare module.exports: any;
}

declare module "lodash/fp/rangeStepRight" {
  declare module.exports: any;
}

declare module "lodash/fp/runInContext" {
  declare module.exports: any;
}

declare module "lodash/fp/stubArray" {
  declare module.exports: any;
}

declare module "lodash/fp/stubFalse" {
  declare module.exports: any;
}

declare module "lodash/fp/F" {
  declare module.exports: any;
}

declare module "lodash/fp/stubObject" {
  declare module.exports: any;
}

declare module "lodash/fp/stubString" {
  declare module.exports: any;
}

declare module "lodash/fp/stubTrue" {
  declare module.exports: any;
}

declare module "lodash/fp/T" {
  declare module.exports: any;
}

declare module "lodash/fp/times" {
  declare module.exports: any;
}

declare module "lodash/fp/toPath" {
  declare module.exports: any;
}

declare module "lodash/fp/uniqueId" {
  declare module.exports: any;
}
