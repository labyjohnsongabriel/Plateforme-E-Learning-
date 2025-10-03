const Certificat = require("../../models/learning/Certificat");
const pdfGenerator = require("../../utils/pdfGenerator");
const NiveauFormation = require("../../models/enums/NiveauFormation");
const Cours = require("../../models/course/Cours");
const NotificationService = require("../notification/NotificationService");

exports.generateIfEligible = async (progression) => {
  const cours = await Cours.findById(progression.cours);
  if (
    ![
      NiveauFormation.BETA,
      NiveauFormation.GAMMA,
      NiveauFormation.DELTA,
    ].includes(cours.niveau)
  )
    return null;
  const url = await pdfGenerator.generateCertificate(
    progression.apprenant,
    cours
  );
  const cert = new Certificat({
    apprenant: progression.apprenant,
    cours: progression.cours,
    urlCertificat: url,
  });
  await cert.save();
  // Send notification
  await NotificationService.create({
    utilisateur: progression.apprenant,
    message: `Certificat pour ${cours.titre} émis!`,
    type: "nouveau_certificat",
  });
  return cert;
};
