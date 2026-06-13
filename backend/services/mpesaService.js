import axios from "axios";

// 🧪 SANDBOX MODE
const baseUrl = "https://sandbox.safaricom.co.ke";

export function normalizePhone(phone) {
  const cleaned = String(phone).replace(/\D/g, "");
  if (cleaned.startsWith("254")) return cleaned;
  if (cleaned.startsWith("0")) return "254" + cleaned.slice(1);
  if (cleaned.startsWith("7") || cleaned.startsWith("1")) return "254" + cleaned;
  return cleaned;
}

export async function getAccessToken() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  if (!consumerKey || !consumerSecret) {
    throw new Error("MPESA_CONSUMER_KEY / MPESA_CONSUMER_SECRET not set in backend/.env");
  }
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  const { data } = await axios.get(
    `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${auth}` }, timeout: 15000 }
  );
  return data.access_token;
}

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return (
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

export async function sendStkPush({ phone, amount, bookingId, accountReference, transactionDesc }) {
  // 🔒 HARDCODED SANDBOX VALUES (PayBill 174379)
  const shortcode = "174379";
  const passkey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
  const transactionType = "CustomerPayBillOnline";

  const callbackUrl = process.env.MPESA_CALLBACK_URL;
  if (!callbackUrl) throw new Error("MPESA_CALLBACK_URL not set in backend/.env");

  const token = await getAccessToken();
  const ts = timestamp();
  const password = Buffer.from(`${shortcode}${passkey}${ts}`).toString("base64");
  const msisdn = normalizePhone(phone);

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: ts,
    TransactionType: transactionType,
    Amount: Math.round(Number(amount)),
    PartyA: msisdn,
    PartyB: shortcode,
    PhoneNumber: msisdn,
    CallBackURL: callbackUrl,
    AccountReference: accountReference || `PB-${bookingId || Date.now()}`,
    TransactionDesc: transactionDesc || "PocketBite booking deposit",
  };

  console.log("🔍 Sending STK Push (SANDBOX):", {
    shortcode,
    transactionType,
    amount: payload.Amount,
    phone: msisdn,
    callback: callbackUrl,
  });

  const { data } = await axios.post(
    `${baseUrl}/mpesa/stkpush/v1/processrequest`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  console.log("✅ STK Response:", data);
  return data;
}

export function parseMpesaCallback(body) {
  const stk = body?.Body?.stkCallback || {};
  const items = stk?.CallbackMetadata?.Item || [];
  const findVal = (name) => items.find((i) => i.Name === name)?.Value;
  return {
    merchantRequestId: stk.MerchantRequestID,
    checkoutRequestId: stk.CheckoutRequestID,
    resultCode: stk.ResultCode,
    resultDesc: stk.ResultDesc,
    amount: findVal("Amount"),
    mpesaReceiptNumber: findVal("MpesaReceiptNumber"),
    transactionDate: findVal("TransactionDate"),
    phoneNumber: findVal("PhoneNumber"),
  };
}