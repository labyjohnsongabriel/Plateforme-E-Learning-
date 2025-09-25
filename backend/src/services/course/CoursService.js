const Cours = require("../../models/learning/Cours");

exports.createCourse = async (data, createurId) => {
  const course = new Cours({ ...data, createur: createurId });
  await course.save();
  return course;
};

exports.getAllCourses = async () => {
  return await Cours.find().populate("createur", "nom prenom");
};

exports.updateCourse = async (coursId, data) => {
  return await Cours.findByIdAndUpdate(coursId, data, { new: true });
};

exports.deleteCourse = async (coursId) => {
  await Cours.findByIdAndDelete(coursId);
  // Optionnel : Supprimer progressions, certs associés
};
