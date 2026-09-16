import { Facture } from "../../entities/Facture.js";

export interface IFactureRepository {
  trouverParId(idFacture: number): Promise<Facture | null>;
  trouverParReference(reference: string): Promise<Facture | null>;
  listerParUtilisateur(idUtilisateur: number): Promise<Facture[]>;
  listerParSociete(idSociete: number): Promise<Facture[]>;
  sauvegarder(facture: Facture): Promise<Facture>;
}
