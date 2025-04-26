
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Wallet } from "lucide-react";

export const UserCreditBalance = () => {
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    const fetchCredits = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setCredits(data.credits);
      }
    };

    fetchCredits();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('custom-all-channel')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${supabase.auth.getUser()?.data?.user?.id}`
        },
        (payload) => {
          setCredits(payload.new.credits);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (credits === null) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-md">
      <Wallet className="w-4 h-4 text-primary" />
      <span className="text-sm font-medium">{credits} credit</span>
    </div>
  );
};
