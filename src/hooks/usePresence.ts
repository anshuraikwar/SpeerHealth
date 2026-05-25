import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { RealtimeChannel } from '@supabase/supabase-js';

import { supabase } from '../lib/supabase';
import { OnlineUser } from '../type/onlineUserType';

export function usePresence(user: OnlineUser) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const channel = supabase.channel('presence:global', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channelRef.current = channel;

    channel
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
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            avatarUrl: user.avatarUrl,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async (state) => {
        const channel = channelRef.current;

        if (!channel) return;

        if (state === 'active') {
          await channel.track({
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            avatarUrl: user.avatarUrl,
            online_at: new Date().toISOString(),
          });
        } else {
          await channel.untrack();
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return {
    onlineUsers,
  };
}