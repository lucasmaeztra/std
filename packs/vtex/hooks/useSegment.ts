import { state as storeState } from "./context.ts";

const { segment, loading } = storeState;

const state = {
  loading,
  segment,
};

export const useSegment = () => state;
