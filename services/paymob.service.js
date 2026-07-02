const axios = require('axios');

exports.createPaymentIntention = async (user, order) => {
  const orderItems = order.orderItems.map(item => ({
    name: item.title,
    amount: Math.round(item.price * 100),
    quantity: item.quantity,
  }));

  if (order.shippingPrice > 0) {
    orderItems.push({
      name: 'Shipping Fee',
      amount: Math.round(order.shippingPrice * 100),
      quantity: 1,
    });
  }

  const totalAmount = orderItems.reduce((sum, item) => {
    return sum + item.amount * item.quantity;
  }, 0);

  try {
    const response = await axios.post(
      'https://accept.paymob.com/v1/intention/',
      {
        amount: totalAmount,
        currency: 'EGP',
        payment_methods: [
          +process.env.PAYMOB_INTEGRATION_ID_WALLET,
          +process.env.PAYMOB_INTEGRATION_ID_CARD,
        ],
        items: orderItems,
        special_reference: String(order.id),
        billing_data: {
          first_name: user.name.split(' ')[0],
          last_name: user.name.split(' ')?.[1] || 'Guest',
          email: user.email,
          phone_number: order.shippingAddress.phone,
          street: order.shippingAddress.street,
          city: order.shippingAddress.city,
          country: 'EGY',
        },
      },
      {
        headers: {
          Authorization: `Token ${process.env.PAYMOB_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );
    const { client_secret } = response.data;
    const checkoutUrl = `https://accept.paymob.com/unifiedcheckout/?publicKey=${process.env.PAYMOB_PUBLIC_KEY}&clientSecret=${client_secret}`;
    return {
      id: response.data.id,
      checkoutUrl,
      client_secret,
    };
  } catch (err) {
    console.log(
      '🚀 ~ err:',
      err.response ? JSON.stringify(err.response.data, null, 2) : err.message,
    );
    throw err;
  }
};
