import qrcode from "qrcode";
import invariant from "tiny-invariant";
import db from "../db.server";
import axios from "axios";
import { getCoordinateList } from "./coordinate.server";

export async function getQRCode(id, graphql) {
  const qrCode = await db.qRCode.findFirst({ where: { id } });

  if (!qrCode) {
    return null;
  }

  return supplementQRCode(qrCode, graphql);
}

export async function getQRCodes(shop, graphql) {
  const qrCodes = await db.qRCode.findMany({
    where: { shop },
    orderBy: { id: "desc" },
  });

  if (qrCodes.length === 0) return [];

  return Promise.all(
    qrCodes.map((qrCode) => supplementQRCode(qrCode, graphql))
  );
}

export function getQRCodeImage(id) {
  const url = new URL(`/qrcodes/${id}/scan`, process.env.SHOPIFY_APP_URL);
  return qrcode.toDataURL(url.href);
}

export function getDestinationUrl(qrCode) {
  if (qrCode.destination === "product") {
    return `https://${qrCode.shop}/products/${qrCode.productHandle}`;
  }

  const match = /gid:\/\/shopify\/ProductVariant\/([0-9]+)/.exec(qrCode.productVariantId);
  invariant(match, "Unrecognized product variant ID");

  return `https://${qrCode.shop}/cart/${match[1]}:1`;
}

async function supplementQRCode(qrCode, graphql) {
  // コーディネート一覧の取得
  const coordinateList = await getCoordinateList()

  const qrCodeImagePromise = getQRCodeImage(qrCode.id);

  const response = await graphql(
    `
      query supplementQRCode($id: ID!) {
        product(id: $id) {
          title
          images(first: 1) {
            nodes {
              altText
              url
            }
          }
        }
      }
    `,
    {
      variables: {
        id: qrCode.productId,
      },
    }
  );

  const {
    data: { product },
  } = await response.json();

  // 外部APIコールの実験
  const externalApiResponse = await getExternalData()
  const externalApiResponseAsStr = JSON.stringify(externalApiResponse)
  console.log('externalApiResponseAsStr=', externalApiResponseAsStr)

  return {
    ...qrCode,
    productDeleted: !product?.title,
    productTitle: product?.title,
    productImage: product?.images?.nodes[0]?.url,
    productAlt: product?.images?.nodes[0]?.altText,
    destinationUrl: getDestinationUrl(qrCode),
    image: await qrCodeImagePromise,
    externalApiResponseAsStr: externalApiResponseAsStr,
    // コーディネート一覧を、JSON文字列でViewに渡す
    coordinateListResponseAsStr: JSON.stringify(coordinateList, null, "\t"),
  };
}

export function validateQRCode(data) {
  const errors = {};

  if (!data.title) {
    errors.title = "Title is required";
  }

  if (!data.productId) {
    errors.productId = "Product is required";
  }

  if (!data.destination) {
    errors.destination = "Destination is required";
  }

  if (Object.keys(errors).length) {
    return errors;
  }
}

/**
 * 外部APIコールの実験
 *
 * @returns
 */
async function getExternalData() {
  const storeCmsApiToken = process.env.STORE_CMS_API_TOKEN

  // console.log("-> getExternalData", { storeCmsApiToken })
  const response = await axios.get("https://httpbin.org/get", {
    params: {
      key: "value",
      storeCmsApiTokenFromEnv: storeCmsApiToken,
    }
  });
  // console.log("-> response.data=", response.data)
  return response.data;
}
