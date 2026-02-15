import React, { useEffect, useState } from 'react';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

export function NetworkWatcher() {
  const fetching = useIsFetching();
  const [showAlert, setShowAlert] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    let t: any;
    if (fetching > 0) {
      // if fetches are running for more than 6s show alert
      t = setTimeout(() => setShowAlert(true), 6000);
    } else {
      setShowAlert(false);
    }
    return () => clearTimeout(t);
  }, [fetching]);

  if (!showAlert) return null;

  return (
    <div style={{position: 'fixed', left: 12, bottom: 12, zIndex: 9999, background: '#111827', color: '#fff', padding: 12, borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.6)'}}>
      <div style={{fontWeight: 700, marginBottom: 6}}>Network request taking long</div>
      <div style={{marginBottom: 8}}>Some API requests are pending — this may be a network or Supabase key issue.</div>
      <div style={{display: 'flex', gap: 8}}>
        <Button onClick={() => queryClient.invalidateQueries({})} type="button">Retry requests</Button>
        <Button onClick={() => { queryClient.cancelQueries(); queryClient.clear(); }} type="button" variant="outline">Clear</Button>
      </div>
    </div>
  );
}

export default NetworkWatcher;
