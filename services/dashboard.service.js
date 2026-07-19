const User = require('../models/user.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const { buildPaginationResult } = require('../utils/paginationHelper');

exports.getOverview = async _ => {
  const [totalUsers, productStats, orderStats] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: {
            $sum: {
              $cond: { if: { $eq: ['$status', 'active'] }, then: 1, else: 0 },
            },
          },
          outOfStockProducts: {
            $sum: { $cond: { if: { $eq: ['$stock', 0] }, then: 1, else: 0 } },
          },
        },
      },
    ]),
    Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          pendingOrders: {
            $sum: {
              $cond: { if: { $eq: ['$status', 'pending'] }, then: 1, else: 0 },
            },
          },
          ordersBeingProcessing: {
            $sum: {
              $cond: {
                if: { $eq: ['$status', 'processing'] },
                then: 1,
                else: 0,
              },
            },
          },
          shippedOrders: {
            $sum: {
              $cond: { if: { $eq: ['$status', 'shipped'] }, then: 1, else: 0 },
            },
          },
          completedOrders: {
            $sum: {
              $cond: {
                if: { $eq: ['$status', 'delivered'] },
                then: 1,
                else: 0,
              },
            },
          },
          cancelledOrders: {
            $sum: {
              $cond: {
                if: { $eq: ['$status', 'cancelled'] },
                then: 1,
                else: 0,
              },
            },
          },
          totalRevenue: {
            $sum: {
              $cond: {
                if: {
                  $eq: ['$isPaid', true],
                },
                then: {
                  $subtract: [
                    '$totalPrice',
                    { $ifNull: ['$shippingPrice', 0] },
                  ],
                },
                else: 0,
              },
            },
          },
        },
      },
    ]),
  ]);

  const pData =
    productStats.length > 0
      ? productStats[0]
      : { totalProducts: 0, activeProducts: 0, outOfStockProducts: 0 };
  const oData =
    orderStats.length > 0
      ? orderStats[0]
      : {
          totalOrders: 0,
          pendingOrders: 0,
          ordersBeingProcessing: 0,
          shippedOrders: 0,
          completedOrders: 0,
          cancelledOrders: 0,
          totalRevenue: 0,
        };

  return {
    totalUsers,
    product: {
      total: pData.totalProducts,
      active: pData.activeProducts,
      outOfStock: pData.outOfStockProducts,
    },
    orders: {
      total: oData.totalOrders,
      revenue: oData.totalRevenue,
      breakdown: {
        pending: oData.pendingOrders,
        processing: oData.ordersBeingProcessing,
        shipped: oData.shippedOrders,
        completed: oData.completedOrders,
        cancelled: oData.cancelledOrders,
      },
    },
  };
};

exports.getSalesByMonth = async query => {
  const year = query.year ? parseInt(query.year) : new Date().getFullYear();
  const month = query.month ? parseInt(query.month) : null;

  // prettier-ignore
  const monthsNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  let startDate, endDate;

  if (month) {
    const daysInMonth = new Date(year, month, 0).getDate();
    startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
    endDate = new Date(year, month - 1, daysInMonth, 23, 59, 59, 999);
  } else {
    startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    endDate = new Date(`${year}-12-31T23:59:59.999Z`);
  }

  const salesData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        $or: [{ status: 'delivered' }, { isPaid: true }],
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        totalRevenue: {
          $sum: {
            $subtract: ['$totalPrice', { $ifNull: ['$shippingPrice', 0] }],
          },
        },
      },
    },
  ]);

  if (month) {
    const foundMonth = salesData.find(item => item._id === month);
    const revenue = foundMonth ? foundMonth.totalRevenue : 0;
    const targetMonthName = monthsNames[month - 1];

    return {
      year,
      month: targetMonthName,
      totalRevenue: revenue,
    };
  }

  const report = {};
  let totalRevenue = 0;

  monthsNames.forEach((monthName, index) => {
    const monthNumber = index + 1;
    const foundMonth = salesData.find(item => item._id === monthNumber);
    const revenue = foundMonth ? foundMonth.totalRevenue : 0;

    report[monthName] = revenue;
    totalRevenue += revenue;
  });

  return {
    year,
    totalRevenue,
    months: report,
  };
};

