import React, {
  FC,
  ReactNode,
  ReactElement,
  useCallback,
  useState
} from "react";
import { effect } from "./signal";

const useForceUpdate = () => {
  const [, setState] = useState(0);

  return useCallback(() => setState((prev) => prev + 1), []);
};

export const observer = (Component: FC) => {
  let component: ReactElement;
  let isMount = false;

  const Comp = React.memo((...args) => {
    const forceUpdate = useForceUpdate();

    if (!isMount) {
      effect(() => {
        if (isMount) {
          forceUpdate();
        }

        component = Component(...args);
      });
    }

    isMount = true;
    return component;
  });

  return Comp;
};
