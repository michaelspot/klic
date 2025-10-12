import Stripe from "stripe";

export const POST = async (request) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  
  async function handler({ sessionId, email }) {
    try {
      if (sessionId) {
        // Vérifier le statut d'une session spécifique
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        if (session.payment_status === 'paid') {
          // Si c'est un paiement unique (lifetime)
          if (session.mode === 'payment') {
            return {
              status: 'active',
              type: 'lifetime',
              sessionId: sessionId
            };
          }
          
          // Si c'est un abonnement
          if (session.mode === 'subscription' && session.subscription) {
            const subscription = await stripe.subscriptions.retrieve(session.subscription);
            return {
              status: subscription.status,
              type: 'subscription',
              subscription: {
                id: subscription.id,
                status: subscription.status,
                current_period_start: subscription.current_period_start,
                current_period_end: subscription.current_period_end,
                trial_end: subscription.trial_end,
                plan: subscription.items.data[0]?.price?.recurring?.interval || 'unknown'
              }
            };
          }
        }
        
        return {
          status: 'inactive',
          message: 'Payment not completed'
        };
      }
      
      // Pour une vérification générale sans sessionId
      return {
        status: 'inactive',
        message: 'No active subscription found'
      };
      
    } catch (error) {
      console.error('Erreur vérification statut Stripe:', error);
      return {
        status: 'error',
        message: 'Erreur lors de la vérification du statut'
      };
    }
  }

  let data = {};
  try {
    data = await request.json();
  } catch {
    // no-op
  }
  
  const result = await handler(data, request);
  if (result instanceof Response) {
    return result;
  }
  return Response.json(result === undefined ? {} : result);
};