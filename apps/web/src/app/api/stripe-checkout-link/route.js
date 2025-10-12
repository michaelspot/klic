import Stripe from "stripe";

export const POST = async (request) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  
  async function handler({ product = 'monthly', redirectURL }) {
    try {
      // Fonction pour obtenir les données de prix selon le plan
      const getPriceData = (product) => {
        switch (product) {
          case 'weekly':
            return {
              currency: 'eur',
              product_data: { name: 'Plan Hebdomadaire Premium' },
              recurring: { interval: 'week' },
              unit_amount: 499, // 4,99€
            };
          case 'monthly':
            return {
              currency: 'eur',
              product_data: { name: 'Plan Mensuel Premium' },
              recurring: { interval: 'month' },
              unit_amount: 999, // 9,99€
            };
          case 'lifetime':
            return {
              currency: 'eur',
              product_data: { name: 'Plan À Vie Premium' },
              unit_amount: 10000, // 100€
            };
          default:
            return {
              currency: 'eur',
              product_data: { name: 'Plan Mensuel Premium' },
              recurring: { interval: 'month' },
              unit_amount: 999, // 9,99€
            };
        }
      };

      const priceData = getPriceData(product);
      if (!priceData) {
        return new Response('Invalid product', { status: 400 });
      }

      // Configuration de la session Stripe
      const sessionConfig = {
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: priceData,
            quantity: 1,
          },
        ],
        mode: product === 'lifetime' ? "payment" : "subscription",
        success_url: `${redirectURL}?session_id={CHECKOUT_SESSION_ID}&status=success`,
        cancel_url: `${redirectURL}?status=cancelled`,
        allow_promotion_codes: true,
      };

      // Si ce n'est pas le plan à vie, ajouter un essai gratuit
      if (product !== 'lifetime') {
        sessionConfig.subscription_data = {
          trial_period_days: 3,
        };
      }

      const session = await stripe.checkout.sessions.create(sessionConfig);

      return { url: session.url };
    } catch (error) {
      console.error('Erreur création session Stripe:', error);
      return new Response('Erreur lors de la création de la session de paiement', { status: 500 });
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