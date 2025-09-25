const User = require("../../models/user/User");

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-motDePasse");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select("-motDePasse");
    if (!updated) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-motDePasse");
    res.json(users);
  } catch (err) {
    next(err);
  }
};

module.exports = exports;
