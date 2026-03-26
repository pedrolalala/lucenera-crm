import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Calculator,
  Settings,
  ChevronRight,
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

export default function Layout() {
  const location = useLocation()

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projetos', href: '/', icon: FolderKanban },
    {
      name: 'Contatos',
      icon: Users,
      submenu: [
        { name: 'Clientes Finais', href: '/contatos/clientes', icon: UserCircle },
        { name: 'Arquitetos', href: '/contatos/arquitetos', icon: Building2 },
        { name: 'Engenheiros', href: '/contatos/engenheiros', icon: HardHat },
      ],
    },
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
                {navItems.map((item) => {
                  if (item.submenu) {
                    const isActive = item.submenu.some((sub) =>
                      location.pathname.startsWith(sub.href),
                    )
                    return (
                      <Collapsible
                        key={item.name}
                        defaultOpen={isActive}
                        className="group/collapsible"
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip={item.name} isActive={isActive}>
                              <item.icon />
                              <span>{item.name}</span>
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.submenu.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.name}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={location.pathname === subItem.href}
                                  >
                                    <Link to={subItem.href}>
                                      <subItem.icon className="h-4 w-4 shrink-0" />
                                      <span>{subItem.name}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    )
                  }

                  return (
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
                  )
                })}
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
