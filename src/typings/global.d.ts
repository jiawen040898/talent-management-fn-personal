// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SafeAny = any;

type IndexableObject = Record<string, SafeAny>;

type NullableProps<T> = {
    [P in keyof T]: T[P] | null | undefined;
};

type NonNullableProps<T> = {
    [P in keyof T]-?: Exclude<T[P], null | undefined>;
};

type Unpacked<T> = T extends (infer U)[]
    ? U
    : T extends (...args: unknown[]) => infer U
      ? U
      : T extends Promise<infer U>
        ? U
        : T;
