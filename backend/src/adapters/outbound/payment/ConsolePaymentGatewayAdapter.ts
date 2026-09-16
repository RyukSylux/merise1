import {
  IPaymentGatewayPort,
  PaymentRequest,
  PaymentResponse,
  RefundRequest,
} from "../../../domain/ports/outbound/IPaymentGatewayPort.js";

export class ConsolePaymentGatewayAdapter implements IPaymentGatewayPort {
  async debiter(requete: PaymentRequest): Promise<PaymentResponse> {
    const txId = `SIM_TX_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    console.log(`\n💳 [SIMULATION PAIEMENT PSP] ==========`);
    console.log(`   Client       : ${requete.emailClient}`);
    console.log(`   Montant débité: ${requete.montant.toFixed(2)} €`);
    console.log(`   Description  : ${requete.description}`);
    console.log(`   Réf Commande : ${requete.referenceCommande}`);
    console.log(`   TransactionID: ${txId} (Statut: SUCCÈS)`);
    console.log(`==========================================\n`);

    return {
      succes: true,
      transactionId: txId,
      message: "Paiement simulé avec succès.",
    };
  }

  async rembourser(requete: RefundRequest): Promise<PaymentResponse> {
    console.log(`\n💸 [SIMULATION REMBOURSEMENT PSP] =======`);
    console.log(`   Transaction  : ${requete.transactionId}`);
    console.log(`   Montant remboursé: ${requete.montantARembourser.toFixed(2)} €`);
    console.log(`   Motif        : ${requete.motif}`);
    console.log(`   Statut       : EFFECTUÉ`);
    console.log(`==========================================\n`);

    return {
      succes: true,
      transactionId: `REF_${Date.now()}`,
      message: "Remboursement simulé avec succès.",
    };
  }
}
