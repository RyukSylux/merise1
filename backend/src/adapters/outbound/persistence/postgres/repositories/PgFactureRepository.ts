import { pool } from "../PgConnectionPool.js";
import { IFactureRepository } from "../../../../../domain/ports/outbound/IFactureRepository.js";
import { Facture, LigneFacture, StatutPaiement } from "../../../../../domain/entities/Facture.js";

export class PgFactureRepository implements IFactureRepository {
  async trouverParId(idFacture: number): Promise<Facture | null> {
    const res = await pool.query(
      `SELECT id_facture, reference, date_emission, montant_ht, montant_tva, montant_ttc, statut_paiement, id_utilisateur, id_societe
       FROM facture WHERE id_facture = $1`,
      [idFacture]
    );
    if (res.rows.length === 0) return null;
    const facture = this.mapToEntity(res.rows[0]);
    facture.lignes.push(...(await this.chargerLignes(idFacture)));
    return facture;
  }

  async trouverParReference(reference: string): Promise<Facture | null> {
    const res = await pool.query(
      `SELECT id_facture, reference, date_emission, montant_ht, montant_tva, montant_ttc, statut_paiement, id_utilisateur, id_societe
       FROM facture WHERE reference = $1`,
      [reference]
    );
    if (res.rows.length === 0) return null;
    const facture = this.mapToEntity(res.rows[0]);
    facture.lignes.push(...(await this.chargerLignes(facture.idFacture!)));
    return facture;
  }

  async listerParUtilisateur(idUtilisateur: number): Promise<Facture[]> {
    const res = await pool.query(
      `SELECT id_facture, reference, date_emission, montant_ht, montant_tva, montant_ttc, statut_paiement, id_utilisateur, id_societe
       FROM facture WHERE id_utilisateur = $1 ORDER BY date_emission DESC`,
      [idUtilisateur]
    );
    const factures = res.rows.map((r) => this.mapToEntity(r));
    for (const f of factures) {
      f.lignes.push(...(await this.chargerLignes(f.idFacture!)));
    }
    return factures;
  }

  async listerParSociete(idSociete: number): Promise<Facture[]> {
    const res = await pool.query(
      `SELECT id_facture, reference, date_emission, montant_ht, montant_tva, montant_ttc, statut_paiement, id_utilisateur, id_societe
       FROM facture WHERE id_societe = $1 ORDER BY date_emission DESC`,
      [idSociete]
    );
    const factures = res.rows.map((r) => this.mapToEntity(r));
    for (const f of factures) {
      f.lignes.push(...(await this.chargerLignes(f.idFacture!)));
    }
    return factures;
  }

  async sauvegarder(facture: Facture): Promise<Facture> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const res = await client.query(
        `INSERT INTO facture (reference, date_emission, montant_ht, montant_tva, montant_ttc, statut_paiement, id_utilisateur, id_societe)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id_facture`,
        [
          facture.reference,
          facture.dateEmission,
          facture.montantHt,
          facture.montantTva,
          facture.montantTtc,
          facture.statutPaiement,
          facture.idUtilisateur,
          facture.idSociete,
        ]
      );

      const idFacture = Number(res.rows[0].id_facture);

      for (const ligne of facture.lignes) {
        await client.query(
          `INSERT INTO ligne_facture (id_facture, num_ligne, description, quantite, prix_unitaire_ht, montant_ht, id_reservation)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            idFacture,
            ligne.numLigne,
            ligne.description,
            ligne.quantite,
            ligne.prixUnitaireHt,
            ligne.montantHt,
            ligne.idReservation,
          ]
        );
      }

      await client.query("COMMIT");
      return (await this.trouverParId(idFacture))!;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  private async chargerLignes(idFacture: number): Promise<LigneFacture[]> {
    const res = await pool.query(
      `SELECT id_facture, num_ligne, description, quantite, prix_unitaire_ht, montant_ht, id_reservation
       FROM ligne_facture WHERE id_facture = $1 ORDER BY num_ligne ASC`,
      [idFacture]
    );
    return res.rows.map(
      (r) =>
        new LigneFacture({
          idFacture: Number(r.id_facture),
          numLigne: Number(r.num_ligne),
          description: r.description,
          quantite: Number(r.quantite),
          prixUnitaireHt: Number(r.prix_unitaire_ht),
          montantHt: Number(r.montant_ht),
          idReservation: r.id_reservation ? Number(r.id_reservation) : null,
        })
    );
  }

  private mapToEntity(row: any): Facture {
    return new Facture({
      idFacture: Number(row.id_facture),
      reference: row.reference,
      dateEmission: new Date(row.date_emission),
      montantHt: Number(row.montant_ht),
      montantTva: Number(row.montant_tva),
      montantTtc: Number(row.montant_ttc),
      statutPaiement: row.statut_paiement as StatutPaiement,
      idUtilisateur: row.id_utilisateur ? Number(row.id_utilisateur) : null,
      idSociete: row.id_societe ? Number(row.id_societe) : null,
    });
  }
}
