exports.buildPaginationResult = (result, page, limit) => {
  const data = result[0].data;
  const totalDocuments = result[0].totalCount[0]?.count || 0;

  return {
    data,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalDocuments / limit),
      limit,
      totalResults: totalDocuments,
    },
  };
};
