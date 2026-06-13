import africastalking from "africastalking";

let smsClient = null;

function getSmsClient() {
  if (smsClient) return smsClient;

  const credentials = {
    apiKey: process.env.AT_API_KEY,
    username: process.env.AT_USERNAME || "sandbox",
  };

  smsClient = africastalking(credentials).SMS;
  return smsClient;
}

export async function sendSms({ to, message }) {
  if (!process.env.AT_API_KEY || process.env.AT_API_KEY.includes("paste_")) {
    console.log("SMS skipped because AT_API_KEY is not configured:", { to, message });
    return { skipped: true };
  }

  const options = {
    to: [to],
    message,
  };

  if (process.env.AT_SENDER_ID) options.from = process.env.AT_SENDER_ID;

  return getSmsClient().send(options);
}

export function bookingThankYouMessage(booking) {
  return `Thank you ${booking.dinerName}! Your PocketBite booking at ${booking.restaurantName} is confirmed for ${booking.date} at ${booking.time}. QR: ${booking.qrCode}`;
}

export function bookingReminderMessage(booking) {
  return `PocketBite reminder: Your table at ${booking.restaurantName} is on ${booking.date} at ${booking.time}. Please carry your QR code: ${booking.qrCode}`;
}