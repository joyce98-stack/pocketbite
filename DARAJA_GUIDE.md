# 📱 M-Pesa Daraja API Setup Guide

This guide helps you connect PocketBite to Safaricom's M-Pesa Daraja API for real payments.

## Step 1: Create Daraja Account

1. Go to https://developer.safaricom.co.ke/
2. Click **Sign Up** and fill in your details
3. Verify your email

## Step 2: Create an App

1. Login to Daraja Portal
2. Go to **My Apps** → **Add a New App**
3. App Name: `PocketBite`
4. Select these APIs:
   - ✅ Lipa Na M-Pesa Online
   - ✅ M-Pesa Sandbox
5. Click **Create App**

## Step 3: Get Your Credentials

After creating the app, you'll see:
- **Consumer Key** - Copy this
- **Consumer Secret** - Copy this

Add them to `backend/.env`:
```env
MPESA_CONSUMER_KEY=paste_your_consumer_key_here
MPESA_CONSUMER_SECRET=paste_your_consumer_secret_here
```

## Step 4: Get the Passkey

For Sandbox testing:
```
Passkey: bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
```

For Production: Get it from your M-Pesa Business Portal

Add to `backend/.env`:
```env
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
```

## Step 5: Configure Your Till Number

Your Till Number: **6668495**

```env
MPESA_SHORTCODE=6668495
MPESA_TRANSACTION_TYPE=CustomerBuyGoodsOnline
```

For Sandbox testing, use:
```env
MPESA_SHORTCODE=174379
MPESA_TRANSACTION_TYPE=CustomerPayBillOnline
```

## Step 6: Setup Callback URL (CRITICAL!)

M-Pesa needs to call back your server to confirm payments. You need a **public HTTPS URL**.

### For Local Testing (use ngrok):

1. Install ngrok: https://ngrok.com/download
2. Run your backend: `npm run dev` (port 5000)
3. In a new terminal: `ngrok http 5000`
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)
5. Update `.env`:
```env
MPESA_CALLBACK_URL=https://abc123.ngrok-free.app/api/mpesa/callback
```
6. Restart backend

### For Production:
Use your domain:
```env
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
```

## Step 7: Test with Sandbox

### Sandbox Test Phone Numbers:
- `254708374149`
- `254711111111`
- `254722222222`

### Test PIN:
- Use any 4-digit PIN like `1234` on the simulator

### Sandbox Test Flow:
1. Diner books in your app
2. STK push is sent
3. On sandbox, Safaricom uses a test simulator
4. After "PIN entry", callback fires
5. Booking status updates to "confirmed"

## Step 8: Go Live

When ready for production:

1. **Apply for Go-Live** on Daraja Portal
2. Provide:
   - Business name & registration
   - Till number proof
   - System screenshots
3. Wait 1-3 business days for approval
4. Switch to production:
```env
MPESA_ENV=production
MPESA_CONSUMER_KEY=production_key_here
MPESA_CONSUMER_SECRET=production_secret_here
MPESA_PASSKEY=production_passkey_here
MPESA_SHORTCODE=6668495
```

## Troubleshooting

### "Invalid Access Token"
- Check Consumer Key & Secret are correct
- Ensure no spaces in `.env`

### "STK push sent but no popup on phone"
- Phone number must include 254 prefix (no +)
- Check phone has M-Pesa registered
- Check phone has signal

### "Callback not working"
- Use HTTPS only (ngrok provides this)
- Check ngrok is still running
- View callback logs: `GET /api/health`

### "ResultCode: 1037"
- User didn't respond to STK in time
- Try again

### "ResultCode: 1032"
- User cancelled the transaction

## Africa's Talking SMS Setup

For sending SMS reminders & confirmations:

1. Sign up: https://africastalking.com/
2. Get API Key from Dashboard → Settings → API Key
3. Add to `.env`:
```env
AT_USERNAME=sandbox
AT_API_KEY=your_api_key_here
```

### Sandbox Testing:
- Username: `sandbox`
- Free SMS to test numbers
- View sent SMS at: https://account.africastalking.com/apps/sandbox/sms

### Production:
- Top up your AT account
- Use your real username
- Apply for sender ID (optional, 1-2 weeks approval)

## Need Help?

- Daraja Docs: https://developer.safaricom.co.ke/Documentation
- AT Docs: https://developers.africastalking.com/docs/sms/sending
- PocketBite Support: open an issue in the repo