exports.getTopSellingProducts = async query => {
  const page = query.page * 1 || 1;
  const limit = query.limit * 1 || 5;
  const skip = (page - 1) * limit;

  const result = await Product.aggregate([
    { $match: { sold: { $gt: 0 } } },
    { $sort: { sold: -1 } },
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit },
          {
            // prettier-ignore
            $project: {
              _id: 1, title: 1, price: 1, sold: 1, stock: 1, imageCover: 1,
            },
          },
        ],
        totalCount: [{ $count: 'count' }],
      },
    },
  ]);

  const { data: products, pagination } = buildPaginationResult(
    result,
    page,
    limit,
  );

  return { products, pagination };
};

exports.getTopRatedProducts = async query => {
  const page = query.page * 1 || 1;
  const limit = query.limit * 1 || 5;
  const skip = (page - 1) * limit;

  const result = await Product.aggregate([
    { $match: { ratingsQuantity: { $gte: 2 } } },
    { $sort: { ratingsAverage: -1 } },
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit },
          {
            // prettier-ignore
            $project: {
              _id: 1, title: 1, price: 1, ratingsAverage: 1, ratingsQuantity: 1, stock: 1, imageCover: 1,
            },
          },
        ],
        totalCount: [{ $count: 'count' }],
      },
    },
  ]);

  const { data: products, pagination } = buildPaginationResult(
    result,
    page,
    limit,
  );

  return { products, pagination };
};

exports.getRecentOrders = async query => {
  const page = query.page * 1 || 1;
  const limit = query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  const result = await Order.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'userData',
            },
          },
          {
            $unwind: {
              path: '$userData',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            // prettier-ignore
            $project: {
              _id: 1, totalPrice: 1, status: 1, isPaid: 1, createdAt: 1,
              customer: {
                _id: '$userData._id',
                name: '$userData.name',
                email: '$userData.email',
              },
            },
          },
        ],
        totalCount: [{ $count: 'count' }],
      },
    },
  ]);

  const { data: orders, pagination } = buildPaginationResult(
    result,
    page,
    limit,
  );

  return { orders, pagination };
};

exports.getOrdersStatus = async () => {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  const orderStatus = {};
  stats.forEach(item => {
    const statusName = item._id || 'unknown';
    orderStatus[statusName] = item.count;
  });

  return orderStatus;
};

exports.getAverageOrderValue = async _ => {
  const stats = await Order.aggregate([
    {
      $match: {
        $or: [{ status: 'delivered' }, { isPaid: true }],
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: {
            $subtract: ['$totalPrice', { $ifNull: ['$shippingPrice', 0] }],
          },
        },
        ordersCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        averageOrderValue: {
          $cond: {
            if: { $gt: ['$ordersCount', 0] },
            then: {
              $round: [{ $divide: ['$totalRevenue', '$ordersCount'] }, 2],
            },
            else: 0,
          },
        },
        totalRevenue: 1,
        ordersCount: '$ordersCount',
      },
    },
  ]);

  return stats.length > 0
    ? stats[0]
    : { averageOrderValue: 0, totalRevenue: 0, ordersCount: 0 };
};

exports.getMostValuableCustomers = async query => {
  const page = query.page * 1 || 1;
  const limit = query.limit * 1 || 5;
  const skip = (page - 1) * limit;

  const result = await Order.aggregate([
    { $match: { $or: [{ status: 'delivered' }, { isPaid: true }] } },
    {
      $group: {
        _id: '$user',
        totalSpent: { $sum: '$totalPrice' },
        ordersCount: { $sum: 1 },
      },
    },
    { $sort: { totalSpent: -1 } },
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'userData',
            },
          },
          {
            $unwind: {
              path: '$userData',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: 0,
              customerId: '$_id',
              totalSpent: { $round: ['$totalSpent', 2] },
              ordersCount: 1,
              name: { $ifNull: ['$userData.name', 'Deleted User'] },
              email: { $ifNull: ['$userData.email', 'N/A'] },
            },
          },
        ],
        totalCount: [{ $count: 'count' }],
      },
    },
  ]);

  const { data: customers, pagination } = buildPaginationResult(
    result,
    page,
    limit,
  );

  return { customers, pagination };
};
