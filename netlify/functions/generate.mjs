export default async (req) => {
  // Autoriser uniquement les requêtes POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Méthode non autorisée" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    const { product, price, description, type } = await req.json();

    // Vérifier la clé API
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "La clé OPENAI_API_KEY n'est pas configurée."
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Construire la demande à l'IA
    const prompt = `
Tu es un expert en marketing digital et en vente pour le marché francophone africain.

Produit : ${product}
Prix : ${price}
Description : ${description}
Type de contenu demandé : ${type}

Crée un contenu professionnel, convaincant, simple et adapté aux clients africains.

Le contenu doit être directement utilisable par le vendeur.
Évite les explications inutiles.
`;

    // Appel à l'API OpenAI
    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-5.6-luna",
          input: prompt
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: data.error?.message || "Erreur OpenAI"
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Récupérer le texte généré
    let result = "";

    if (data.output) {
      for (const item of data.output) {
        if (item.content) {
          for (const content of item.content) {
            if (content.type === "output_text") {
              result += content.text;
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        result: result || "Aucun contenu généré."
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Une erreur est survenue : " + error.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
