import { buildContainer } from "./container.js";
import { config } from "../config/env.js";

const { app } = buildContainer();

app.listen(config.port, () => {
  console.log(`
============================================================
  🚀 COWORK'IN BACKEND — ARCHITECTURE HEXAGONALE INITIALISÉE
============================================================
  • Port HTTP          : http://localhost:${config.port}
  • API Base URL       : http://localhost:${config.port}/api/v1
  • Statut             : PRÊT & OPÉRATIONNEL
  • Base de Données    : PostgreSQL (${config.db.host}:${config.db.port}/${config.db.database})
  • Passerelle Paiement: Simulation Console (IPaymentGatewayPort)
  • Service E-mail/SMS : Simulation Console (INotificationServicePort)
============================================================
  Endpoints disponibles :
  - GET  /api/v1/health
  - GET  /api/v1/sites
  - GET  /api/v1/sites/:idSite/postes?debut=...&fin=...
  - GET  /api/v1/sites/:idSite/salles?debut=...&fin=...
  - POST /api/v1/reservations/postes             (UC-01)
  - POST /api/v1/reservations/salles             (UC-02 Quota)
  - POST /api/v1/ateliers/:id/inscriptions      (UC-03 Jauge)
  - DELETE /api/v1/reservations/:id             (UC-04 Annulation)
  - PUT  /api/v1/admin/salles/:id/maintenance
  - GET  /api/v1/admin/sites/:idSite/presences  (Registre Évacuation)
  - POST /api/v1/admin/facturation/cloture      (Facturation Mensuelle)
============================================================
  `);
});
