const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/user/AdministrateurController");
const authMiddleware = require("../middleware/auth");
const authorizationMiddleware = require("../middleware/authorization");
const Role = require("../models/enums/RoleUtilisateur"); 

// Stats
router.get("/stats/global", authMiddleware, authorizationMiddleware([Role.ADMINISTRATEUR]), AdminController.getGlobalStats);
router.get("/stats/user/:userId", authMiddleware, authorizationMiddleware([Role.ADMINISTRATEUR]), AdminController.getUserStats);
router.get("/stats/course/:coursId", authMiddleware, authorizationMiddleware([Role.ADMINISTRATEUR]), AdminController.getCourseStats);

// Gestion users
router.get("/users", authMiddleware, authorizationMiddleware([Role.ADMINISTRATEUR]), AdminController.getAllUsers);
router.put("/users/:userId", authMiddleware, authorizationMiddleware([Role.ADMINISTRATEUR]), AdminController.updateUser);
router.delete("/users/:userId", authMiddleware, authorizationMiddleware([Role.ADMINISTRATEUR]), AdminController.deleteUser);

// Gestion cours
router.post("/courses", authMiddleware, authorizationMiddleware([Role.ADMINISTRATEUR]), AdminController.createCourse);
router.get("/courses", authMiddleware, authorizationMiddleware([Role.ADMINISTRATEUR]), AdminController.getAllCourses);
router.put("/courses/:coursId", authMiddleware, authorizationMiddleware([Role.ADMINISTRATEUR]), AdminController.updateCourse);
router.delete("/courses/:coursId", authMiddleware, authorizationMiddleware([Role.ADMINISTRATEUR]), AdminController.deleteCourse);

module.exports = router;