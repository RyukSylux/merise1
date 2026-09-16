import express, { Express } from "express";
import { createApiRouter } from "./routes/apiRouter.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { ReservationController } from "./controllers/ReservationController.js";
import { AtelierController } from "./controllers/AtelierController.js";
import { AdministrationController } from "./controllers/AdministrationController.js";
import { CatalogueController } from "./controllers/CatalogueController.js";

export function createServer(
  reservationController: ReservationController,
  atelierController: AtelierController,
  adminController: AdministrationController,
  catalogueController: CatalogueController
): Express {
  const app = express();

  app.use(express.json());

  // En-têtes CORS simplifiés
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user-id, x-user-role, x-societe-id");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  const apiRouter = createApiRouter(
    reservationController,
    atelierController,
    adminController,
    catalogueController
  );

  app.use("/api/v1", apiRouter);

  // Middleware global de gestion des erreurs
  app.use(errorHandler);

  return app;
}
