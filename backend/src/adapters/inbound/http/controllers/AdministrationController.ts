import { Request, Response, NextFunction } from "express";
import {
  ISalleMaintenanceUseCase,
  IRegistrePresenceUseCase,
  IFacturationMensuelleUseCase,
} from "../../../../domain/ports/inbound/IAdministrationUseCases.js";
import {
  basculerMaintenanceSchema,
  cloturerFacturationSchema,
} from "../validators/schemas.js";

export class AdministrationController {
  constructor(
    private readonly maintenanceUseCase: ISalleMaintenanceUseCase,
    private readonly registrePresenceUseCase: IRegistrePresenceUseCase,
    private readonly facturationUseCase: IFacturationMensuelleUseCase
  ) {}

  // Mise en / Retrait de maintenance d'une salle
  basculerMaintenance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const idSalle = Number(req.params.id);
      const validated = basculerMaintenanceSchema.parse(req.body);

      const resultat = await this.maintenanceUseCase.executer({
        idSalle,
        estMaintenance: validated.estMaintenance,
      });

      res.status(200).json({
        success: true,
        data: resultat,
      });
    } catch (err) {
      next(err);
    }
  };

  // Registre de présence en temps réel pour évacuation incendie / sécurité
  registrePresences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const idSite = Number(req.params.idSite);
      const presences = await this.registrePresenceUseCase.obtenirPresencesSite(idSite);

      res.status(200).json({
        success: true,
        data: {
          idSite,
          timestamp: new Date().toISOString(),
          nombrePresents: presences.length,
          presents: presences,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  // Clôture mensuelle de la facturation
  cloturerFacturation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = cloturerFacturationSchema.parse(req.body);
      const bilan = await this.facturationUseCase.cloturerMois(validated.annee, validated.mois);

      res.status(200).json({
        success: true,
        data: bilan,
      });
    } catch (err) {
      next(err);
    }
  };
}
