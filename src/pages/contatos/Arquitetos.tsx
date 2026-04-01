import { useState, useMemo, useEffect } from 'react'
import { Search, MapPin, Building2, User, Phone, FileText, Info } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'
import { toast } from '@/hooks/use-toast'

type Arquiteto = Database['public']['Tables']['Arquitetos_empresas_crm']['Row']

function ArquitetoDetails({ arquiteto }: { arquiteto: Arquiteto }) {
  const Section = ({ title, icon: Icon, children }: any) => (
    <div>
      <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4" /> {title}
      </h4>
      <div className="bg-muted/30 p-3 rounded-md space-y-2 text-sm">{children}</div>
    </div>
  )
  const Field = ({ label, value }: { label: string; value: any }) => (
    <p>
      <span className="font-medium text-foreground">{label}:</span> {value || '-'}
    </p>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
      <div className="space-y-4">
        <Section title="Dados da Empresa" icon={Building2}>
          <Field label="Empresa" value={arquiteto['Nome da Empresa']} />
          <Field label="Código" value={arquiteto.codigo_do_arquiteto} />
          <Field label="Nº de Arquitetos" value={arquiteto.numero_de_arquitetos} />
        </Section>
        <Section title="Contato" icon={Phone}>
          <Field label="Celular" value={arquiteto.Celular} />
          <Field label="Telefone" value={arquiteto.Telefone} />
          <Field label="Email" value={arquiteto.Email} />
        </Section>
      </div>
      <div className="space-y-4">
        <Section title="Localização" icon={MapPin}>
          <Field label="Endereço" value={arquiteto.endereço} />
          <Field label="Bairro" value={arquiteto.Bairro} />
          <Field
            label="Cidade/UF"
            value={`${arquiteto.Cidade || '-'}${arquiteto.Estado ? ` / ${arquiteto.Estado}` : ''}`}
          />
          <Field label="CEP" value={arquiteto.CEP} />
        </Section>
        <Section title="Documentação" icon={FileText}>
          <Field label="CPF/CNPJ" value={arquiteto['CPF/CNPJ']} />
          <Field label="RG" value={arquiteto.RG} />
          <Field label="Data Nasc." value={arquiteto.data_de_nascimento} />
        </Section>
      </div>
      {arquiteto.Observacoes && (
        <div className="md:col-span-2 mt-2">
          <Section title="Observações" icon={Info}>
            <div className="whitespace-pre-wrap">{arquiteto.Observacoes}</div>
          </Section>
        </div>
      )}
    </div>
  )
}

export default function Arquitetos() {
  const [arquitetos, setArquitetos] = useState<Arquiteto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchCity, setSearchCity] = useState('')
  const [searchState, setSearchState] = useState('')
  const [searchCompany, setSearchCompany] = useState('')
  const [searchName, setSearchName] = useState('')
  const [selectedArquiteto, setSelectedArquiteto] = useState<Arquiteto | null>(null)

  const fetchArquitetos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('Arquitetos_empresas_crm').select('*')
      if (error) throw error

      const sorted = (data || []).sort((a, b) => {
        const nameA = a['Nome do Arquiteto'] || ''
        const nameB = b['Nome do Arquiteto'] || ''
        return nameA.localeCompare(nameB)
      })
      setArquitetos(sorted)
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar arquitetos',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArquitetos()
    const channel = supabase
      .channel('arquitetos_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Arquitetos_empresas_crm' },
        fetchArquitetos,
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const filteredArquitetos = useMemo(() => {
    return arquitetos.filter((a) => {
      const matchCity =
        !searchCity || (a.Cidade?.toLowerCase() || '').includes(searchCity.toLowerCase())
      const matchState =
        !searchState || (a.Estado?.toLowerCase() || '').includes(searchState.toLowerCase())
      const matchCompany =
        !searchCompany ||
        (a['Nome da Empresa']?.toLowerCase() || '').includes(searchCompany.toLowerCase())
      const matchName =
        !searchName ||
        (a['Nome do Arquiteto']?.toLowerCase() || '').includes(searchName.toLowerCase())
      return matchCity && matchState && matchCompany && matchName
    })
  }, [arquitetos, searchCity, searchState, searchCompany, searchName])

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Arquitetos</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Base de arquitetos e empresas parceiras integradas.
        </p>
      </div>

      <div className="bg-card p-5 rounded-lg border shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="pl-9 h-10 bg-background"
            />
          </div>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por empresa..."
              value={searchCompany}
              onChange={(e) => setSearchCompany(e.target.value)}
              className="pl-9 h-10 bg-background"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filtrar por cidade..."
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="pl-9 h-10 bg-background"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filtrar por estado (ex: SP)..."
              value={searchState}
              onChange={(e) => setSearchState(e.target.value)}
              className="pl-9 h-10 bg-background"
            />
          </div>
        </div>

        <div className="rounded-md border bg-card overflow-hidden shadow-subtle">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold">Nome</TableHead>
                <TableHead className="font-semibold">Empresa</TableHead>
                <TableHead className="font-semibold">Contato</TableHead>
                <TableHead className="font-semibold">Cidade/UF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    Carregando arquitetos...
                  </TableCell>
                </TableRow>
              ) : filteredArquitetos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    Nenhum arquiteto encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredArquitetos.map((arquiteto, idx) => (
                  <TableRow
                    key={arquiteto.codigo_do_arquiteto || idx}
                    className="hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedArquiteto(arquiteto)}
                  >
                    <TableCell className="font-medium text-foreground">
                      {arquiteto['Nome do Arquiteto'] || '-'}
                    </TableCell>
                    <TableCell>{arquiteto['Nome da Empresa'] || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">
                          {arquiteto.Celular || arquiteto.Telefone || '-'}
                        </span>
                        {arquiteto.Email && (
                          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {arquiteto.Email}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {arquiteto.Cidade
                        ? `${arquiteto.Cidade}${arquiteto.Estado ? ` - ${arquiteto.Estado}` : ''}`
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog
        open={!!selectedArquiteto}
        onOpenChange={(open) => !open && setSelectedArquiteto(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <User className="h-5 w-5 text-primary" />{' '}
              {selectedArquiteto?.['Nome do Arquiteto'] || 'Detalhes do Arquiteto'}
            </DialogTitle>
            <DialogDescription>Informações completas do arquiteto e empresa.</DialogDescription>
          </DialogHeader>
          {selectedArquiteto && <ArquitetoDetails arquiteto={selectedArquiteto} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
