export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat('pt-BR').format(d)
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(d)
}

export function toBrazilDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day, 12, 0, 0, 0)
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  return `${hours}:${minutes}`
}

export function generateTimeSlots(startHour: number = 8, endHour: number = 20, interval: number = 30): string[] {
  const slots: string[] = []
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const h = hour.toString().padStart(2, '0')
      const m = minute.toString().padStart(2, '0')
      slots.push(`${h}:${m}`)
    }
  }
  
  return slots
}

export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + durationMinutes
  const endHours = Math.floor(totalMinutes / 60)
  const endMinutes = totalMinutes % 60
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`
}

export function validateWhatsapp(whatsapp: string): boolean {
  const cleaned = whatsapp.replace(/\D/g, '')
  return cleaned.length >= 10 && cleaned.length <= 13
}

export function formatWhatsapp(whatsapp: string): string {
  const cleaned = whatsapp.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
  }
  return whatsapp
}

export function getMonthName(month: number): string {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  return months[month]
}

export function getDayOfWeek(date: Date): string {
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  return days[date.getDay()]
}

export function extractHoursFromWorkingHours(workingHours: string | null): { startTime: string; endTime: string } {
  if (!workingHours) {
    return { startTime: '08:00', endTime: '20:00' }
  }

  const patterns = [
    /(\d{1,2}):(\d{2})/g,
    /(\d{1,2})h(\d{2})/gi,
    /(\d{1,2})\s*h\b/gi
  ]
  
  const times: { hour: number; min: number }[] = []

  for (const regex of patterns) {
    let match
    while ((match = regex.exec(workingHours)) !== null) {
      const hour = parseInt(match[1] || '8')
      const min = match[2] ? parseInt(match[2]) : 0
      if (hour >= 0 && hour <= 23 && min >= 0 && min <= 59) {
        times.push({ hour, min })
      }
    }
  }

  times.sort((a, b) => (a.hour * 60 + a.min) - (b.hour * 60 + b.min))

  if (times.length >= 2) {
    const start = times[0]
    const end = times[times.length - 1]
    return {
      startTime: `${start.hour.toString().padStart(2, '0')}:${start.min.toString().padStart(2, '0')}`,
      endTime: `${end.hour.toString().padStart(2, '0')}:${end.min.toString().padStart(2, '0')}`
    }
  }

  if (times.length === 1) {
    const start = times[0]
    return {
      startTime: `${start.hour.toString().padStart(2, '0')}:${start.min.toString().padStart(2, '0')}`,
      endTime: '20:00'
    }
  }

  return { startTime: '08:00', endTime: '20:00' }
}

export function extractHoursForDay(workingHours: string | null, dayOfWeek: number): { startTime: string; endTime: string } {
  if (!workingHours) {
    return { startTime: '08:00', endTime: '20:00' }
  }

  const dayMap: Record<string, number> = {
    'domingo': 0, 'dom': 0,
    'segunda': 1, 'seg': 1, '2ª': 1, '2a': 1,
    'terça': 2, 'ter': 2, '3ª': 2, '3a': 2,
    'quarta': 3, 'qua': 3, '4ª': 3, '4a': 3,
    'quinta': 4, 'qui': 4, '5ª': 4, '5a': 4,
    'sexta': 5, 'sex': 5, '6ª': 5, '6a': 5,
    'sábado': 6, 'sab': 6, 'sáb': 6,
  }

  const dayPattern = /domingo|segunda|seg|terça|ter|quarta|qua|quinta|qui|sexta|sex|sábado|sab|sáb|2ª|2a|3ª|3a|4ª|4a|5ª|5a|6ª|6a/gi

  const ranges = workingHours.split('|').map(r => r.trim())
  
  for (const range of ranges) {
    const times: { hour: number; min: number }[] = []
    
    const timeMatches = range.match(/\d{1,2}:\d{2}|\d{1,2}h\d{2}|\d{1,2}\s*h(?=\s|$|[àaás])/gi) || []
    for (const t of timeMatches) {
      const hourMatch = t.match(/(\d{1,2})/)
      const minMatch = t.match(/:(\d{2})|h(\d{2})/)
      if (hourMatch) {
        const hour = parseInt(hourMatch[1])
        let min = 0
        if (minMatch) {
          min = parseInt(minMatch[1] || minMatch[2] || '0')
        }
        if (hour >= 0 && hour <= 23 && min >= 0 && min <= 59) {
          times.push({ hour, min })
        }
      }
    }

    if (times.length < 2) continue

    times.sort((a, b) => (a.hour * 60 + a.min) - (b.hour * 60 + b.min))
    const startTime = `${times[0].hour.toString().padStart(2, '0')}:${times[0].min.toString().padStart(2, '0')}`
    const endTime = `${times[times.length - 1].hour.toString().padStart(2, '0')}:${times[times.length - 1].min.toString().padStart(2, '0')}`

    const dayWords = range.match(dayPattern) || []
    
    for (const word of dayWords) {
      const dayNum = dayMap[word.toLowerCase()]
      if (dayNum === dayOfWeek) {
        return { startTime, endTime }
      }
    }

    if (dayWords.length >= 2) {
      const firstDay = dayMap[dayWords[0]?.toLowerCase() || '']
      const lastDay = dayMap[dayWords[dayWords.length - 1]?.toLowerCase() || '']
      
      if (firstDay !== undefined && lastDay !== undefined) {
        let current = firstDay
        while (true) {
          if (current === dayOfWeek) {
            return { startTime, endTime }
          }
          if (current === lastDay) break
          current = (current + 1) % 7
          if (current === firstDay) break
        }
      }
    }
  }

  return extractHoursFromWorkingHours(workingHours)
}
