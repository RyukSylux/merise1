export interface ReserverSalleCommand {
  idUtilisateur: number;
  idSalle: number;
  dateHeureDebut: Date;
  dateHeureFin: Date;
}

export interface ReserverSalleResult {
  idReservation: number;
  nomSalle: string;
  dateHeureDebut: Date;
  dateHeureFin: Date;
  dureeHeures: number;
  heuresImputeesQuota: number;
  heuresPayantes: number;
  montantTotal: number;
  quotaRestantApres: number;
  statut: string;
}

export interface IReserverSalleUseCase {
  executer(command: ReserverSalleCommand): Promise<ReserverSalleResult>;
}
