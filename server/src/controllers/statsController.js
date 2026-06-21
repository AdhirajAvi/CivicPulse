import Issue from '../models/Issue.js';

export async function getStats(_req, res, next) {
  try {
    const [statusCounts, upvoteAgg] = await Promise.all([
      Issue.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Issue.aggregate([{ $group: { _id: null, totalUpvotes: { $sum: '$upvoteCount' } } }])
    ]);

    const byStatus = statusCounts.reduce((acc, row) => ({ ...acc, [row._id]: row.count }), {});
    const reported = byStatus.Reported || 0;
    const inProgress = byStatus['In Progress'] || 0;
    const resolved = byStatus.Resolved || 0;

    res.json({
      total: reported + inProgress + resolved,
      reported,
      inProgress,
      resolved,
      active: reported + inProgress,
      totalUpvotes: upvoteAgg[0]?.totalUpvotes || 0
    });
  } catch (error) {
    next(error);
  }
}
