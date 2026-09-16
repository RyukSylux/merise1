import { Atelier, Inscription } from "../../entities/Atelier.js";

export interface IAtelierRepository {
  trouverParId(idAtelier: number): Promise<Atelier | null>;
  trouverParIdPourMiseAJour(idAtelier: number): Promise<Atelier | null>; // SELECT FOR UPDATE
  listerAValider(): Promise<Atelier[]>;
  listerParSite(idSite: number): Promise<Atelier[]>;
  trouverInscription(idUtilisateur: number, idAtelier: number): Promise<Inscription | null>;
  sauvegarderInscription(inscription: Inscription): Promise<Inscription>;
  mettreAJourAtelier(atelier: Atelier): Promise<void>;
  mettreAJourInscription(inscription: Inscription): Promise<void>;
}
