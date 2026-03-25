import { Outlet, Link, useLocation } from 'react-router-dom'
import { FolderKanban, Menu } from 'lucide-react'
import logoUrl from '@/assets/img_0775-2f8f9.jpeg'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'

export default function Layout() {
  const location = useLocation()

  const navItems = [{ name: 'Projetos', href: '/', icon: FolderKanban }]

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6 shadow-sm">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden shrink-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu de navegação</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 sm:max-w-xs">
            <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
            <nav className="grid gap-2 text-lg font-medium mt-6">
              <Link to="/" className="flex items-center gap-3 mb-6 px-2">
                <img
                  src={logoUrl}
                  alt="Lucenera"
                  className="h-8 object-contain mix-blend-multiply"
                />
                <span className="font-bold text-xl tracking-tight text-slate-900">CRM</span>
              </Link>
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-4 px-3 py-2.5 rounded-md transition-colors',
                    location.pathname === item.href
                      ? 'bg-slate-100 text-foreground font-semibold'
                      : 'text-muted-foreground hover:bg-slate-50 hover:text-foreground',
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link to="/" className="flex items-center gap-3 mr-6 hidden md:flex shrink-0">
          <img src={logoUrl} alt="Lucenera" className="h-8 object-contain mix-blend-multiply" />
          <span className="font-bold text-xl tracking-tight text-slate-900">CRM</span>
        </Link>

        <nav className="hidden md:flex flex-1 items-center gap-2 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'transition-colors flex items-center gap-2 px-3 py-2 rounded-md',
                location.pathname === item.href
                  ? 'bg-slate-100 text-foreground font-semibold'
                  : 'text-foreground/60 hover:bg-slate-50 hover:text-foreground',
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.name}
            </Link>
          ))}
        </nav>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-[1400px] mx-auto w-full">
        <Outlet />
      </main>
    </div>
  )
}
