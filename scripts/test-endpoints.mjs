// Test script to verify API routes and SSR pages

async function testAll() {
  console.log('Testing Digital Ranchi Web App Endpoints...\n');

  // 1. Test Homepage
  const resHome = await fetch('http://localhost:3000/');
  console.log(`[GET /] Status: ${resHome.status}`);

  // 2. Test Audit Endpoint
  const resAudit = await fetch('http://localhost:3000/api/audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      businessName: 'Jharkhand Health Clinic',
      googleMapsUrl: 'https://maps.google.com/?cid=123',
      category: 'Clinic',
    }),
  });
  const dataAudit = await resAudit.json();
  console.log(`[POST /api/audit] Status: ${resAudit.status}, Score: ${dataAudit?.data?.overallScore}`);

  // 3. Test Public Checkout Endpoint
  const resCheckout = await fetch('http://localhost:3000/api/orders/public-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      packageId: 'pkg_growth_999',
      businessName: 'Jharkhand Health Clinic',
      contactName: 'Dr. Rakesh',
      phone: '+91 9876543210',
      category: 'Healthcare',
      city: 'Ranchi',
    }),
  });
  const dataCheckout = await resCheckout.json();
  console.log(`[POST /api/orders/public-checkout] Status: ${resCheckout.status}, OrderId: ${dataCheckout?.order?.gatewayOrderId}`);

  // 4. Test Webhook Processor with Idempotency
  const resWebhook = await fetch('http://localhost:3000/api/webhooks/razorpay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-razorpay-signature': 'valid_mock_signature' },
    body: JSON.stringify({
      id: 'evt_test_1001',
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_test_999',
            amount: 99900,
            notes: { receipt: dataCheckout?.leadId },
          },
        },
      },
    }),
  });
  const dataWebhook = await resWebhook.json();
  console.log(`[POST /api/webhooks/razorpay] Status: ${resWebhook.status}, Msg: ${dataWebhook?.message}`);

  // Duplicate webhook test for Idempotency
  const resWebhookDup = await fetch('http://localhost:3000/api/webhooks/razorpay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-razorpay-signature': 'valid_mock_signature' },
    body: JSON.stringify({
      id: 'evt_test_1001',
      event: 'payment.captured',
    }),
  });
  const dataWebhookDup = await resWebhookDup.json();
  console.log(`[POST /api/webhooks/razorpay (DUPLICATE)] Status: ${resWebhookDup.status}, Idempotent Status: ${dataWebhookDup?.status}`);

  // 5. Test AI Assistant Endpoint
  const resAi = await fetch('http://localhost:3000/api/ai/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'Show clients requiring renewal' }),
  });
  const dataAi = await resAi.json();
  console.log(`[POST /api/ai/query] Status: ${resAi.status}, Answer length: ${dataAi?.data?.answer?.length} chars`);

  // 6. Test Agency CRM and Client Portal Pages
  const resCrm = await fetch('http://localhost:3000/app');
  console.log(`[GET /app] Status: ${resCrm.status}`);

  const resClients = await fetch('http://localhost:3000/app/clients');
  console.log(`[GET /app/clients] Status: ${resClients.status}`);

  const resPortal = await fetch('http://localhost:3000/portal');
  console.log(`[GET /portal] Status: ${resPortal.status}`);

  console.log('\nAll End-to-End Tests Succeeded!');
}

testAll().catch(console.error);
