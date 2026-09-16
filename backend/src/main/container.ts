// Adaptateurs Outbound (Driven)
import { PgReservationRepository } from "../adapters/outbound/persistence/postgres/repositories/PgReservationRepository.js";
import { PgEspaceRepository } from "../adapters/outbound/persistence/postgres/repositories/PgEspaceRepository.js";
import { PgUtilisateurRepository } from "../adapters/outbound/persistence/postgres/repositories/PgUtilisateurRepository.js";
import { PgAbonnementRepository } from "../adapters/outbound/persistence/postgres/repositories/PgAbonnementRepository.js";
import { PgAtelierRepository } from "../adapters/outbound/persistence/postgres/repositories/PgAtelierRepository.js";
import { PgFactureRepository } from "../adapters/outbound/persistence/postgres/repositories/PgFactureRepository.js";
import { PgUnitOfWork } from "../adapters/outbound/persistence/postgres/PgUnitOfWork.js";
import { ConsolePaymentGatewayAdapter } from "../adapters/outbound/payment/ConsolePaymentGatewayAdapter.js";
import { ConsoleNotificationAdapter } from "../adapters/outbound/notification/ConsoleNotificationAdapter.js";

// Cas d'Usage (Application Core)
import { ReserverPosteUseCase } from "../application/use-cases/ReserverPosteUseCase.js";
import { ReserverSalleUseCase } from "../application/use-cases/ReserverSalleUseCase.js";
import { InscrireAtelierUseCase } from "../application/use-cases/InscrireAtelierUseCase.js";
import { AnnulerReservationUseCase } from "../application/use-cases/AnnulerReservationUseCase.js";
import {
  BasculerMaintenanceUseCase,
  ObtenirRegistrePresenceUseCase,
  CloturerFacturationUseCase,
} from "../application/use-cases/AdministrationUseCases.js";

// Adaptateurs Inbound (Driving)
import { ReservationController } from "../adapters/inbound/http/controllers/ReservationController.js";
import { AtelierController } from "../adapters/inbound/http/controllers/AtelierController.js";
import { AdministrationController } from "../adapters/inbound/http/controllers/AdministrationController.js";
import { CatalogueController } from "../adapters/inbound/http/controllers/CatalogueController.js";
import { createServer } from "../adapters/inbound/http/server.js";

export function buildContainer() {
  // 1. Instanciation des Adaptateurs Outbound (Persistance, Paiement, Notification)
  const reservationRepo = new PgReservationRepository();
  const espaceRepo = new PgEspaceRepository();
  const utilisateurRepo = new PgUtilisateurRepository();
  const abonnementRepo = new PgAbonnementRepository();
  const atelierRepo = new PgAtelierRepository();
  const factureRepo = new PgFactureRepository();
  const unitOfWork = new PgUnitOfWork();

  const paymentGateway = new ConsolePaymentGatewayAdapter();
  const notificationService = new ConsoleNotificationAdapter();

  // 2. Instanciation des Cas d'Usage (Injection des dépendances du domaine)
  const reserverPosteUseCase = new ReserverPosteUseCase(
    reservationRepo,
    espaceRepo,
    utilisateurRepo,
    abonnementRepo,
    paymentGateway,
    notificationService
  );

  const reserverSalleUseCase = new ReserverSalleUseCase(
    reservationRepo,
    espaceRepo,
    utilisateurRepo,
    abonnementRepo,
    paymentGateway,
    notificationService
  );

  const inscrireAtelierUseCase = new InscrireAtelierUseCase(
    atelierRepo,
    utilisateurRepo,
    notificationService,
    unitOfWork
  );

  const annulerReservationUseCase = new AnnulerReservationUseCase(
    reservationRepo,
    utilisateurRepo,
    paymentGateway,
    notificationService
  );

  const basculerMaintenanceUseCase = new BasculerMaintenanceUseCase(espaceRepo);
  const obtenirRegistrePresenceUseCase = new ObtenirRegistrePresenceUseCase(reservationRepo);
  const cloturerFacturationUseCase = new CloturerFacturationUseCase(
    reservationRepo,
    utilisateurRepo,
    factureRepo
  );

  // 3. Instanciation des Contrôleurs HTTP Inbound
  const reservationController = new ReservationController(
    reserverPosteUseCase,
    reserverSalleUseCase,
    annulerReservationUseCase,
    reservationRepo
  );

  const atelierController = new AtelierController(
    inscrireAtelierUseCase,
    atelierRepo
  );

  const adminController = new AdministrationController(
    basculerMaintenanceUseCase,
    obtenirRegistrePresenceUseCase,
    cloturerFacturationUseCase
  );

  const catalogueController = new CatalogueController(espaceRepo);

  // 4. Construction de l'Application Express
  const app = createServer(
    reservationController,
    atelierController,
    adminController,
    catalogueController
  );

  return {
    app,
    useCases: {
      reserverPosteUseCase,
      reserverSalleUseCase,
      inscrireAtelierUseCase,
      annulerReservationUseCase,
      basculerMaintenanceUseCase,
      obtenirRegistrePresenceUseCase,
      cloturerFacturationUseCase,
    },
    repositories: {
      reservationRepo,
      espaceRepo,
      utilisateurRepo,
      abonnementRepo,
      atelierRepo,
      factureRepo,
    },
  };
}
