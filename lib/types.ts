export type ServiceFactory<S, D extends object> = (deps: D) => S;

export type ServiceFactoryWithDefault<S, D extends object> = {
  (deps: D): S;
  withDefaultDeps: () => S;
};
