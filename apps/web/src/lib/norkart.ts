/** Norkart WAAPI – delt av kartkomponentene på siden. */
export const NORKART_KEY =
  process.env.NEXT_PUBLIC_NORKART_API_KEY ?? "b8e36d51-119a-423b-b156-d744d54123d5";

export const NORKART_TILE_URL = `https://waapi.webatlas.no/maptiles/tiles/webatlas-orto-newup/wa_grid/{z}/{x}/{y}.jpeg?api_key=${NORKART_KEY}`;

export const NORKART_ATTRIBUTION = "Flyfoto: © Norkart";

export const NORKART_MAX_ZOOM = 21;
