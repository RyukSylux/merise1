import { Request, Response, NextFunction } from "express";
import { IEspaceRepository } from "../../../../domain/ports/outbound/IEspaceRepository.js";
import { pool } from "../../../outbound/persistence/postgres/PgConnectionPool.js";

export class CatalogueController {
  constructor(private readonly espaceRepo: IEspaceRepository) {}

  // Lister les sites
  listerSites = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await pool.query(
        "SELECT id_site, nom, ville, adresse, capacite_max FROM site ORDER BY ville"
      );
      res.status(200).json({
        success: true,
        data: result.rows,
      });
    } catch (err) {
      next(err);
    }
  };

  // Lister les postes disponibles sur un site pour un créneau
  listerPostesDisponibles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const idSite = Number(req.params.idSite);
      const debut = new Date(req.query.debut as string);
      const fin = new Date(req.query.fin as string);

      const postes = await this.espaceRepo.listerPostesDisponibles(idSite, debut, fin);
      res.status(200).json({
        success: true,
        data: postes,
      });
    } catch (err) {
      next(err);
    }
  };

  // Lister les salles de réunion disponibles sur un site pour un créneau
  listerSallesDisponibles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const idSite = Number(req.params.idSite);
      const debut = new Date(req.query.debut as string);
      const fin = new Date(req.query.fin as string);

      const salles = await this.espaceRepo.listerSallesDisponibles(idSite, debut, fin);
      res.status(200).json({
        success: true,
        data: salles,
      });
    } catch (err) {
      next(err);
    }
  };
}
