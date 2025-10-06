import { supabase } from './supabase';
import type {
  Client,
  ClientInsert,
  ClientUpdate,
  User,
  UserInsert,
  ClientTeamAssignment,
  ClientTeamAssignmentInsert,
  MonthlyContentPlan,
  MonthlyContentPlanInsert,
  MonthlyContentPlanUpdate,
  TeamRole,
  ClientWithTeam
} from './database.types';
import { format, addMonths } from 'date-fns';

export async function fetchClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('due_date', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch clients: ${error.message}`);
  }

  return data || [];
}

export async function addClient(client: ClientInsert): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .insert(client)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add client: ${error.message}`);
  }

  return data;
}

export async function updateClient(id: string, updates: ClientUpdate): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update client: ${error.message}`);
  }

  return data;
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete client: ${error.message}`);
  }
}

export async function fetchUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }

  return data || [];
}

export async function addUser(user: UserInsert): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .insert(user)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add user: ${error.message}`);
  }

  return data;
}

export async function fetchClientTeam(clientId: string): Promise<{
  manager?: User;
  editors: User[];
  scripting: User[];
}> {
  const { data: assignments, error } = await supabase
    .from('client_team_assignments')
    .select('*, users(*)')
    .eq('client_id', clientId);

  if (error) {
    throw new Error(`Failed to fetch client team: ${error.message}`);
  }

  const result = {
    manager: undefined as User | undefined,
    editors: [] as User[],
    scripting: [] as User[],
  };

  assignments?.forEach((assignment: any) => {
    const user = assignment.users as User;
    if (assignment.role === 'manager') {
      result.manager = user;
    } else if (assignment.role === 'editor') {
      result.editors.push(user);
    } else if (assignment.role === 'scripting') {
      result.scripting.push(user);
    }
  });

  return result;
}

export async function updateClientTeam(
  clientId: string,
  team: {
    managerId?: string;
    editorIds: string[];
    scriptingIds: string[];
  }
): Promise<void> {
  if (!team.managerId) {
    throw new Error('Manager is required');
  }

  const { error: deleteError } = await supabase
    .from('client_team_assignments')
    .delete()
    .eq('client_id', clientId);

  if (deleteError) {
    throw new Error(`Failed to clear existing team: ${deleteError.message}`);
  }

  const assignments: ClientTeamAssignmentInsert[] = [
    { client_id: clientId, user_id: team.managerId, role: 'manager' },
    ...team.editorIds.map(id => ({ client_id: clientId, user_id: id, role: 'editor' as TeamRole })),
    ...team.scriptingIds.map(id => ({ client_id: clientId, user_id: id, role: 'scripting' as TeamRole })),
  ];

  const { error: insertError } = await supabase
    .from('client_team_assignments')
    .insert(assignments);

  if (insertError) {
    throw new Error(`Failed to update team assignments: ${insertError.message}`);
  }
}

export async function fetchMonthlyPlan(
  clientId: string,
  month: string
): Promise<MonthlyContentPlan | null> {
  const { data, error } = await supabase
    .from('monthly_content_plans')
    .select('*')
    .eq('client_id', clientId)
    .eq('month', month)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch monthly plan: ${error.message}`);
  }

  if (data) {
    return data;
  }

  const { data: client } = await supabase
    .from('clients')
    .select('is_recurring, posts_per_month, ads_per_month')
    .eq('id', clientId)
    .single();

  if (client?.is_recurring) {
    const { data: latestPlan } = await supabase
      .from('monthly_content_plans')
      .select('*')
      .eq('client_id', clientId)
      .order('month', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestPlan) {
      const newPlan: MonthlyContentPlanInsert = {
        client_id: clientId,
        month,
        posts_planned: latestPlan.posts_planned,
        ads_planned: latestPlan.ads_planned,
      };

      const { data: created, error: createError } = await supabase
        .from('monthly_content_plans')
        .insert(newPlan)
        .select()
        .single();

      if (createError) {
        throw new Error(`Failed to create recurring plan: ${createError.message}`);
      }

      return created;
    } else if (client.posts_per_month !== null || client.ads_per_month !== null) {
      const newPlan: MonthlyContentPlanInsert = {
        client_id: clientId,
        month,
        posts_planned: client.posts_per_month || 0,
        ads_planned: client.ads_per_month || 0,
      };

      const { data: created, error: createError } = await supabase
        .from('monthly_content_plans')
        .insert(newPlan)
        .select()
        .single();

      if (createError) {
        throw new Error(`Failed to create initial recurring plan: ${createError.message}`);
      }

      return created;
    }
  }

  return null;
}

export async function upsertMonthlyPlan(
  clientId: string,
  month: string,
  plan: { posts_planned: number; ads_planned: number }
): Promise<MonthlyContentPlan> {
  const { data, error } = await supabase
    .from('monthly_content_plans')
    .upsert(
      {
        client_id: clientId,
        month,
        posts_planned: plan.posts_planned,
        ads_planned: plan.ads_planned,
      },
      { onConflict: 'client_id,month' }
    )
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update monthly plan: ${error.message}`);
  }

  return data;
}

export async function fetchClientsWithTeam(): Promise<ClientWithTeam[]> {
  const clients = await fetchClients();

  const clientsWithTeam = await Promise.all(
    clients.map(async (client) => {
      const team = await fetchClientTeam(client.id);
      return {
        ...client,
        ...team,
      };
    })
  );

  return clientsWithTeam;
}

export async function addClientWithTeamAndPlan(
  clientData: ClientInsert,
  team?: {
    managerId?: string;
    editorIds: string[];
    scriptingIds: string[];
  },
  monthlyPlan?: {
    month: string;
    posts_planned: number;
    ads_planned: number;
  }
): Promise<ClientWithTeam> {
  const newClient = await addClient(clientData);

  if (team && (team.managerId || team.editorIds.length > 0 || team.scriptingIds.length > 0)) {
    const assignments: ClientTeamAssignmentInsert[] = [];

    if (team.managerId) {
      assignments.push({ client_id: newClient.id, user_id: team.managerId, role: 'manager' });
    }

    team.editorIds.forEach(id => {
      assignments.push({ client_id: newClient.id, user_id: id, role: 'editor' as TeamRole });
    });

    team.scriptingIds.forEach(id => {
      assignments.push({ client_id: newClient.id, user_id: id, role: 'scripting' as TeamRole });
    });

    if (assignments.length > 0) {
      const { error } = await supabase
        .from('client_team_assignments')
        .insert(assignments);

      if (error) {
        throw new Error(`Failed to assign team: ${error.message}`);
      }
    }
  }

  if (monthlyPlan) {
    await upsertMonthlyPlan(newClient.id, monthlyPlan.month, {
      posts_planned: monthlyPlan.posts_planned,
      ads_planned: monthlyPlan.ads_planned,
    });
  }

  const teamData = await fetchClientTeam(newClient.id);

  return {
    ...newClient,
    ...teamData,
  };
}
