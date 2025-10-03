const User = require("../../models/user/User");
const CoursService = require("../learning/CoursService");

exports.getInstructeurCourses = async (instructeurId) => {
  const instructeur = await User.findById(instructeurId).populate("coursCrees");
  return instructeur?.coursCrees || [];
};

exports.createInstructeurCourse = async (instructeurId, data) => {
  const cours = await CoursService.createCourse(data, instructeurId);
  const instructeur = await User.findById(instructeurId);
  instructeur.coursEnCoursEdition.push(cours._id);
  await instructeur.save();
  return cours;
};

exports.updateInstructeurCourse = async (instructeurId, coursId, data) => {
  return await CoursService.updateCourse(coursId, data, instructeurId);
};

exports.submitCourseForApproval = async (instructeurId, coursId) => {
  const instructeur = await User.findById(instructeurId);
  const courseIndex = instructeur.coursEnCoursEdition.indexOf(coursId);
  if (courseIndex > -1) {
    instructeur.coursEnCoursEdition.splice(courseIndex, 1);
    instructeur.coursCrees.push(coursId);
    await instructeur.save();
    return await CoursService.updateCourse(
      coursId,
      { statutApprobation: "PENDING" },
      instructeurId
    );
  }
  throw new Error("Cours non en cours d'édition");
};

exports.getInstructeurCoursesInProgress = async (instructeurId) => {
  const instructeur = await User.findById(instructeurId).populate(
    "coursEnCoursEdition"
  );
  return instructeur?.coursEnCoursEdition || [];
};
