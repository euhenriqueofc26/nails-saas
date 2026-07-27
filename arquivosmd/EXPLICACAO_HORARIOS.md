# Como Funciona a Lógica de Horários do Calendário

## ClubNailsBrasil

---

Olá! Entendemos que pode haver dúvidas sobre como os horários são exibidos no calendário de agendamento. Por isso, preparamos esta explicação clara e transparente.

---

## Explicação Simple

Quando você configura seu horário de funcionamento, por exemplo:

> **Sáb: 08:00 às 16:00**

E você oferece serviços de **60 minutos** de duração, o último horário disponível para agendamento será **15:00** — e não 16:00.

**Mas por quê?**

---

## A Lógica Por Trás

A plataforma garante que o seu serviço termine **ANTES** do horário de encerramento.

### Exemplo Prático:

| Horário Escolhido | Serviço Termina | Dentro do Expediente? |
|-------------------|-----------------|-----------------------|
| 15:00 | 16:00 | ✅ Sim |
| 15:30 | 16:30 | ❌ Não |
| 16:00 | 17:00 | ❌ Não |

**Se oferecêssemos o horário de 16:00**, a cliente agendaria, mas o serviço terminaria às **17:00** — **1 hora depois** do seu fechamento.

---

## Por Que Isso É Importante?

### Para Você (Profissional)
- ✅ Garante que você encerre no horário previsto
- ✅ Evita trabalhar além do expediente
- ✅ Proteção contra imprevistos

### Para a Cliente
- ✅ Sabe exatamente quando o serviço termina
- ✅ Não há surpresas no final
- ✅ Experiência transparente e confiável

---

## Exemplo Real

Vamos supor que você trabalha:

> **Sáb: 08:00 às 16:00**

E oferece um serviço de **60 minutos**:

```
08:00 → 09:00 ✅
08:30 → 09:30 ✅
...
14:30 → 15:30 ✅
15:00 → 16:00 ✅
15:30 → 16:30 ❌ (não aparece)
16:00 → 17:00 ❌ (não aparece)
```

Os horários最后 (15:30 e 16:00) **não aparecem** porque o serviço ultrapassaria seu horário de funcionamento.

---

## Resumo

| O Que Você Configura | O Que a Cliente Vê |
|---------------------|---------------------|
| Horário de encerramento | Último horário = encerramento - duração do serviço |
| Ex: 16:00 | Ex: 15:00 (se serviço = 60min) |

---

## Conclusão

Essa lógica **protege tanto você quanto sua cliente**. Você garante que trabalha dentro do horário configurado, e sua cliente sabe exatamente quando o serviço vai terminar.

É transparência e respeito com o seu tempo e o dela.

---

**ClubNailsBrasil**
*Transformando a gestão de nail designers no Brasil*

---

Em caso de dúvidas, estamos à disposição! 💅
