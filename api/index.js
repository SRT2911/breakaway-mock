const express = require('express');
const app = express();

app.use(express.json());

// Helper: Exactly 6 digits validation
const isSixDigits = (val) => /^\d{6}$/.test(String(val || '').trim());

// In-Memory dynamic store
let accountState = {
  id: 100002,
  name: "Nadine St. Pierre",
  balanceAmount: 201.0,
  currency: "CAD"
};

let invoiceState = {
  id: 100009,
  accountId: 100064,
  amount: 2.41,
  remainingAmount: 2.41,
  currency: "USD"
};

// Health Check
app.get('/', (req, res) => {
  res.send('Breakaway Mock API is online 24/7.');
});

// 1. VALIDATE PIN
// Rules: Fails if Account ID or PIN is NOT 6 digits
app.post('/api/core/members/:account/pin/validate', (req, res) => {
  const account = req.params.account;
  const pin = req.body?.pin;

  if (!isSixDigits(account) || !isSixDigits(pin)) {
    return res.status(400).json({ error: "Account ID and PIN must both be exactly 6 digits." });
  }

  return res.status(200).json({
    data: {
      account: {
        id: Number(account),
        name: accountState.name,
        accountName: accountState.name,
        status: { value: "active", label: "Active" },
        standing: { value: "good", label: "Good" },
        type: { value: "personal", label: "Personal" },
        isPrepaid: true,
        isClosed: false,
        isActive: true,
        addresses: {
          billingAddress: {
            id: 1,
            name: accountState.name,
            address1: "1237 Harding Place",
            city: "Charlottetset",
            region: "US-OK",
            regionName: "Oklahoma",
            postalCode: "28333-9999",
            country: "US",
            countryName: "United States",
            type: { value: "billing", label: "Billing" }
          },
          mailingAddress: {
            id: 2,
            name: accountState.name,
            address1: "1237 Harding Place",
            city: "Charlottetset",
            region: "US-OK",
            regionName: "Oklahoma",
            postalCode: "28333-9999",
            country: "US",
            countryName: "United States",
            type: { value: "mailing", label: "Mailing" }
          }
        },
        balance: { amount: accountState.balanceAmount, currency: accountState.currency },
        accountBalance: { amount: accountState.balanceAmount, currency: accountState.currency },
        member: {
          fullName: accountState.name,
          firstName: "Nadine",
          lastName: "St. Pierre",
          email: "nadine@example.com"
        },
        lastPayment: { amount: 25.0, currency: accountState.currency, date: "2026-03-01" },
        lastTransaction: { date: "2026-03-15" },
        language: "en",
        langauge: "en",
        currency: {
          id: 1,
          code: accountState.currency,
          name: "Canadian Dollar",
          symbol: "$",
          isActive: true,
          isDefault: true,
          updatedAt: "2025-04-23T15:56:20.002549Z"
        },
        lowBalanceThreshold: { amount: 20, currency: accountState.currency },
        violationThreshold: { amount: 10, currency: accountState.currency },
        autoReplenishThreshold: { amount: 5, currency: accountState.currency },
        autoReplenishAmount: { amount: 20, currency: accountState.currency },
        autoReplenishmentStatus: { value: "suspended", label: "Suspended" },
        accountTemplateId: 1
      }
    }
  });
});

// 2. FETCH ACCOUNT BALANCE
// Rules: Fails if Account ID is NOT 6 digits
app.get('/api/core/accounts/:accountId', (req, res) => {
  const { accountId } = req.params;

  if (!isSixDigits(accountId)) {
    return res.status(400).json({ error: "Account ID must be a 6-digit number." });
  }

  return res.status(200).json({
    data: {
      account: {
        id: Number(accountId),
        name: accountState.name,
        status: { value: "active", label: "Active" },
        standing: { value: "good", label: "Good" },
        type: { value: "personal", label: "Personal" },
        addresses: {
          billingAddress: {
            id: 1,
            name: accountState.name,
            address1: "1237 Harding Place",
            city: "Charlottetset",
            region: "US-OK",
            regionName: "Oklahoma",
            postalCode: "28333-9999",
            country: "US",
            countryName: "United States",
            type: { value: "billing", label: "Billing" }
          },
          mailingAddress: {
            id: 2,
            name: accountState.name,
            address1: "1237 Harding Place",
            city: "Charlottetset",
            region: "US-OK",
            regionName: "Oklahoma",
            postalCode: "28333-9999",
            country: "US",
            countryName: "United States",
            type: { value: "mailing", label: "Mailing" }
          }
        },
        isPrepaid: true,
        lowBalanceThreshold: { amount: 20, currency: accountState.currency },
        violationThreshold: { amount: 10, currency: accountState.currency },
        autoReplenishThreshold: { amount: 5, currency: accountState.currency },
        autoReplenishAmount: { amount: 20, currency: accountState.currency },
        autoReplenishmentStatus: { value: "suspended", label: "Suspended" },
        balance: { amount: accountState.balanceAmount, currency: accountState.currency },
        currency: {
          id: 1,
          code: accountState.currency,
          name: "Canadian Dollar",
          symbol: "$",
          isActive: true,
          isDefault: true,
          updatedAt: "2025-04-23T15:56:20.002549Z"
        },
        accountTemplateId: 1,
        isClosed: false,
        isActive: true
      }
    }
  });
});

