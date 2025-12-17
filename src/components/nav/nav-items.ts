import DashboardIcon from '../icons/dashboard-icon';
import TicketIcon from '../icons/ticket-icon';
import ChatIcon from '../icons/chat-icon';
import SimulatorIcon from '../icons/simulator-icon';
import UserIcon from '../icons/user-icon';

import type { ComponentType } from 'react';

export type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { href: '/tickets', label: 'Tickets', icon: TicketIcon },
  { href: '/chat', label: 'Chat & Assistente Virtual', icon: ChatIcon },
  { href: '/user', label: 'User', icon: UserIcon },
  { href: '/simulator', label: 'Simulador de Planos', icon: SimulatorIcon },
];
