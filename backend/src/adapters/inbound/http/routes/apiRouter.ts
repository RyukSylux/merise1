import { Router } from "express";
import { ReservationController } from "../controllers/ReservationController.js";
import { AtelierController } from "../controllers/AtelierController.js";
import { AdministrationController } from "../controllers/AdministrationController.js";
import { CatalogueController } from "../controllers/CatalogueController.js";
import { authMiddleware, requireRole } from "../middlewares/authMiddleware.js";

export function createApiRouter(
  reservationController: ReservationController,
  atelierController: AtelierController,
  adminController: AdministrationController,
  catalogueController: CatalogueController
): Router {
  const router = Router();

  // Route de santé / ping
  router.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString(), architecture: "Hexagonal" });
  });

  // --- CATALOGUE & CONSULTATION PUBLIQUE / COWORKER ---
  router.get("/sites", catalogueController.listerSites);
  router.get("/sites/:idSite/postes", catalogueController.listerPostesDisponibles);
  router.get("/sites/:idSite/salles", catalogueController.listerSallesDisponibles);
  router.get("/ateliers", atelierController.listerAteliers);

  // --- ROUTES AVEC AUTHENTIFICATION ---
  router.use(authMiddleware);

  // Cas d'usage Réservations
  router.get("/reservations/mes-reservations", reservationController.mesReservations);
  router.post("/reservations/postes", reservationController.reserverPoste); // UC-01
  router.post("/reservations/salles", reservationController.reserverSalle); // UC-02
  router.delete("/reservations/:id", reservationController.annulerReservation); // UC-04

  // Cas d'usage Ateliers
  router.post("/ateliers/:id/inscriptions", atelierController.inscrire); // UC-03

  // --- ROUTES ADMINISTRATION / SÉCURITÉ ---
  // Réservées au gérant ou à l'équipe d'accueil (Hôte)
  router.put(
    "/admin/salles/:id/maintenance",
    requireRole("GERANT", "HOTE"),
    adminController.basculerMaintenance
  );
  router.get(
    "/admin/sites/:idSite/presences",
    requireRole("GERANT", "HOTE"),
    adminController.registrePresences
  );
  router.post(
    "/admin/facturation/cloture",
    requireRole("GERANT"),
    adminController.cloturerFacturation
  );

  return router;
}
