'use client';

import { useEffect, useMemo, useState } from 'react';
import { subscribeAuthoredLetters, subscribeReceivedLetters } from '@/lib/firestore';
import type { Letter } from '@/lib/types';
import { useAuth } from './useAuth';

export function useLetters() {
  const { user } = useAuth();
  const [authored, setAuthored] = useState<Letter[]>([]);
  const [received, setReceived] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setAuthored([]);
      setReceived([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubA = subscribeAuthoredLetters(user.uid, (l) => {
      setAuthored(l);
      setLoading(false);
    });
    const unsubR = user.email
      ? subscribeReceivedLetters(user.email, setReceived)
      : undefined;
    return () => {
      unsubA();
      unsubR?.();
    };
  }, [user]);

  return useMemo(() => {
    const inTransit = authored.filter(
      (l) => l.status === 'sealed' || l.status === 'delivering',
    );
    const deliveredOwn = authored.filter(
      (l) =>
        (l.status === 'delivered' || l.status === 'opened') &&
        l.recipientType === 'self',
    );
    const sentToOthers = authored.filter(
      (l) =>
        (l.status === 'delivered' || l.status === 'opened') &&
        l.recipientType === 'other',
    );
    const failed = authored.filter((l) => l.status === 'failed');
    const receivedFromOthers = received.filter(
      (l) => l.recipientType === 'other',
    );
    return {
      loading,
      authored,
      inTransit,
      delivered: [...deliveredOwn, ...sentToOthers],
      received: receivedFromOthers,
      failed,
    };
  }, [authored, received, loading]);
}
