import { Request, Response, NextFunction } from "express";
import { IInscrireAtelierUseCase } from "../../../../domain/ports/inbound/IInscrireAtelierUseCase.js";
import { IAtelierRepository } from "../../../../domain/ports/outbound/IAtelierRepository.js";
import { inscrireAtelierSchema } from "../validators/schemas.js";

export class AtelierController {
  constructor(
    private readonly inscrireAtelierUseCase: IInscrireAtelierUseCase,
    private readonly atelierRepo: IAtelierRepository
  ) {}

  // Lister les ateliers programmés
  listerAteliers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const idSite = req.query.siteId ? Number(req.query.siteId) : undefined;
      const ateliers = idSite
        ? await this.atelierRepo.listerParSite(idSite)
        : await this.atelierRepo.listerAValider();

      res.status(200).json({
        success: true,
        data: ateliers.map((a) => ({
          idAtelier: a.idAtelier,
          titre: a.titre,
          description: a.description,
          dateHeure: a.dateHeure,
          placesMax: a.placesMax,
          nbInscrits: a.nbInscrits,
          placesRestantes: a.placesRestantes,
          estComplet: a.estComplet,
          tarif: a.tarif,
          idSite: a.idSite,
        })),
      });
    } catch (err) {
      next(err);
    }
  };

  // UC-03 : S'inscrire à un atelier
  inscrire = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const idAtelier = Number(req.params.id);
      inscrireAtelierSchema.parse({ idAtelier });
      const idUtilisateur = req.user!.idUtilisateur;

      const resultat = await this.inscrireAtelierUseCase.executer({
        idUtilisateur,
        idAtelier,
      });

      res.status(201).json({
        success: true,
        data: resultat,
      });
    } catch (err) {
      next(err);
    }
  };
}
