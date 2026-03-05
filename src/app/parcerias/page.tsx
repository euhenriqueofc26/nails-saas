"use client"

// Landing simples para Parcerias (Indique e Ganhe)
export default function ParceriasPage() {
  return (
    <div style={{ padding: '40px 20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: 16 }}>Seja Parceira (Indique e Ganhe)</h1>
      <p style={{ color: '#555', lineHeight: 1.5, maxWidth: 700 }}>
        Junte-se à nossa rede de Nails Designers. Cadastre-se, receba seu código de indicação e ganhe comissão por cada novo assinante indicado.
      </p>
      <form style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }} onSubmit={(e)=>e.preventDefault()}>
        <input placeholder="Nome" style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: 6 }} />
        <input placeholder="Email" style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: 6 }} />
        <button style={{ padding: '12px 16px', borderRadius: 6, background: '#10b981', color: '#fff', border: 'none' }}>
          Quero ser parceira
        </button>
      </form>
      <p style={{ color: '#888', marginTop: 16 }}>Obs: este patch é para manter a presença da landing enquanto a implementação completa é adiada.</p>
    </div>
  )
}
