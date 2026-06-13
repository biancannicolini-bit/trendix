export interface PaymentProvider {
  name: string;
  createSubscription(params: {
    userId: string;
    userEmail: string;
    userName: string;
  }): Promise<{ checkoutUrl: string; subscriptionId: string }>;
  cancelSubscription(subscriptionId: string): Promise<void>;
}
