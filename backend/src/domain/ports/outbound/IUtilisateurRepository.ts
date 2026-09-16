import { Utilisateur } from "../../entities/Utilisateur.js";

export interface IUtilisateurRepository {
  trouverParId(idUtilisateur: number): Promise<Utilisateur | null>;
  trouverParEmail(email: string): Promise<Utilisateur | null>;
  listerParSociete(idSociete: number): Promise<Utilisateur[]>;
  sauvegarder(utilisateur: Utilisateur): Promise<Utilisateur>;
}
