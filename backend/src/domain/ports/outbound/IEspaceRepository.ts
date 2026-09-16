import { Espace, Poste, SalleReunion } from "../../entities/Espace.js";

export interface IEspaceRepository {
  trouverParId(idEspace: number): Promise<Espace | null>;
  trouverSalleParId(idEspace: number): Promise<SalleReunion | null>;
  trouverPosteParId(idEspace: number): Promise<Poste | null>;
  listerPostesDisponibles(idSite: number, debut: Date, fin: Date): Promise<Poste[]>;
  listerSallesDisponibles(idSite: number, debut: Date, fin: Date): Promise<SalleReunion[]>;
  mettreAJourMaintenanceSalle(idEspace: number, estMaintenance: boolean): Promise<void>;
}
