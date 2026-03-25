import { Outlet, Link, useLocation } from 'react-router-dom'
import { Home, Plus, UserCircle, LogOut } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import useProjectStore from '@/stores/useProjectStore'
import { USERS, UserName } from '@/types'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

export default function Layout() {
  const { pathname } = useLocation()
  const { currentUser, setCurrentUser } = useProjectStore()
  const userRole = USERS.find((u) => u.name === currentUser)?.role

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader className="flex flex-row items-center p-4 h-16">
          <div className="flex items-center gap-3 overflow-hidden w-full px-1">
            <img
              src="/logo.png"
              alt="Lucenera"
              className="h-8 w-auto object-contain shrink-0 group-data-[collapsible=icon]:h-6 transition-all"
              onError={(e) => {
                // Tenta algumas extensões comuns ou cai para um placeholder caso a logo não esteja na raiz
                if (e.currentTarget.src.endsWith('/logo.png')) {
                  e.currentTarget.src = '/lucenera_logo.jpg'
                } else if (e.currentTarget.src.endsWith('/lucenera_logo.jpg')) {
                  e.currentTarget.src = '/logo.jpg'
                } else {
                  e.currentTarget.src =
                    'https://img.usecurling.com/i?q=lightbulb&shape=fill&color=black'
                }
              }}
            />
            <span className="font-extrabold text-2xl tracking-tight text-sidebar-foreground truncate group-data-[collapsible=icon]:hidden mt-0.5">
              CRM
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-2 mt-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/'}>
                <Link to="/">
                  <Home className="h-4 w-4" />
                  <span>Projetos</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/novo'}>
                <Link to="/novo">
                  <Plus className="h-4 w-4" />
                  <span>Novo Projeto</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 overflow-hidden">
            <Avatar className="h-8 w-8 rounded-md bg-primary/10">
              <AvatarFallback className="text-xs text-primary">
                {currentUser.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-sm truncate group-data-[collapsible=icon]:hidden">
              <span className="font-semibold text-sidebar-foreground">{currentUser}</span>
              <span className="text-xs text-sidebar-foreground/70">{userRole}</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background min-h-screen flex flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-6 bg-card/50 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div className="flex items-center gap-2 md:hidden">
              <img
                src="/logo.png"
                alt="Lucenera"
                className="h-6 w-auto object-contain"
                onError={(e) => {
                  if (e.currentTarget.src.endsWith('/logo.png')) {
                    e.currentTarget.src = '/lucenera_logo.jpg'
                  } else if (e.currentTarget.src.endsWith('/lucenera_logo.jpg')) {
                    e.currentTarget.src = '/logo.jpg'
                  } else {
                    e.currentTarget.src =
                      'https://img.usecurling.com/i?q=lightbulb&shape=fill&color=black'
                  }
                }}
              />
              <span className="font-extrabold text-xl tracking-tight">CRM</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <UserCircle className="h-4 w-4 text-muted-foreground" />
                <span className="hidden sm:inline-block">Simular Usuário</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Alternar Usuário</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {USERS.map((user) => (
                <DropdownMenuItem
                  key={user.name}
                  onClick={() => setCurrentUser(user.name as UserName)}
                  className="justify-between"
                >
                  {user.name}
                  <span className="text-xs text-muted-foreground">{user.role}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-4 sm:p-6 md:p-8 animate-fade-in-up">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
