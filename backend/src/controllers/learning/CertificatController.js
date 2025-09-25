const Certificat = require("../../models/learning/Certificat");
const User = require("../../models/user/User"); // Assurez-vous que le modèle User existe
const Cours = require("../../models/course/Cours"); // Assurez-vous que le modèle Cours existe
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit"); // Bibliothèque pour générer des PDF (installez via npm i pdfkit)

exports.getByUser = async (req, res, next) => {
  try {
    const certs = await Certificat.find({ apprenant: req.user.id }).populate("cours", "titre niveau");
    if (!certs.length) {
      return res.status(200).json([]); // Retourne un tableau vide si aucun certificat
    }
    res.json(certs);
  } catch (err) {
    console.error("Erreur lors de la récupération des certificats:", err);
    next(err);
  }
};

exports.download = async (req, res, next) => {
  try {
    const cert = await Certificat.findOne({ _id: req.params.id, apprenant: req.user.id });
    if (!cert) {
      return res.status(404).json({ message: "Certificat non trouvé ou non autorisé" });
    }

    // Chemin du fichier (assumé local ; en prod, utilisez un signed URL S3)
    const filePath = path.join(__dirname, "../../public", cert.urlCertificat);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Fichier du certificat non trouvé" });
    }

    res.download(filePath, `certificat_${cert._id}.pdf`);
  } catch (err) {
    console.error("Erreur lors du téléchargement du certificat:", err);
    next(err);
  }
};

// Fonction interne pour générer un certificat automatiquement (appelée e.g. depuis ProgressionController)
// Alignée sur le cahier des charges : génération auto pour niveaux Bêta+
exports.generateCertificate = async (apprenantId, coursId) => {
  try {
    // Vérifier l'existence du certificat pour éviter les doublons
    const existingCert = await Certificat.findOne({ apprenant: apprenantId, cours: coursId });
    if (existingCert) {
      return existingCert; // Retourne l'existant si déjà généré
    }

    const user = await User.findById(apprenantId);
    const cours = await Cours.findById(coursId);
    if (!user || !cours) {
      throw new Error("Utilisateur ou cours non trouvé");
    }

    // Liste des niveaux ordonnés (du cahier des charges)
    const levels = ["Alfa", "Bêta", "Gamma", "Delta"]; // Ajoutez plus si nécessaire
    const levelIndex = levels.indexOf(cours.niveau);
    if (levelIndex < 1) { // Alfa (index 0) n'a pas de certificat
      return null;
    }

    // Générer le PDF
    const doc = new PDFDocument({ size: "A4", layout: "landscape" }); // Format professionnel
    const filename = `certificat_${apprenantId}_${coursId}.pdf`;
    const dir = path.join(__dirname, "../../public/certificates");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const filePath = path.join(dir, filename);
    doc.pipe(fs.createWriteStream(filePath));

    // Contenu du PDF (design professionnel : titre, détails, signature fictive)
    doc.image(path.join(__dirname, "../../public/logo-youth-computing.png"), 50, 50, { width: 100 }); // Ajoutez un logo si disponible
    doc.fontSize(30).font("Helvetica-Bold").text("Certificat de Complétion", 150, 100, { align: "center" });
    doc.fontSize(18).font("Helvetica").text(`Délivré à : ${user.prenom} ${user.nom}`, 150, 200);
    doc.text(`Pour le cours : ${cours.titre}`, 150, 230);
    doc.text(`Niveau : ${cours.niveau}`, 150, 260);
    doc.text(`Date d'émission : ${new Date().toLocaleDateString("fr-FR")}`, 150, 290);
    doc.fontSize(14).text("Youth Computing - Association pour la formation numérique", 150, 350, { align: "center" });
    doc.text("Signature : _______________________", 150, 380, { align: "center" });
    doc.end();

    // Sauvegarder le certificat en base
    const url = `/certificates/${filename}`; // URL relative (adaptez pour cloud)
    const newCert = new Certificat({
      apprenant: apprenantId,
      cours: coursId,
      dateEmission: new Date(),
      urlCertificat: url,
    });
    await newCert.save();

    return newCert;
  } catch (err) {
    console.error("Erreur lors de la génération du certificat:", err);
    throw err; // Laissez l'appelant gérer l'erreur
  }
};