const dashboardService = require('../services/dashboard.service');

exports.getOverview = async (req, res) => {
  const overview = await dashboardService.getOverview();
  res.status(200).json({
    status: 'success',
    data: overview,
  });
};

exports.getSalesByMonth = async (req, res) => {
  const sales = await dashboardService.getSalesByMonth(req.query);
  res.status(200).json({
    status: 'success',
    data: sales,
  });
};

exports.getTopSellingProducts = async (req, res) => {
  const { products, pagination } = await dashboardService.getTopSellingProducts(
    req.query,
  );
  res.status(200).json({
    status: 'success',
    pagination,
    data: products,
  });
};

exports.getTopRatedProducts = async (req, res) => {
  const { products, pagination } = await dashboardService.getTopRatedProducts(
    req.query,
  );
  res.status(200).json({
    status: 'success',
    pagination,
    data: products,
  });
};

exports.getRecentOrders = async (req, res) => {
  const { orders, pagination } = await dashboardService.getRecentOrders(
    req.query,
  );
  res.status(200).json({
    status: 'success',
    pagination,
    data: orders,
  });
};

exports.getOrdersStatus = async (req, res) => {
  const status = await dashboardService.getOrdersStatus();
  res.status(200).json({
    status: 'success',
    data: status,
  });
};

exports.getAverageOrderValue = async (req, res) => {
  const averageOrderValue = await dashboardService.getAverageOrderValue();
  res.status(200).json({
    status: 'success',
    data: averageOrderValue,
  });
};

exports.getMostValuableCustomers = async (req, res) => {
  const { customers, pagination } =
    await dashboardService.getMostValuableCustomers(req.query);
  res.status(200).json({
    status: 'success',
    pagination,
    data: customers,
  });
};
