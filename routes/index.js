const express = require("express");
const router = express.Router();
const axios = require("axios");
const { HmacSHA256 } = require("crypto-js");
const Base64 = require("crypto-js/enc-base64");
require("dotenv").config();
const {
  LINEPAY_CHANNEL_ID,
  LINEPAY_CHANNEL_SECRET_KEY,
  LINEPAY_VERSION,
  LINEPAY_SITE,
  LINEPAY_RETURN_HOST,
  LINEPAY_RETURN_CONFIRM_URL,
  LINEPAY_RETURN_CANCEL_URL,
} = process.env;
const sampleData = require("../sample/sampleData");

const orders = {};

//前端頁面
router.get("/", (req, res) => {
  res.render("orders", { orders: sampleData });
});

router.get("/checkout/:id", (req, res) => {
  const { id } = req.params;
  const order = sampleData[id];
  order.orderId = parseInt(new Date().getTime() / 1000); //製作訂單編號並新增一個orderId到sampleData裡面
  orders[order.orderId] = order; //把這個放到全域變數orders裡面
  //   console.log(order);
  res.render("checkout", { order });
});

//跟LINE PAY 串接的API
router.post("/createOrder/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const order = orders[orderId];
  //   console.log("creat order", order);
  //製作line官方要求的Request Body
  try {
    const linePayBody = {
      ...order,
      redirectUrls: {
        confirmUrl: `${LINEPAY_RETURN_HOST}${LINEPAY_RETURN_CONFIRM_URL}`,
        cancelUrl: `${LINEPAY_RETURN_HOST}${LINEPAY_RETURN_CANCEL_URL}`,
      },
    };
    const uri = "/payments/request"; //API Spec
    const headers = createSignature(uri, linePayBody);
    //準備送給linePay的資訊
    // console.log(linePayBody, signature);
    const url = `${LINEPAY_SITE}/${LINEPAY_VERSION}${uri}`;

    const linePayRes = await axios.post(url, linePayBody, { headers });
    if (linePayRes?.data?.returnCode === "0000") {
      res.redirect(linePayRes?.data?.info.paymentUrl.web);
    }
    // console.log(linePayRes);
  } catch (e) {
    console.log(e);
    res.end();
  }
});

router.get("/linePay/confirm", async (req, res) => {
  const { transactionId, orderId } = req.query;
  console.log(transactionId, orderId);
  try {
    const order = orders[orderId];
    const linePayBody = {
      amount: order.amount,
      currency: "TWD",
    };
    const uri = `/payments/${transactionId}/confirm`;

    const headers = createSignature(uri, linePayBody);

    const url = `${LINEPAY_SITE}/${LINEPAY_VERSION}${uri}`;
    const linePayRes = await axios.post(url, linePayBody, { headers });
    console.log(linePayRes);
    res.end();
  } catch (e) {
    res.end();
  }
});

function createSignature(uri, linePayBody) {
  const nonce = parseInt(new Date().getTime() / 1000); //UUID or timestamp(時間戳)
  const string = `${LINEPAY_CHANNEL_SECRET_KEY}/${LINEPAY_VERSION}${uri}${JSON.stringify(
    linePayBody
  )}${nonce}`;
  const signature = Base64.stringify(
    HmacSHA256(string, LINEPAY_CHANNEL_SECRET_KEY)
  ); //加密Signature = Base64(HMAC-SHA256(Your ChannelSecret, (Your ChannelSecret + URI + RequestBody + nonce)))
  const headers = {
    "Content-Type": "application/json",
    "X-LINE-ChannelId": LINEPAY_CHANNEL_ID,
    "X-LINE-Authorization-Nonce": nonce,
    "X-LINE-Authorization": signature,
  };
  return headers;
}
module.exports = router;
