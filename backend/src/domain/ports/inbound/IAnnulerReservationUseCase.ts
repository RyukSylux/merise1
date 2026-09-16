export interface AnnulerReservationCommand {
  idReservation: number;
  idUtilisateurDemandeur: number; // Pour vérifier les droits du coworker
  estAdminOuHote?: boolean;
}

export interface AnnulerReservationResult {
  idReservation: number;
  statut: string;
  penaliteAppliquee: boolean;
  montantRembourse: number;
  montantPenalite: number;
  message: string;
}

export interface IAnnulerReservationUseCase {
  executer(command: AnnulerReservationCommand): Promise<AnnulerReservationResult>;
}
