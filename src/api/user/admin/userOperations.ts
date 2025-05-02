
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/user";

interface ListUsersParams {
  page: number;
  pageSize: number;
  status?: string;
  searchTerm?: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

export const listUsers = async ({ 
  page = 1, 
  pageSize = 10, 
  status,
  searchTerm,
  sortField = 'created_at',
  sortDirection = 'desc'
}: ListUsersParams): Promise<{users: User[], total: number}> => {
  try {
    let query = supabase.from('users' as any).select('*', { count: 'exact' });
    
    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status as any);
    }
    
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%` as any);
    }
    
    // Apply sorting
    if (sortField) {
      query = query.order(sortField as any, { ascending: sortDirection === 'asc' });
    }
    
    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    // Execute query
    const { data, count, error } = await query.range(from, to);
    
    if (error) {
      console.error('Error listing users:', error);
      throw new Error(error.message);
    }
    
    const users = (data || []).map(user => {
      // Truy cập an toàn vào các thuộc tính
      const role = user && typeof user === 'object' && 'role' in user ? 
        (user as any).role : 'user';
        
      // Trả về người dùng đã xử lý
      return {
        id: (user as any)?.id || '',
        name: (user as any)?.name || '',
        email: (user as any)?.email || '',
        status: (user as any)?.status || 'inactive',
        role: role === 'admin' ? 'admin' : 'user',
        credits: (user as any)?.credits || 0,
        subscription: (user as any)?.subscription || 'Không có',
        created_at: (user as any)?.created_at || new Date().toISOString()
      } as User;
    });
    
    return {
      users,
      total: count || 0
    };
  } catch (error: any) {
    console.error('Error in listUsers:', error);
    throw new Error(`Failed to list users: ${error.message}`);
  }
};
