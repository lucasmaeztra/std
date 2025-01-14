import { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import { OrderForm } from "deco-sites/std/packs/vtex/types.ts";
import { transform } from "deco-sites/std/packs/vtex/utils/future.ts";
import { parseCookie } from "deco-sites/std/packs/vtex/utils/orderFormFromApps.ts";
import { AppContext } from "$apps/vtex/mod.ts";
import { proxySetCookie } from "$apps/vtex/utils/cookies.ts";

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
  const { vcs } = ctx;
  const { cookie } = parseCookie(req.headers);

  const response = await vcs["POST /api/checkout/pub/orderForm"]({}, {
    headers: { cookie },
  });

  proxySetCookie(response.headers, ctx.response.headers, req.url);

  return response.json();
};

export default loader;
