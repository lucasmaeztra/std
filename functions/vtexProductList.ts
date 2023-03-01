import type { LoaderFunction } from "$live/types.ts";
import type { LiveState } from "$live/types.ts";

import { toProduct } from "../commerce/vtex/transform.ts";
import { ConfigVTEX, createClient } from "../commerce/vtex/client.ts";
import type { Product } from "../commerce/types.ts";
import type { Sort } from "../commerce/vtex/types.ts";

export interface Props {
  /** @description query to use on search */
  query: string;
  /** @description total number of items to display */
  count: number;
  //* @enumNames ["relevance", "greater discount", "arrivals", "name asc", "name desc", "most ordered", "price asc", "price desc"]
  /**
   * @description search sort parameter
   */
  sort?:
    | ""
    | "price:desc"
    | "price:asc"
    | "orders:desc"
    | "name:desc"
    | "name:asc"
    | "release:desc"
    | "discount:desc";
}

/**
 * @title Product list loader
 * @description Usefull for shelves and static galleries.
 */
const productListLoader: LoaderFunction<
  Props,
  Product[],
  LiveState<{ configvtex: ConfigVTEX | undefined }>
> = async (
  req,
  ctx,
  props,
) => {
  const { configvtex } = ctx.state.global;
  const vtex = createClient(configvtex);
  const url = new URL(req.url);

  const count = props.count ?? 12;
  const query = props.query || "";
  const sort: Sort = props.sort || "";

  // search products on VTEX. Feel free to change any of these parameters
  const { products: vtexProducts } = await vtex.search.products({
    query,
    page: 0,
    count,
    sort,
  });

  // Transform VTEX product format into schema.org's compatible format
  // If a property is missing from the final `products` array you can add
  // it in here
  const products = vtexProducts.map((p) =>
    toProduct(p, p.items[0], 0, { url, priceCurrency: vtex.currency() })
  );

  return {
    data: products,
  };
};

export default productListLoader;