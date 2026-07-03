'use client';

import { useEffect, useMemo, useState } from 'react';
import { subscribeAuthoredLetters } from '@/lib/firestore';
import type { Letter } from '@/lib/types';
import { useAuth } from './useAuth';

export function useLetters() {
  const { user } = useAuth();
  const [authored, setAuthored] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setAuthored([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    return subscribeAuthoredLetters(user.uid, (l) => {
      setAuthored(l);
      setLoading(false);
    });
  }, [user]);

  return useMemo(() => {
    const inTransit = authored.filter(
      (l) => l.status === 'sealed' || l.status === 'delivering',
    );
    const delivered = authored.filter(
      (l) => l.status === 'delivered' || l.status === 'opened',
    );
    const failed = authored.filter((l) => l.status === 'failed');
    return { loading, authored, inTransit, delivered, failed };
  }, [authored, loading]);
}
