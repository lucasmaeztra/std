import { signal } from "@preact/signals";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { WishlistItem } from "deco-sites/std/packs/vtex/types.ts";
import { Runtime } from "deco-sites/std/runtime.ts";
import type { OrderForm } from "deco-sites/std/packs/vtex/types.ts";
import type { User } from "deco-sites/std/packs/vtex/loaders/user.ts";
import type { Segment } from "deco-sites/std/packs/vtex/loaders/segment.ts";

interface Context {
  cart: OrderForm | null;
  user: User | null;
  wishlist: WishlistItem[] | null;
  segment: Segment | null;
}

const loading = signal<boolean>(true);
const context = {
  cart: signal<OrderForm | null>(null),
  user: signal<User | null>(null),
  wishlist: signal<WishlistItem[] | null>(null),
  segment: signal<Segment | null>(null),
};

let queue = Promise.resolve();
let abort = () => {};
const enqueue = (
  cb: (signal: AbortSignal) => Promise<Partial<Context>> | Partial<Context>,
) => {
  abort();

  loading.value = true;
  const controller = new AbortController();

  queue = queue.then(async () => {
    try {
      const { cart, user, wishlist, segment } = await cb(controller.signal);

      if (controller.signal.aborted) {
        throw { name: "AbortError" };
      }

      context.cart.value = cart || context.cart.value;
      context.user.value = user || context.user.value;
      context.segment.value = segment || context.segment.value;
      context.wishlist.value = wishlist || context.wishlist.value;
      loading.value = false;
    } catch (error) {
      if (error.name === "AbortError") return;

      console.error(error);
      loading.value = false;
    }
  });

  abort = () => controller.abort();

  return queue;
};

const load = (signal: AbortSignal) =>
  Runtime.invoke({
    cart: {
      key: "deco-sites/std/loaders/vtex/cart.ts",
    },
    user: {
      key: "deco-sites/std/loaders/vtex/user.ts",
    },
    wishlist: {
      key: "deco-sites/std/loaders/vtex/wishlist.ts",
    },
    segment: {
      key: "deco-sites/std/loaders/vtex/segment.ts",
    },
  }, { signal });

if (IS_BROWSER) {
  enqueue(load);

  document.addEventListener(
    "visibilitychange",
    () => document.visibilityState === "visible" && enqueue(load),
  );
}

export const state = {
  ...context,
  loading,
  enqueue,
};
