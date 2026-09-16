import { pool } from "../PgConnectionPool.js";
import { IUtilisateurRepository } from "../../../../../domain/ports/outbound/IUtilisateurRepository.js";
import { Utilisateur, UserRole } from "../../../../../domain/entities/Utilisateur.js";

export class PgUtilisateurRepository implements IUtilisateurRepository {
  async trouverParId(idUtilisateur: number): Promise<Utilisateur | null> {
    const res = await pool.query(
      `SELECT id_utilisateur, nom, prenom, email, telephone, role, date_creation, id_societe
       FROM utilisateur WHERE id_utilisateur = $1`,
      [idUtilisateur]
    );
    if (res.rows.length === 0) return null;
    return this.mapToEntity(res.rows[0]);
  }

  async trouverParEmail(email: string): Promise<Utilisateur | null> {
    const res = await pool.query(
      `SELECT id_utilisateur, nom, prenom, email, telephone, role, date_creation, id_societe
       FROM utilisateur WHERE LOWER(email) = LOWER($1)`,
      [email.trim()]
    );
    if (res.rows.length === 0) return null;
    return this.mapToEntity(res.rows[0]);
  }

  async listerParSociete(idSociete: number): Promise<Utilisateur[]> {
    const res = await pool.query(
      `SELECT id_utilisateur, nom, prenom, email, telephone, role, date_creation, id_societe
       FROM utilisateur WHERE id_societe = $1 ORDER BY nom, prenom`,
      [idSociete]
    );
    return res.rows.map((r) => this.mapToEntity(r));
  }

  async sauvegarder(utilisateur: Utilisateur): Promise<Utilisateur> {
    const res = await pool.query(
      `INSERT INTO utilisateur (nom, prenom, email, telephone, role, id_societe)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id_utilisateur, nom, prenom, email, telephone, role, date_creation, id_societe`,
      [
        utilisateur.nom,
        utilisateur.prenom,
        utilisateur.email,
        utilisateur.telephone,
        utilisateur.role,
        utilisateur.idSociete,
      ]
    );
    return this.mapToEntity(res.rows[0]);
  }

  private mapToEntity(row: any): Utilisateur {
    return new Utilisateur({
      idUtilisateur: Number(row.id_utilisateur),
      nom: row.nom,
      prenom: row.prenom,
      email: row.email,
      telephone: row.telephone,
      role: row.role as UserRole,
      dateCreation: new Date(row.date_creation),
      idSociete: row.id_societe ? Number(row.id_societe) : null,
    });
  }
}
