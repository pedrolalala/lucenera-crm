import { Calculator } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Orcamentos() {
  return (
    <div className="flex-1 space-y-4 pt-2">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Orçamentos</h2>
      </div>

      <Card className="border-dashed shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Módulo de Orçamentos
          </CardTitle>
          <CardDescription>
            Área reservada para a gestão de orçamentos, integrações financeiras e propostas
            comerciais.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Calculator className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold tracking-tight">Em Desenvolvimento</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-[400px]">
              Este módulo será liberado em breve, permitindo criar, enviar e gerenciar todos os
              orçamentos dos seus projetos diretamente pelo CRM.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
