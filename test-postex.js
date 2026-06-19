const http = require('http');

async function fetchJSON(path, method = 'GET', body = null, headers = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: headers || {}
    };

    if (body) {
      options.headers['Content-Type'] = 'application/json';
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testPostEx() {
  console.log("=== STARTING POSTEX MOCK INTEGRATION TEST ===\\n");

  try {
    // 0. Login as Admin
    console.log("[0] Logging in as Admin...");
    const loginRes = await fetchJSON('/api/admin/login', 'POST', { username: "admin", password: "admin123" });
    if (loginRes.status !== 200) {
      console.error("❌ Login failed.");
      return;
    }
    
    // Extract cookie
    const setCookieHeader = loginRes.headers['set-cookie'];
    const adminCookie = Array.isArray(setCookieHeader) ? setCookieHeader.find(c => c.startsWith('smartwear_admin_token=')) : setCookieHeader;
    if (!adminCookie) {
      console.error("❌ No admin cookie received.");
      return;
    }
    console.log("✅ Admin Login Successful.");

    // 1. Fetch Orders
    console.log("\\n[1] Fetching Orders...");
    const ordersRes = await fetchJSON('/api/orders');
    if (ordersRes.status !== 200 || !Array.isArray(ordersRes.data) || ordersRes.data.length === 0) {
      console.error("❌ Failed to fetch orders or no orders found.");
      return;
    }

    const targetOrder = ordersRes.data[0]; // Get the most recent order
    console.log(`✅ Selected Order: ${targetOrder.id} (${targetOrder.customer_name})`);

    // 2. Book parcel on PostEx
    console.log("\\n[2] Attempting to book parcel via PostEx (/api/postex)...");
    
    // shipping_address is an object in the new schema
    const addressString = targetOrder.shipping_address?.address_line1 || "Unknown Address";
    const cityString = targetOrder.shipping_address?.city || "Unknown City";

    const postexPayload = {
      orderId: targetOrder.id,
      customerName: targetOrder.customer_name,
      phone: targetOrder.phone,
      address: addressString,
      city: cityString,
      amount: targetOrder.total
    };

    const postexRes = await fetchJSON('/api/postex', 'POST', postexPayload);
    
    let trackingId = null;
    if (postexRes.status === 200 && postexRes.data.success) {
      trackingId = postexRes.data.trackingNumber;
      console.log(`✅ Success! PostEx Mock returned Tracking ID: ${trackingId}`);
    } else {
      console.error("❌ Failed to book PostEx parcel:", postexRes);
      return;
    }

    // 3. Update Order Status to "Shipped" with PostEx ID
    console.log("\\n[3] Updating Order Status to 'Shipped' with PostEx Tracking ID...");
    const updatePayload = {
      id: targetOrder.id,
      status: "Shipped",
      postexId: trackingId,
      note: "Parcel booked successfully"
    };

    const updateRes = await fetchJSON('/api/orders', 'PUT', updatePayload, { 'Cookie': adminCookie });
    if (updateRes.status === 200 && updateRes.data.status === 'Shipped') {
      console.log(`✅ Success! Order ${targetOrder.id} is now Shipped.`);
      console.log(`Attached Tracking ID in database: ${updateRes.data.postex}`);
    } else {
      console.error("❌ Failed to update order status:", updateRes);
      return;
    }

    console.log("\\n🎉 POSTEX INTEGRATION TEST PASSED SUCCESSFULLY!");

  } catch (err) {
    console.error("Test Error:", err);
  }
}

testPostEx();
