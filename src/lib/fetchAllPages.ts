// O PostgREST do projeto corta qualquer resposta em 1000 linhas (db-max-rows),
// mesmo com `.limit()` maior no codigo e sem aviso. Listas com mais de 1000
// registros (ex.: 2.918 clientes) perdem sempre os mesmos do fim da ordenacao.
// Esta funcao busca em paginas de 1000 ate acabar.
const PAGE_SIZE = 1000

export async function fetchAllPages<T>(
  buildQuery: (
    from: number,
    to: number,
  ) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<{ data: T[]; error: { message: string } | null }> {
  const all: T[] = []
  let from = 0
  for (;;) {
    const { data, error } = await buildQuery(from, from + PAGE_SIZE - 1)
    if (error) return { data: all, error }
    if (!data || data.length === 0) break
    all.push(...data)
    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }
  return { data: all, error: null }
}
