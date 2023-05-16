export type State = Record<string, any>;
export type Handler = (state: State, transient?: any) => void;
export type Events = Record<string, Handler[]>;

const fire = (
  evs: string[],
  events: Events,
  state: any,
  transient?: any
): any[] => {
  return [...new Set(evs)]
    .reduce((fns: Handler[], ev) => [...fns, ...(events[ev] || [])], [])
    .map((fn) => fn(state, transient));
};

const evx = create();

export const on = evx.on;
export const emit = evx.emit;
export const hydrate = evx.hydrate;
export const getState = evx.getState;

export function create(initialState = {}) {
  let events: Events = {};
  let state: State = { ...initialState };

  return {
    getState: () => ({ ...state }),
    hydrate(s: State) {
      state = { ...state, ...s };

      return () => {
        fire(["*", ...Object.keys(s)], events, state);
      };
    },
    on(e: string | string[], fn: Handler) {
      events = {
        ...events,
        ...(Array.isArray(e) ? e : [e]).reduce(
          (acc, ev) => ({
            ...acc,
            [ev]: [...(events[ev] || []), fn],
          }),
          {}
        ),
      };

      return () => {
        events = Object.keys(events).reduce(
          (acc, ev) =>
            events[ev]
              ? {
                  ...acc,
                  [ev]: events[ev].filter((f) => f !== fn),
                }
              : acc,
          {}
        );
      };
    },
    emit: (
      e: string | string[],
      data?: State | ((state: State) => State),
      transient?: any
    ) => {
      const newState = typeof data === "function" ? data(state) : data;

      if (newState) state = { ...state, ...newState };

      fire(
        [
          ...(e === "*" ? [] : ["*"]),
          ...(Array.isArray(e) ? e : [e]),
          ...(newState ? Object.keys(newState) : []),
        ],
        events,
        state,
        transient
      );
    },
  };
}
