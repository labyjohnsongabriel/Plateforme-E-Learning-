"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const User = require("../models/user/User");
const Cours = require("../models/course/Cours");
const logger = require("./logger");
exports.generateCertificate = async (apprenantId, coursId) => {
    try {
        const apprenant = await User.findById(apprenantId);
        const cours = await Cours.findById(coursId);
        if (!apprenant || !cours)
            throw new Error("Invalid user or course");
        const dir = path.join(__dirname, "../../uploads/certificates");
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir, { recursive: true });
        const fileName = `${apprenant._id}-${cours._id}-${Date.now()}.pdf`;
        const filePath = path.join(dir, fileName);
        const doc = new PDFDocument({ size: "A4", layout: "landscape" });
        doc.pipe(fs.createWriteStream(filePath));
        // Add content
        doc.fontSize(30).text("Certificat de Complétion", { align: "center" });
        doc.moveDown();
        doc
            .fontSize(20)
            .text(`Délivré à: ${apprenant.nom} ${apprenant.prenom}`, {
            align: "center",
        });
        doc.text(`Pour le cours: ${cours.titre} (Niveau: ${cours.niveau})`, {
            align: "center",
        });
        doc.text(`Domaine: ${cours.domaine.nom}`, { align: "center" });
        doc.text(`Date d'émission: ${new Date().toLocaleDateString("fr-FR")}`, {
            align: "center",
        });
        doc.end();
        logger.info(`Certificate generated: ${filePath}`);
        return `/uploads/certificates/${fileName}`; // Relative URL for storage
    }
    catch (err) {
        logger.error(`PDF generation error: ${err.message}`);
        throw err;
    }
};
//# sourceMappingURL=pdfGenerator.js.map