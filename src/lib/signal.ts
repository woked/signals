import {
  SignalValue,
  SignalValueReadonly,
  Signal,
  Unsubscribe,
  Callback,
  SetCb
} from "./interfaces";

class EffectState {
  currentEffect: Callback | null = null;
  subs = new Map<Callback, Set<SetCb>>();

  setCurrentEffect(cb: Callback | null) {
    this.currentEffect = cb;
  }
}

class BatchState {
  currentEffect: Callback | null = null;

  setCurrentEffect(cb: Callback | null) {
    this.currentEffect = cb;
  }
}

const effectState = new EffectState();
const batchState = new BatchState();

export class Execute {
  cbs = new Set<Callback>();

  add(cb: Callback) {
    this.cbs.add(cb);
  }

  start() {
    if (!batchState.currentEffect) {
      this.cbs.forEach((cb) => cb());
      this.cbs.clear();
    }
  }
}

const execute = new Execute();

export const batch = (cb: Callback): void => {
  const prev = batchState.currentEffect;
  batchState.setCurrentEffect(cb);

  cb();

  batchState.setCurrentEffect(prev);

  if (!batchState.currentEffect) {
    execute.start();
  }
};

export const signal = <T>(initialValue: T): Signal<T> => {
  const value: SignalValue<T> = { value: initialValue };

  const subscribes = new Set<Callback>();

  return {
    get value(): T {
      if (effectState.currentEffect) {
        effectState.subs.get(effectState.currentEffect)?.add(subscribes);
        subscribes.add(effectState.currentEffect);
      }

      return value.value;
    },
    set value(newValue: T) {
      value.value = newValue;

      subscribes.forEach((sub) => execute.add(sub));
      execute.start();
    },
    peek(): T {
      return value.value;
    }
  };
};

export const computed = <T>(cb: Callback<T>): SignalValueReadonly<T> => {
  let calculated = false;
  let cachedValue: SignalValue<T> | null = null;
  const subscribes = new Set<Callback>();

  const init = (): SignalValue<T> => {
    if (cachedValue) return cachedValue;

    const prevEffect = effectState.currentEffect;

    const recalculate = () => {
      calculated = false;

      subscribes.forEach((sub) => sub());
    };

    effectState.setCurrentEffect(recalculate);

    if (!effectState.subs.has(recalculate)) {
      effectState.subs.set(recalculate, new Set());
    }

    cachedValue = { value: cb() };

    calculated = true;

    effectState.setCurrentEffect(prevEffect);

    return cachedValue;
  };

  return {
    get value() {
      const _value = init();
      const effect = effectState.currentEffect;

      if (effect) {
        effectState.subs.get(effect)?.add(subscribes);
        subscribes.add(effect);
      }

      if (!calculated) {
        _value.value = cb();
        calculated = true;
      }

      return _value.value;
    }
  };
};

export const effect = (cb: Callback): Unsubscribe => {
  const callback = () => {
    const prevEffect = effectState.currentEffect;
    effectState.setCurrentEffect(cb);

    cb();

    effectState.setCurrentEffect(prevEffect);
  };

  const prevEffect = effectState.currentEffect;
  effectState.setCurrentEffect(cb);

  if (!effectState.subs.has(callback)) {
    effectState.subs.set(callback, new Set());
  }

  cb();

  effectState.setCurrentEffect(prevEffect);

  return () => {
    effectState.subs.get(callback)?.forEach((item) => {
      item.delete(callback);
    });
  };
};

// const count = signal(1);
// const count2 = signal(1);

// effect(() => {
//   count.value;
//   count2.value;

//   console.log("effect");
// });
// count.value = 5;
// count2.value = 5;

// const count = signal(1);
// const count2 = signal(1);

// const double = computed(() => {
//   return count.value * 2 + count2.value;
// });

// effect(() => {
//   console.log("effect");
//   console.log("effect double: ", double.value);
// });

// batch(() => {
//   count.value = 10;
//   count.value = 15;
//   count.value = 20;
// });

// const count = signal(1);
// const count2 = signal(10);

// const summary = computed(() => count.value + count2.value);

// effect(() => {
//   console.log("effect");
//   console.log("count", count.value);
//   count2.value;
// });

// batch(() => {
//   count.value = 5;
//   count.value = 10;
//   count.value = 7;
// });
