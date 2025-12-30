import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // CORS básico (pra funcionar com seu site)
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  try {
    const { priceId, successUrl, cancelUrl } = req.body || {};

    if (!priceId) return res.status(400).json({ error: "priceId obrigatório" });
    if (!successUrl || !cancelUrl) return res.status(400).json({ error: "successUrl e cancelUrl obrigatórios" });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription", // se for assinatura
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      // sem login: não tem customer_email obrigatório
      // você pode adicionar depois
    });

    return res.status(200).json({ url: session.url });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Erro desconhecido" });
  }
}
