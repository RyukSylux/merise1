export interface NotificationPayload {
  destinataireEmail: string;
  destinataireTelephone?: string | null;
  sujet: string;
  contenu: string;
  type: "CONFIRMATION_RESERVATION" | "ANNULATION_RESERVATION" | "INSCRIPTION_ATELIER" | "FACTURE_DISPONIBLE";
}

export interface INotificationServicePort {
  envoyerNotification(notification: NotificationPayload): Promise<void>;
}
