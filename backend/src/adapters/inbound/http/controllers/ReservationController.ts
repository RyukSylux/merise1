import { Request, Response, NextFunction } from "express";
import { IReserverPosteUseCase } from "../../../../domain/ports/inbound/IReserverPosteUseCase.js";
import { IReserverSalleUseCase } from "../../../../domain/ports/inbound/IReserverSalleUseCase.js";
import { IAnnulerReservationUseCase } from "../../../../domain/ports/inbound/IAnnulerReservationUseCase.js";
import { IReservationRepository } from "../../../../domain/ports/outbound/IReservationRepository.js";
import {
  reserverPosteSchema,
  reserverSalleSchema,
  annulerReservationSchema,
} from "../validators/schemas.js";

export class ReservationController {
  constructor(
    private readonly reserverPosteUseCase: IReserverPosteUseCase,
    private readonly reserverSalleUseCase: IReserverSalleUseCase,
    private readonly annulerReservationUseCase: IAnnulerReservationUseCase,
    private readonly reservationRepo: IReservationRepository
  ) {}

  // UC-01 : Réserver un poste de travail
  reserverPoste = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = reserverPosteSchema.parse(req.body);
      const idUtilisateur = req.user!.idUtilisateur;

      const resultat = await this.reserverPosteUseCase.executer({
        idUtilisateur,
        idPoste: validated.idPoste,
        dateHeureDebut: new Date(validated.dateHeureDebut),
        dateHeureFin: new Date(validated.dateHeureFin),
      });

      res.status(201).json({
        success: true,
        data: resultat,
      });
    } catch (err) {
      next(err);
    }
  };

  // UC-02 : Réserver une salle de réunion (avec décompte de quota)
  reserverSalle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = reserverSalleSchema.parse(req.body);
      const idUtilisateur = req.user!.idUtilisateur;

      const resultat = await this.reserverSalleUseCase.executer({
        idUtilisateur,
        idSalle: validated.idSalle,
        dateHeureDebut: new Date(validated.dateHeureDebut),
        dateHeureFin: new Date(validated.dateHeureFin),
      });

      res.status(201).json({
        success: true,
        data: resultat,
      });
    } catch (err) {
      next(err);
    }
  };

  // UC-04 : Annuler une réservation
  annulerReservation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const idReservation = Number(req.params.id);
      const validated = annulerReservationSchema.parse({ idReservation });
      const idUtilisateurDemandeur = req.user!.idUtilisateur;
      const estAdminOuHote = ["GERANT", "HOTE"].includes(req.user!.role);

      const resultat = await this.annulerReservationUseCase.executer({
        idReservation: validated.idReservation,
        idUtilisateurDemandeur,
        estAdminOuHote,
      });

      res.status(200).json({
        success: true,
        data: resultat,
      });
    } catch (err) {
      next(err);
    }
  };

  // Consulter mes réservations
  mesReservations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const idUtilisateur = req.user!.idUtilisateur;
      const reservations = await this.reservationRepo.trouverParUtilisateur(idUtilisateur);
      res.status(200).json({
        success: true,
        data: reservations,
      });
    } catch (err) {
      next(err);
    }
  };
}
