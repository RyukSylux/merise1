import { pool } from "../PgConnectionPool.js";
import {
  IReservationRepository,
  PresenceRecord,
} from "../../../../../domain/ports/outbound/IReservationRepository.js";
import {
  Reservation,
  StatutReservation,
} from "../../../../../domain/entities/Reservation.js";

export class PgReservationRepository implements IReservationRepository {
  async trouverParId(idReservation: number): Promise<Reservation | null> {
    const res = await pool.query(
      `SELECT id_reservation, date_heure_debut, date_heure_fin, statut, montant_total, id_utilisateur, id_espace
       FROM reservation WHERE id_reservation = $1`,
      [idReservation]
    );
    if (res.rows.length === 0) return null;
    return this.mapToEntity(res.rows[0]);
  }

  async sauvegarder(reservation: Reservation): Promise<Reservation> {
    const res = await pool.query(
      `INSERT INTO reservation (date_heure_debut, date_heure_fin, statut, montant_total, id_utilisateur, id_espace)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id_reservation, date_heure_debut, date_heure_fin, statut, montant_total, id_utilisateur, id_espace`,
      [
        reservation.dateHeureDebut,
        reservation.dateHeureFin,
        reservation.statut,
        reservation.montantTotal,
        reservation.idUtilisateur,
        reservation.idEspace,
      ]
    );
    return this.mapToEntity(res.rows[0]);
  }

  async mettreAJour(reservation: Reservation): Promise<void> {
    await pool.query(
      `UPDATE reservation
       SET statut = $1, montant_total = $2
       WHERE id_reservation = $3`,
      [reservation.statut, reservation.montantTotal, reservation.idReservation]
    );
  }

  async verifierChevauchement(
    idEspace: number,
    debut: Date,
    fin: Date,
    exclureIdReservation?: number
  ): Promise<boolean> {
    const query = exclureIdReservation
      ? `SELECT 1 FROM reservation
         WHERE id_espace = $1
           AND statut = 'CONFIRMEE'
           AND date_heure_debut < $3
           AND date_heure_fin > $2
           AND id_reservation != $4
         LIMIT 1`
      : `SELECT 1 FROM reservation
         WHERE id_espace = $1
           AND statut = 'CONFIRMEE'
           AND date_heure_debut < $3
           AND date_heure_fin > $2
         LIMIT 1`;

    const params = exclureIdReservation
      ? [idEspace, debut, fin, exclureIdReservation]
      : [idEspace, debut, fin];

    const res = await pool.query(query, params);
    return res.rows.length > 0;
  }

  async verifierChevauchementUtilisateur(
    idUtilisateur: number,
    debut: Date,
    fin: Date,
    exclureIdReservation?: number
  ): Promise<boolean> {
    const query = exclureIdReservation
      ? `SELECT 1 FROM reservation
         WHERE id_utilisateur = $1
           AND statut = 'CONFIRMEE'
           AND date_heure_debut < $3
           AND date_heure_fin > $2
           AND id_reservation != $4
         LIMIT 1`
      : `SELECT 1 FROM reservation
         WHERE id_utilisateur = $1
           AND statut = 'CONFIRMEE'
           AND date_heure_debut < $3
           AND date_heure_fin > $2
         LIMIT 1`;

    const params = exclureIdReservation
      ? [idUtilisateur, debut, fin, exclureIdReservation]
      : [idUtilisateur, debut, fin];

    const res = await pool.query(query, params);
    return res.rows.length > 0;
  }

