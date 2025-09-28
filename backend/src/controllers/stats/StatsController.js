const Course = require("../../models/course/Cours");

const StatsController = {
  getStats: async (req, res) => {
    try {
      const stats = {
        totalCourses: await Course.countDocuments(),
        categories: await Course.distinct("category"),
        totalEnrollments: 500,
      };
      res.json(stats);
    } catch (error) {
      console.error("Error in getStats:", error);
      res
        .status(500)
        .json({
          message: "Erreur serveur lors de la récupération des statistiques",
        });
    }
  },
};
module.exports = StatsController;