// 3. FETCH INVOICE DETAILS
// Rules: Fails if Invoice ID is NOT 6 digits
app.get('/api/core/invoices/:invoiceId', (req, res) => {
  const { invoiceId } = req.params;

  if (!isSixDigits(invoiceId)) {
    return res.status(400).json({ error: "Invoice ID must be a 6-digit number." });
  }

  return res.status(200).json({
    id: Number(invoiceId),
    accountId: invoiceState.accountId,
    status: {
      value: invoiceState.remainingAmount === 0 ? "paid" : "draft",
      label: invoiceState.remainingAmount === 0 ? "Paid" : "Draft"
    },
    amount: {
      amount: invoiceState.amount,
      currency: invoiceState.currency
    },
    remainingAmount: {
      amount: invoiceState.remainingAmount,
      currency: invoiceState.currency
    },
    dueDate: "2026-11-30T00:00:00Z"
  });
});

// 4. PAYMENT API
// Rules: Token > 0, Amount >= 1.00, checkoutType wallet vs invoice with mutual exclusion
app.post('/api/core/ivr-payment', (req, res) => {
  const { token, paymentAmount, checkoutType, accountId, invoiceId } = req.body;

  if (isNaN(token) || Number(token) <= 0) {
    return res.status(400).json({ error: "Token must be a numerical value greater than 0." });
  }

  if (isNaN(paymentAmount) || Number(paymentAmount) < 1.00) {
    return res.status(400).json({ error: "Payment amount must be greater than or equal to 1.00." });
  }

  if (!['wallet', 'invoice'].includes(checkoutType)) {
    return res.status(400).json({ error: "checkoutType must be either 'wallet' or 'invoice'." });
  }

  if (checkoutType === 'wallet') {
    if (!isSixDigits(accountId) || (invoiceId !== null && invoiceId !== undefined && invoiceId !== "")) {
      return res.status(400).json({ error: "For 'wallet', accountId must be 6 digits and invoiceId must be null." });
    }
    accountState.balanceAmount += Number(paymentAmount);
  }

  if (checkoutType === 'invoice') {
    if (!isSixDigits(invoiceId) || (accountId !== null && accountId !== undefined && accountId !== "")) {
      return res.status(400).json({ error: "For 'invoice', invoiceId must be 6 digits and accountId must be null." });
    }
    invoiceState.remainingAmount = Math.max(0, invoiceState.remainingAmount - Number(paymentAmount));
  }

  const receiptNum = String(Math.floor(10000000 + Math.random() * 90000000));

  return res.status(200).json({
    data: {
      receipt: receiptNum,
      token: `tok_${receiptNum}`
    },
    receipt: receiptNum,
    token: `tok_${receiptNum}`
  });
});

// 5. ASSOCIATE CASE WITH RECHARGE ACCOUNT
// Rules: accountId = 6 digits, caseNumber = numeric > 0
app.post('/api/core/crm/associate', (req, res) => {
  const { accountId, caseNumber } = req.body;

  if (!isSixDigits(accountId)) {
    return res.status(400).json({ error: "accountId must be a 6-digit number." });
  }

  if (isNaN(caseNumber) || Number(caseNumber) <= 0) {
    return res.status(400).json({ error: "caseNumber must be a numerical value greater than 0." });
  }

  return res.status(200).json({});
});

module.exports = app;
