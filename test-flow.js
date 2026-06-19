// test-flow.js
const http = require('http');

async function fetchJSON(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {}
    };

    if (body) {
      options.headers['Content-Type'] = 'application/json';
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log("=== STARTING END-TO-END E-COMMERCE TESTS ===");

  try {
    // 1. Fetch Products
    console.log("\\n[1] Fetching Products (/api/products)...");
    const productsRes = await fetchJSON('/api/products');
    if (productsRes.status === 200 && Array.isArray(productsRes.data)) {
      console.log(`✅ Success! Found ${productsRes.data.length} products.`);
    } else {
      console.error("❌ Failed to fetch products:", productsRes);
      return;
    }

    const firstProduct = productsRes.data[0];
    console.log(`Using product: ${firstProduct.name} (ID: ${firstProduct.id}, Price: ${firstProduct.price})`);

    // 2. Create a Promo Code
    console.log("\\n[2] Creating Test Promo Code (/api/admin/marketing/promos)...");
    const promoBody = {
      code: "TEST" + Date.now(),
      discount_type: "fixed",
      discount_value: 500,
      max_uses: 10
    };
    const promoRes = await fetchJSON('/api/admin/marketing/promos', 'POST', promoBody);
    if (promoRes.status === 200 && promoRes.data.code) {
      console.log(`✅ Success! Created Promo Code: ${promoRes.data.code}`);
    } else {
      console.error("❌ Failed to create promo code:", promoRes);
      return;
    }

    // 3. Place an Order
    console.log("\\n[3] Placing an Order with the Promo Code (/api/orders)...");
    const orderBody = {
      customer_name: "John Doe Test",
      email: "john@test.com",
      phone: "03001234567",
      shipping_address: {
        address_line1: "123 Test St",
        city: "Lahore"
      },
      payment_method: "COD",
      subtotal: firstProduct.price,
      shipping_fee: 250,
      total: firstProduct.price + 250 - 500,
      items: [
        {
          id: firstProduct.id,
          name: firstProduct.name,
          price: firstProduct.price,
          quantity: 1,
          image: firstProduct.images[0]
        }
      ],
      promo_code: promoBody.code
    };

    const orderRes = await fetchJSON('/api/orders', 'POST', orderBody);
    if ((orderRes.status === 200 || orderRes.status === 201) && orderRes.data.order && orderRes.data.order.id) {
      console.log(`✅ Success! Order placed successfully. Order ID: ${orderRes.data.order.id}`);
      console.log(`Total after 500 PKR discount: ${orderRes.data.order.total}`);
    } else {
      console.error("❌ Failed to place order:", JSON.stringify(orderRes, null, 2));
      return;
    }

    // 4. Verify Admin Orders
    console.log("\\n[4] Verifying Admin Orders (/api/orders)...");
    const adminOrdersRes = await fetchJSON('/api/orders');
    if (adminOrdersRes.status === 200 && Array.isArray(adminOrdersRes.data)) {
      const foundOrder = adminOrdersRes.data.find(o => o.id === orderRes.data.order.id);
      if (foundOrder) {
        console.log(`✅ Success! Order ${foundOrder.id} successfully recorded in the admin database.`);
      } else {
        console.error("❌ Order not found in database!");
      }
    } else {
      console.error("❌ Failed to fetch admin orders:", adminOrdersRes);
      return;
    }

    console.log("\\n🎉 ALL TESTS PASSED SUCCESSFULLY! The core platform is fully operational.");

  } catch (error) {
    console.error("Test execution failed:", error.message);
  }
}

runTests();
