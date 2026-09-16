import {
  INotificationServicePort,
  NotificationPayload,
} from "../../../domain/ports/outbound/INotificationServicePort.js";

export class ConsoleNotificationAdapter implements INotificationServicePort {
  async envoyerNotification(notification: NotificationPayload): Promise<void> {
    const icon =
      notification.type === "CONFIRMATION_RESERVATION"
        ? "📅"
        : notification.type === "ANNULATION_RESERVATION"
        ? "❌"
        : notification.type === "INSCRIPTION_ATELIER"
        ? "🎟️"
        : "📄";

    console.log(`\n${icon} [NOTIFICATION ENVOYÉE — SIMULATION] ===`);
    console.log(`   Type    : ${notification.type}`);
    console.log(`   À       : ${notification.destinataireEmail}`);
    if (notification.destinataireTelephone) {
      console.log(`   SMS     : ${notification.destinataireTelephone}`);
    }
    console.log(`   Sujet   : ${notification.sujet}`);
    console.log(`   Message : ${notification.contenu}`);
    console.log(`==========================================\n`);
  }
}
