import { pool } from "../PgConnectionPool.js";
import { IAtelierRepository } from "../../../../../domain/ports/outbound/IAtelierRepository.js";
import {
  Atelier,
  Inscription,
  StatutInscription,
} from "../../../../../domain/entities/Atelier.js";

export class PgAtelierRepository implements IAtelierRepository {
  async trouverParId(idAtelier: number): Promise<Atelier | null> {
    const res = await pool.query(
      `SELECT id_atelier, titre, description, date_heure, places_max, nb_inscrits, tarif, id_site
       FROM atelier WHERE id_atelier = $1`,
      [idAtelier]
    );
    if (res.rows.length === 0) return null;
    return this.mapToEntity(res.rows[0]);
  }

  async trouverParIdPourMiseAJour(idAtelier: number): Promise<Atelier | null> {
    // Verrouillage pessimiste FOR UPDATE pour concurrence ACID (RG-06)
    const res = await pool.query(
      `SELECT id_atelier, titre, description, date_heure, places_max, nb_inscrits, tarif, id_site
       FROM atelier WHERE id_atelier = $1 FOR UPDATE`,
      [idAtelier]
    );
    if (res.rows.length === 0) return null;
    return this.mapToEntity(res.rows[0]);
  }

  async listerAValider(): Promise<Atelier[]> {
    const res = await pool.query(
      `SELECT id_atelier, titre, description, date_heure, places_max, nb_inscrits, tarif, id_site
       FROM atelier WHERE date_heure > NOW() ORDER BY date_heure ASC`
    );
    return res.rows.map((r) => this.mapToEntity(r));
  }

  async listerParSite(idSite: number): Promise<Atelier[]> {
    const res = await pool.query(
      `SELECT id_atelier, titre, description, date_heure, places_max, nb_inscrits, tarif, id_site
       FROM atelier WHERE id_site = $1 AND date_heure > NOW() ORDER BY date_heure ASC`,
      [idSite]
    );
    return res.rows.map((r) => this.mapToEntity(r));
  }

  async trouverInscription(idUtilisateur: number, idAtelier: number): Promise<Inscription | null> {
    const res = await pool.query(
      `SELECT id_utilisateur, id_atelier, date_inscription, statut_inscription
       FROM inscription
       WHERE id_utilisateur = $1 AND id_atelier = $2`,
      [idUtilisateur, idAtelier]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return new Inscription({
      idUtilisateur: Number(r.id_utilisateur),
      idAtelier: Number(r.id_atelier),
      dateInscription: new Date(r.date_inscription),
      statutInscription: r.statut_inscription as StatutInscription,
    });
  }

  async sauvegarderInscription(inscription: Inscription): Promise<Inscription> {
    await pool.query(
      `INSERT INTO inscription (id_utilisateur, id_atelier, date_inscription, statut_inscription)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id_utilisateur, id_atelier)
       DO UPDATE SET statut_inscription = EXCLUDED.statut_inscription, date_inscription = EXCLUDED.date_inscription`,
      [
        inscription.idUtilisateur,
        inscription.idAtelier,
        inscription.dateInscription,
        inscription.statutInscription,
      ]
    );
    return inscription;
  }

  async mettreAJourAtelier(atelier: Atelier): Promise<void> {
    await pool.query(
      `UPDATE atelier
       SET nb_inscrits = $1
       WHERE id_atelier = $2`,
      [atelier.nbInscrits, atelier.idAtelier]
    );
  }

  async mettreAJourInscription(inscription: Inscription): Promise<void> {
    await pool.query(
      `UPDATE inscription
       SET statut_inscription = $1
       WHERE id_utilisateur = $2 AND id_atelier = $3`,
      [inscription.statutInscription, inscription.idUtilisateur, inscription.idAtelier]
    );
  }

  private mapToEntity(row: any): Atelier {
    return new Atelier({
      idAtelier: Number(row.id_atelier),
      titre: row.titre,
      description: row.description,
      dateHeure: new Date(row.date_heure),
      placesMax: Number(row.places_max),
      nbInscrits: Number(row.nb_inscrits),
      tarif: Number(row.tarif),
      idSite: Number(row.id_site),
    });
  }
}
