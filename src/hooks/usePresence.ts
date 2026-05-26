import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { RealtimeChannel } from '@supabase/supabase-js';

import { supabase } from '../lib/supabase';
import { OnlineUser } from '../type/onlineUserType';

export function usePresence(user: OnlineUser | null) {
  const [isActive, setIsActive] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      setIsActive(state === 'active');
    });

    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!user?.id || !isActive) return;

    const channel = supabase.channel('presence:global', {
      config: {
        presence: {
          key: user?.id,
        },
      },
    });

    channelRef.current = channel;

    channel
      // FOR DEBUGGING: DO NOT DELETE
      // .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      //   console.log('\n\nJOIN', key, newPresences.map(u => u.fullName));
      // })
      // .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      //   console.log('\n\nLEAVE', key, leftPresences.map(u => u.fullName));
      // })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();

        const users = Object.values(state)
          .flat()
          .map((presence: any) => {
            return {
              id: presence.id,
              email: presence.email,
              fullName: presence.fullName,
              avatarUrl: presence.avatarUrl,
            };
          });

        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: user?.id,
            email: user?.email,
            fullName: user?.fullName,
            avatarUrl: user?.avatarUrl,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id, isActive]);

  return {
    onlineUsers,
  };
}