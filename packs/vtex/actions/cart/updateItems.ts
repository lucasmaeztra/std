import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import type { OrderForm } from "deco-sites/std/packs/vtex/types.ts";
import { transform } from "deco-sites/std/packs/vtex/utils/future.ts";
import { parseCookie } from "deco-sites/std/packs/vtex/utils/orderFormFromApps.ts";
import { fetchSafe } from "$apps/utils/fetch.ts";
import { AppContext } from "$apps/vtex/mod.ts";
import { proxySetCookie } from "$apps/vtex/utils/cookies.ts";
import { paths } from "$apps/vtex/utils/paths.ts";

// import base, {
//   Props,
// } from "https://denopkg.com/deco-cx/apps@0.2.8/vtex/actions/cart/updateItems.ts";

interface Item {
  quantity: number;
  index: number;
}

interface Props {
  orderItems: Item[];
  allowedOutdatedData?: Array<"paymentData">;
}

/**
 * @docs https://developers.vtex.com/docs/api-reference/checkout-api#post-/api/checkout/pub/orderForm/-orderFormId-/items/update
 */
const action = (
  props: Props,
  req: Request,
  ctx: Context,
): Promise<OrderForm> => base(props, req, transform(ctx));

const base = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<OrderForm> => {
  const {
    orderItems,
    allowedOutdatedData = ["paymentData"],
  } = props;
  const { orderFormId, cookie } = parseCookie(req.headers);
  const url = new URL(
    paths(ctx).api.checkout.pub.orderForm
      .orderFormId(orderFormId)
      .items.update,
  );

  if (allowedOutdatedData) {
    for (const it of allowedOutdatedData) {
      url.searchParams.append("allowedOutdatedData", it);
    }
  }

  const response = await fetchSafe(
    url,
    {
      method: "POST",
      body: JSON.stringify({ orderItems }),
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        cookie,
      },
    },
  );

  proxySetCookie(response.headers, ctx.response.headers, req.url);

  return response.json();
};

export default action;