  async calculerHeuresConsommeesMois(
    idUtilisateur: number,
    annee: number,
    mois: number
  ): Promise<number> {
    // Calcule le cumul des heures de salle de réunion réservées par le coworker sur le mois civil
    const debutMois = new Date(Date.UTC(annee, mois - 1, 1, 0, 0, 0));
    const finMois = new Date(Date.UTC(annee, mois, 1, 0, 0, 0));

    const res = await pool.query(
      `SELECT r.date_heure_debut, r.date_heure_fin
       FROM reservation r
       JOIN salle_reunion sr ON r.id_espace = sr.id_espace
       WHERE r.id_utilisateur = $1
         AND r.statut = 'CONFIRMEE'
         AND r.date_heure_debut >= $2
         AND r.date_heure_debut < $3`,
      [idUtilisateur, debutMois, finMois]
    );

    let totalHeures = 0;
    for (const row of res.rows) {
      const dDebut = new Date(row.date_heure_debut);
      const dFin = new Date(row.date_heure_fin);
      const diffHours = Math.ceil((dFin.getTime() - dDebut.getTime()) / (1000 * 60 * 60));
      totalHeures += diffHours;
    }

    return totalHeures;
  }

  async trouverPresencesActuellesParSite(
    idSite: number,
    aLaDate: Date = new Date()
  ): Promise<PresenceRecord[]> {
    const res = await pool.query(
      `SELECT u.id_utilisateur, u.nom, u.prenom, u.email,
              e.code AS code_espace, e.id_site,
              CASE WHEN sr.id_espace IS NOT NULL THEN 'SALLE' ELSE 'POSTE' END AS type_espace,
              r.date_heure_debut, r.date_heure_fin
       FROM reservation r
       JOIN utilisateur u ON r.id_utilisateur = u.id_utilisateur
       JOIN espace e ON r.id_espace = e.id_espace
       LEFT JOIN salle_reunion sr ON e.id_espace = sr.id_espace
       WHERE e.id_site = $1
         AND r.statut = 'CONFIRMEE'
         AND r.date_heure_debut <= $2
         AND r.date_heure_fin >= $2
       ORDER BY u.nom, u.prenom`,
      [idSite, aLaDate]
    );

    return res.rows.map((r) => ({
      idUtilisateur: Number(r.id_utilisateur),
      nom: r.nom,
      prenom: r.prenom,
      email: r.email,
      codeEspace: r.code_espace,
      typeEspace: r.type_espace as "POSTE" | "SALLE",
      idSite: Number(r.id_site),
      dateHeureDebut: new Date(r.date_heure_debut),
      dateHeureFin: new Date(r.date_heure_fin),
    }));
  }

  async trouverParUtilisateur(idUtilisateur: number): Promise<Reservation[]> {
    const res = await pool.query(
      `SELECT id_reservation, date_heure_debut, date_heure_fin, statut, montant_total, id_utilisateur, id_espace
       FROM reservation
       WHERE id_utilisateur = $1
       ORDER BY date_heure_debut DESC`,
      [idUtilisateur]
    );
    return res.rows.map((r) => this.mapToEntity(r));
  }

  async trouverReservationsNonFactureesDuMois(annee: number, mois: number): Promise<Reservation[]> {
    const debutMois = new Date(Date.UTC(annee, mois - 1, 1, 0, 0, 0));
    const finMois = new Date(Date.UTC(annee, mois, 1, 0, 0, 0));

    const res = await pool.query(
      `SELECT r.id_reservation, r.date_heure_debut, r.date_heure_fin, r.statut, r.montant_total, r.id_utilisateur, r.id_espace
       FROM reservation r
       LEFT JOIN ligne_facture lf ON r.id_reservation = lf.id_reservation
       WHERE lf.id_reservation IS NULL
         AND r.montant_total > 0
         AND r.statut = 'CONFIRMEE'
         AND r.date_heure_debut >= $1
         AND r.date_heure_debut < $2`,
      [debutMois, finMois]
    );
    return res.rows.map((r) => this.mapToEntity(r));
  }

  private mapToEntity(row: any): Reservation {
    return new Reservation({
      idReservation: Number(row.id_reservation),
      dateHeureDebut: new Date(row.date_heure_debut),
      dateHeureFin: new Date(row.date_heure_fin),
      statut: row.statut as StatutReservation,
      montantTotal: Number(row.montant_total),
      idUtilisateur: Number(row.id_utilisateur),
      idEspace: Number(row.id_espace),
    });
  }
}
