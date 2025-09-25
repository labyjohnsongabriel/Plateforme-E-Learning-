const express = require("express");
const router = express.Router();

router.use("/auth", require("./auth"));
router.use("/users", require("./users"));
router.use("/courses", require("./courses"));
router.use("/learning", require("./learning"));
router.use("/notifications", require("./notifications"));
router.use("/admin", require("./admin"));

module.exports = router;
