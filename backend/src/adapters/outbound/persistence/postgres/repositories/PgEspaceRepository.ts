import { pool } from "../PgConnectionPool.js";
import { IEspaceRepository } from "../../../../../domain/ports/outbound/IEspaceRepository.js";
import { Espace, Poste, SalleReunion } from "../../../../../domain/entities/Espace.js";

export class PgEspaceRepository implements IEspaceRepository {
  async trouverParId(idEspace: number): Promise<Espace | null> {
    const salle = await this.trouverSalleParId(idEspace);
    if (salle) return salle;
    return await this.trouverPosteParId(idEspace);
  }

  async trouverSalleParId(idEspace: number): Promise<SalleReunion | null> {
    const res = await pool.query(
      `SELECT e.id_espace, e.code, e.etage, e.id_site,
              sr.nom_salle, sr.capacite_personnes, sr.equipements, sr.est_maintenance
       FROM espace e
       JOIN salle_reunion sr ON e.id_espace = sr.id_espace
       WHERE e.id_espace = $1`,
      [idEspace]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return new SalleReunion({
      idEspace: Number(r.id_espace),
      code: r.code,
      etage: Number(r.etage),
      idSite: Number(r.id_site),
      nomSalle: r.nom_salle,
      capacitePersonnes: Number(r.capacite_personnes),
      equipements: r.equipements,
      estMaintenance: Boolean(r.est_maintenance),
    });
  }

  async trouverPosteParId(idEspace: number): Promise<Poste | null> {
    const res = await pool.query(
      `SELECT e.id_espace, e.code, e.etage, e.id_site,
              p.est_electrique, p.a_ecran_externe
       FROM espace e
       JOIN poste p ON e.id_espace = p.id_espace
       WHERE e.id_espace = $1`,
      [idEspace]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return new Poste({
      idEspace: Number(r.id_espace),
      code: r.code,
      etage: Number(r.etage),
      idSite: Number(r.id_site),
      estElectrique: Boolean(r.est_electrique),
      aEcranExterne: Boolean(r.a_ecran_externe),
    });
  }

  async listerPostesDisponibles(idSite: number, debut: Date, fin: Date): Promise<Poste[]> {
    const res = await pool.query(
      `SELECT e.id_espace, e.code, e.etage, e.id_site,
              p.est_electrique, p.a_ecran_externe
       FROM espace e
       JOIN poste p ON e.id_espace = p.id_espace
       WHERE e.id_site = $1
         AND e.id_espace NOT IN (
           SELECT r.id_espace
           FROM reservation r
           WHERE r.statut = 'CONFIRMEE'
             AND r.date_heure_debut < $3
             AND r.date_heure_fin > $2
         )
       ORDER BY e.code`,
      [idSite, debut, fin]
    );
    return res.rows.map(
      (r) =>
        new Poste({
          idEspace: Number(r.id_espace),
          code: r.code,
          etage: Number(r.etage),
          idSite: Number(r.id_site),
          estElectrique: Boolean(r.est_electrique),
          aEcranExterne: Boolean(r.a_ecran_externe),
        })
    );
  }

  async listerSallesDisponibles(idSite: number, debut: Date, fin: Date): Promise<SalleReunion[]> {
    const res = await pool.query(
      `SELECT e.id_espace, e.code, e.etage, e.id_site,
              sr.nom_salle, sr.capacite_personnes, sr.equipements, sr.est_maintenance
       FROM espace e
       JOIN salle_reunion sr ON e.id_espace = sr.id_espace
       WHERE e.id_site = $1
         AND sr.est_maintenance = FALSE
         AND e.id_espace NOT IN (
           SELECT r.id_espace
           FROM reservation r
           WHERE r.statut = 'CONFIRMEE'
             AND r.date_heure_debut < $3
             AND r.date_heure_fin > $2
         )
       ORDER BY sr.nom_salle`,
      [idSite, debut, fin]
    );
    return res.rows.map(
      (r) =>
        new SalleReunion({
          idEspace: Number(r.id_espace),
          code: r.code,
          etage: Number(r.etage),
          idSite: Number(r.id_site),
          nomSalle: r.nom_salle,
          capacitePersonnes: Number(r.capacite_personnes),
          equipements: r.equipements,
          estMaintenance: Boolean(r.est_maintenance),
        })
    );
  }

  async mettreAJourMaintenanceSalle(idEspace: number, estMaintenance: boolean): Promise<void> {
    await pool.query(
      `UPDATE salle_reunion SET est_maintenance = $1 WHERE id_espace = $2`,
      [estMaintenance, idEspace]
    );
  }
}
