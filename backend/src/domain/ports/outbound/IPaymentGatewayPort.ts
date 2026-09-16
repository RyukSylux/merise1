export interface PaymentRequest {
  montant: number; // en euros
  emailClient: string;
  description: string;
  referenceCommande: string;
}

export interface PaymentResponse {
  succes: boolean;
  transactionId: string;
  message: string;
}

export interface RefundRequest {
  transactionId: string;
  montantARembourser: number;
  motif: string;
}

export interface IPaymentGatewayPort {
  debiter(requete: PaymentRequest): Promise<PaymentResponse>;
  rembourser(requete: RefundRequest): Promise<PaymentResponse>;
}
