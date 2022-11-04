import { signal, effect, computed, batch } from "../signal";

describe("signal", () => {
  test("should change value", () => {
    const count = signal(1);

    expect(count.value).toBe(1);
    count.value = 5;
    expect(count.value).toBe(5);
  });

  test("should read value without call effect", () => {
    const count = signal(1);
    const delta = signal(1);

    const fn = jest.fn(() => {
      count.value = count.peek() + delta.value;
    });

    effect(fn);

    expect(fn).toBeCalledTimes(1);
    count.value = 5;
    expect(fn).toBeCalledTimes(1);
  });

  test("effect", () => {
    const count = signal(1);
    const fn = jest.fn();

    effect(() => {
      fn(count.value);
    });

    expect(fn).toBeCalledTimes(1);
    count.value = 5;
    expect(fn).toBeCalledWith(5);
    expect(fn).toBeCalledTimes(2);
    count.value = 10;
    expect(fn).toBeCalledWith(10);
    expect(fn).toBeCalledTimes(3);
  });

  test("should unsub effect", () => {
    const count = signal(1);
    const fn = jest.fn();

    const unsub = effect(() => {
      fn(count.value);
    });

    expect(fn).toBeCalledTimes(1);
    count.value = 5;
    expect(fn).toBeCalledTimes(2);
    unsub();
    count.value = 10;
    expect(fn).toBeCalledTimes(2);
  });

  test("computed", () => {
    const count = signal(1);
    const fn = jest.fn();

    const double = computed(() => count.value * 2);

    effect(() => {
      fn(double.value);
    });

    expect(double.value).toBe(2);
    expect(fn).toBeCalledTimes(1);
    count.value = 5;
    expect(double.value).toBe(10);
    expect(fn).toBeCalledTimes(2);
  });

  test("computed - calculated once", () => {
    const count = signal(1);
    const fn = jest.fn(() => count.value * 2);

    const double = computed(fn);
    double.value;
    double.value;
    double.value;
    expect(fn).toBeCalledTimes(1);
    count.value = 5;
    double.value;
    double.value;
    double.value;
    double.value;
    expect(fn).toBeCalledTimes(2);
  });

  test("lazy init computed", () => {
    const count = signal(1);
    const fn = jest.fn(() => count.value * 2);

    const double = computed(fn);
    expect(fn).toBeCalledTimes(0);
    count.value = 2;
    expect(fn).toBeCalledTimes(0);
    count.value = 3;
    expect(fn).toBeCalledTimes(0);
    double.value;
    expect(fn).toBeCalledTimes(1);
  });

  test("lazy recalculate computed", () => {
    const count = signal(1);
    const fn = jest.fn(() => count.value * 2);

    const double = computed(fn);
    expect(fn).toBeCalledTimes(0);
    count.value = 2;
    expect(fn).toBeCalledTimes(0);
    count.value = 3;
    expect(fn).toBeCalledTimes(0);
    double.value;
    expect(fn).toBeCalledTimes(1);
  });

  test("effect batch", () => {
    const count = signal(1);
    const count2 = signal(1);
    const fn = jest.fn();

    effect(() => {
      count.value;
      count2.value;
      fn();
    });
    expect(fn).toBeCalledTimes(1);
    batch(() => {
      count.value = 5;
      count2.value = 5;
    });
    expect(fn).toBeCalledTimes(2);

    batch(() => {
      count.value = 5;
      count2.value = 5;
      batch(() => {
        count.value = 10;
        count2.value = 10;
      });
    });

    expect(fn).toBeCalledTimes(3);
  });

  it("effect dc", () => {
    const count = signal(1);
    const count2 = signal(1);
    const count3 = signal(1);
    const fn = jest.fn(() => {
      if (count.value === 2) {
        count2.value;
      } else {
        count3.value;
      }
    });

    effect(fn);
    expect(fn).toBeCalledTimes(1);
    count.value = 3;
    expect(fn).toBeCalledTimes(2);
    count3.value = 5;
    expect(fn).toBeCalledTimes(3);
    count2.value = 10;
    expect(fn).toBeCalledTimes(3);
    count.value = 2;
    expect(fn).toBeCalledTimes(4);
    count2.value = 5;
    expect(fn).toBeCalledTimes(5);
  });

  it("should return value", () => {
    const v = [1, 2];
    const s = signal(v);
    expect(s.value).toEqual(v);
  });

  it("should notify other listeners of changes after one listener is disposed", () => {
    const s = signal(0);
    const spy1 = jest.fn(() => s.value);
    const spy2 = jest.fn(() => s.value);
    const spy3 = jest.fn(() => s.value);

    effect(spy1);
    const dispose = effect(spy2);
    effect(spy3);

    expect(spy1).toBeCalledTimes(1);
    expect(spy2).toBeCalledTimes(1);
    expect(spy3).toBeCalledTimes(1);

    dispose();

    s.value = 1;
    expect(spy1).toBeCalledTimes(2);
    expect(spy2).toBeCalledTimes(1);
    expect(spy3).toBeCalledTimes(2);
  });
});
