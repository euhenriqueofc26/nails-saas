import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN

function getClient(): MercadoPagoConfig {
  if (!accessToken) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN não configurado')
  }
  return new MercadoPagoConfig({ accessToken })
}

export interface CreatePreferenceParams {
  planSlug: string
  planName: string
  price: number
  userId: string
  email: string
}

export async function createPreference(params: CreatePreferenceParams) {
  const client = getClient()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  const preference = new Preference(client)

  const body = {
    items: [
      {
        id: params.planSlug,
        title: params.planName,
        quantity: 1,
        currency_id: 'BRL',
        unit_price: params.price,
      },
    ],
    payer: { email: params.email },
    external_reference: JSON.stringify({ userId: params.userId, planSlug: params.planSlug }),
    notification_url: `${baseUrl}/api/webhooks/mercadopago`,
    back_urls: {
      success: `${baseUrl}/dashboard?checkout=success`,
      failure: `${baseUrl}/checkout?status=failure`,
      pending: `${baseUrl}/checkout?status=pending`,
    },
    auto_return: 'approved',
  }

  const result = await preference.create({ body })
  return {
    id: result.id,
    initPoint: result.init_point || result.sandbox_init_point,
  }
}

export async function getPayment(paymentId: string) {
  const client = getClient()
  const payment = new Payment(client)
  return payment.get({ id: paymentId })
}
