export type SignalValue<T> = {
  value: T;
};

export type Signal<T> = SignalValue<T> & {
  peek(): T;
};

export type SignalValueReadonly<T> = {
  readonly value: T;
};

export type SignalReadonly<T> = SignalValueReadonly<T> & {
  peek(): T;
};

export type Unsubscribe = () => void;

export type Callback<T = void> = () => T;

export type SetCb = Set<Callback>;
