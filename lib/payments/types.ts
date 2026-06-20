export interface PaymentProvider {
  name: string;
  createSubscription(params: {
    userId: string;
    userEmail: string;
    userName: string;
  }): Promise<{ checkoutUrl: string; subscriptionId: string }>;
  createOneTimePayment(params: {
    userId: string;
    userEmail: string;
    userName: string;
  }): Promise<{ checkoutUrl: string; preferenceId: string }>;
  cancelSubscription(subscriptionId: string): Promise<void>;
}
