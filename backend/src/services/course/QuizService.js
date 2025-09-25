const Quiz = require("../../models/course/Quiz");

exports.create = async (data) => {
  const quiz = new Quiz(data);
  await quiz.save();
  return quiz;
};
