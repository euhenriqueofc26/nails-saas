import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || '')

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.clubnailsbrasil.com.br'
  const resetLink = `${baseUrl}/reset-password?token=${token}`

  const { error } = await resend.emails.send({
    from: 'ClubNailsBrasil <noreply@clubnailsbrasil.com.br>',
    to: email,
    subject: 'Recuperação de senha - ClubNailsBrasil',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: #e11d48; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 20px;">ClubNailsBrasil</h1>
        </div>
        <div style="background: #fff; padding: 32px; border: 1px solid #e5e7eb; border-top: 0; border-radius: 0 0 12px 12px;">
          <p style="color: #374151; font-size: 16px;">Olá ${name},</p>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova senha:
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetLink}" style="background: #e11d48; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Redefinir senha
            </a>
          </div>
          <p style="color: #6b7280; font-size: 12px; line-height: 1.5;">
            Este link expira em 1 hora. Se você não solicitou esta recuperação, ignore este email.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">
            ClubNailsBrasil - Sua plataforma de gestão para nail designers
          </p>
        </div>
      </div>
    `,
  })

  if (error) {
    console.error('Resend error:', error)
    throw new Error('Falha ao enviar email')
  }
}
