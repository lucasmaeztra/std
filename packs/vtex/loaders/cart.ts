import { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import { OrderForm } from "deco-sites/std/packs/vtex/types.ts";
import { transform } from "deco-sites/std/packs/vtex/utils/future.ts";
import { parseCookie } from "deco-sites/std/packs/vtex/utils/orderFormFromApps.ts";
import { fetchSafe } from "$apps/utils/fetch.ts";
import { AppContext } from "$apps/vtex/mod.ts";
import { proxySetCookie } from "$apps/vtex/utils/cookies.ts";
import { paths } from "$apps/vtex/utils/paths.ts";

// import type { OrderForm } from "$apps/utils/types.ts";
// import base from "https://denopkg.com/deco-cx/apps@0.2.8/vtex/loaders/cart.ts";

/**
 * @docs https://developers.vtex.com/docs/api-reference/checkout-api#get-/api/checkout/pub/orderForm
 */
const loader = (
  props: unknown,
  req: Request,
  ctx: Context,
): Promise<OrderForm> => base(props, req, transform(ctx));

const base = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<OrderForm> => {
  const { cookie } = parseCookie(req.headers);

  const response = await fetchSafe(
    `${paths(ctx).api.checkout.pub.orderForm}`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
        cookie,
      },
    },
  );

  proxySetCookie(response.headers, ctx.response.headers, req.url);

  return response.json();
};

export default loader;
