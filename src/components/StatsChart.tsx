import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { PokemonStatChartPoint } from '../types/pokemon'

interface StatsChartProps {
  data: PokemonStatChartPoint[]
}

/**
 * Gráfico de barras de las stats base. Usa las variables CSS del tema para que se
 * adapte al modo claro y oscuro.
 */
export default function StatsChart({ data }: StatsChartProps) {
  if (!data || data.length === 0) {
    return <div className="stats-chart-empty">No hay estadísticas para mostrar.</div>
  }

  return (
    <div className="stats-chart-wrapper">
      <h2>Estadísticas</h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 16, right: 12, left: 0, bottom: 12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="name" tick={{ fill: 'var(--text)', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'var(--text)', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value) => [value as number, 'Valor']}
            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
          />
          <Bar dataKey="value" fill="var(--accent)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
