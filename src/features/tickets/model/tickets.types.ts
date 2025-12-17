export type TicketPriority = 'Baixa' | 'Média' | 'Alta' | 'Urgente';
export type TicketStatus = 'Aberto' | 'Em andamento' | 'Fechado';

export type Ticket = {
  id: string;
  ticketId?: string;
  client: string;
  email: string;
  subject: string;
  priority: TicketPriority;
  status: TicketStatus;
  responsible: string;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
};

export type TicketPaginated = {
  items: Ticket[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type CreateTicketInput = {
  ticketId: string;
  client: string;
  email: string;
  subject: string;
  priority: TicketPriority;
  status: TicketStatus;
  responsible: string;
};

export type UpdateTicketInput = Partial<CreateTicketInput>;

export type ListTicketsParams = {
  page: number;
  pageSize: number;
  q?: string;
  status?: 'all' | TicketStatus;
  priority?: 'all' | TicketPriority;
  responsible?: 'all' | string;
};
