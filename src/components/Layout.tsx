import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderKanban,
  Calculator,
  Settings,
  UserCircle,
  Building2,
  HardHat,
} from 'lucide-react'
import logoUrl from '@/assets/img_0775-2f8f9.jpeg'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'

export default function Layout() {
  const location = useLocation()

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Projetos', href: '/projetos', icon: FolderKanban },
    { name: 'Clientes', href: '/contatos/clientes', icon: UserCircle },
    { name: 'Arquitetos', href: '/contatos/arquitetos', icon: Building2 },
    { name: 'Engenheiros', href: '/contatos/engenheiros', icon: HardHat },
    { name: 'Orçamentos', href: '/orcamentos', icon: Calculator },
    { name: 'Configurações', href: '/configuracoes', icon: Settings },
  ]

  return (
    <SidebarProvider>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader className="flex h-16 items-center border-b px-4 justify-center">
          <Link to="/" className="flex items-center gap-3 w-full overflow-hidden">
            <img
              src={logoUrl}
              alt="Lucenera"
              className="h-8 shrink-0 object-contain mix-blend-multiply"
            />
            <span className="font-bold text-xl tracking-tight text-slate-900 group-data-[collapsible=icon]:hidden">
              CRM
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.href}
                      tooltip={item.name}
                    >
                      <Link to={item.href}>
                        <item.icon />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 shadow-sm">
          <SidebarTrigger className="-ml-1" />
        </header>
        <main className="flex-1 p-4 md:p-8 w-full mx-auto max-w-[1400px]">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
