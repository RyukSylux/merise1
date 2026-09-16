import { pool } from "../PgConnectionPool.js";
import { IAbonnementRepository } from "../../../../../domain/ports/outbound/IAbonnementRepository.js";
import { Abonnement, Formule, StatutAbonnement } from "../../../../../domain/entities/Abonnement.js";

export class PgAbonnementRepository implements IAbonnementRepository {
  async trouverAbonnementActif(
    idUtilisateur: number,
    aLaDate: Date = new Date()
  ): Promise<{ abonnement: Abonnement; formule: Formule } | null> {
    const res = await pool.query(
      `SELECT a.id_abonnement, a.date_debut, a.date_fin, a.statut, a.id_utilisateur, a.id_formule,
              f.libelle, f.tarif_mensuel, f.quota_salle_heures
       FROM abonnement a
       JOIN formule f ON a.id_formule = f.id_formule
       WHERE a.id_utilisateur = $1
         AND a.statut = 'ACTIF'
         AND a.date_debut <= $2
         AND (a.date_fin IS NULL OR a.date_fin >= $2)
       LIMIT 1`,
      [idUtilisateur, aLaDate]
    );

    if (res.rows.length === 0) return null;

    const row = res.rows[0];
    const abonnement = new Abonnement({
      idAbonnement: Number(row.id_abonnement),
      dateDebut: new Date(row.date_debut),
      dateFin: row.date_fin ? new Date(row.date_fin) : null,
      statut: row.statut as StatutAbonnement,
      idUtilisateur: Number(row.id_utilisateur),
      idFormule: Number(row.id_formule),
    });

    const formule = new Formule({
      idFormule: Number(row.id_formule),
      libelle: row.libelle,
      tarifMensuel: Number(row.tarif_mensuel),
      quotaSalleHeures: Number(row.quota_salle_heures),
    });

    return { abonnement, formule };
  }

  async trouverFormuleParId(idFormule: number): Promise<Formule | null> {
    const res = await pool.query(
      `SELECT id_formule, libelle, tarif_mensuel, quota_salle_heures
       FROM formule WHERE id_formule = $1`,
      [idFormule]
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return new Formule({
      idFormule: Number(row.id_formule),
      libelle: row.libelle,
      tarifMensuel: Number(row.tarif_mensuel),
      quotaSalleHeures: Number(row.quota_salle_heures),
    });
  }

  async listerFormules(): Promise<Formule[]> {
    const res = await pool.query(
      `SELECT id_formule, libelle, tarif_mensuel, quota_salle_heures
       FROM formule ORDER BY tarif_mensuel ASC`
    );
    return res.rows.map(
      (r) =>
        new Formule({
          idFormule: Number(r.id_formule),
          libelle: r.libelle,
          tarifMensuel: Number(r.tarif_mensuel),
          quotaSalleHeures: Number(r.quota_salle_heures),
        })
    );
  }
}
