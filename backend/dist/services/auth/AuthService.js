"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User = require("../../models/user/User");
const JwtService = require("./JwtService");
const PasswordService = require("./PasswordService");
exports.register = async (data) => {
    const user = new User(data);
    await user.save();
    return user;
};
exports.login = async ({ email, motDePasse }) => {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(motDePasse))) {
        throw new Error("Invalid credentials");
    }
    const token = JwtService.sign({ id: user._id, role: user.role });
    return { token, user };
};
//# sourceMappingURL=AuthService.js.map