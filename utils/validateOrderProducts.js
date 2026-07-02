exports.validateProducts = (cart, products) => {
  const foundIds = new Set(products.map(product => product._id.toString()));

  const missingProducts = [];
  const unavailableProducts = [];
  const insufficientStockProducts = [];

  const productsMap = new Map(
    products.map(product => [product._id.toString(), product]),
  );

  for (const item of cart.items) {
    const productId = item.productId.toString();
    if (!foundIds.has(productId)) {
      missingProducts.push(productId);
      continue;
    }

    const product = productsMap.get(productId);
    if (product.statuus === 'disabled') {
      unavailableProducts.push({
        productId,
        title: product.title,
      });
      continue;
    }

    if (item.quantity > product.stock) {
      insufficientStockProducts.push({
        productId,
        title: product.title,
        requested: item.quantity,
        available: product.stock,
      });
    }
  }

  const isValid =
    !missingProducts.length &&
    !unavailableProducts.length &&
    !insufficientStockProducts.length;

  if (!isValid)
    return {
      isValid,
      missingProducts,
      unavailableProducts,
      insufficientStockProducts,
    };

  return {
    isValid,
    productsMap,
  };
};
