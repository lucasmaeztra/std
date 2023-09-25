import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import type { OrderForm } from "deco-sites/std/packs/vtex/types.ts";
import { transform } from "deco-sites/std/packs/vtex/utils/future.ts";
import { parseCookie } from "deco-sites/std/packs/vtex/utils/orderFormFromApps.ts";
import { AppContext } from "$apps/vtex/mod.ts";
import { proxySetCookie } from "$apps/vtex/utils/cookies.ts";

interface Item {
  quantity: number;
  seller: string;
  id: string;
  index?: number;
  price?: number;
}

interface Props {
  orderItems: Item[];
  allowedOutdatedData?: Array<"paymentData">;
}

/**
 * @docs https://developers.vtex.com/docs/api-reference/checkout-api#post-/api/checkout/pub/orderForm/-orderFormId-/items
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
  const { vcs } = ctx;
  const {
    orderItems,
    allowedOutdatedData = ["paymentData"],
  } = props;
  const { orderFormId, cookie } = parseCookie(req.headers);

  try {
    const response = await vcs
      ["POST /api/checkout/pub/orderForm/:orderFormId/items"]({
        orderFormId,
        allowedOutdatedData,
      }, {
        body: { orderItems },
        headers: {
          "content-type": "application/json",
          accept: "application/json",
          cookie,
        },
      });

    proxySetCookie(response.headers, ctx.response.headers, req.url);

    return response.json();
  } catch (error) {
    console.error(error);

    throw error;
  }
};

export default action;
