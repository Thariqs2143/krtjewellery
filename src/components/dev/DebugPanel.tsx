import React, { useState } from 'react';
import { useQueryClient, useIsFetching } from '@tanstack/react-query';

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const fetching = useIsFetching();

  const queries = queryClient.getQueryCache().getAll().map(q => ({
    key: q.queryKey,
    state: q.state,
  }));

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          right: 12,
          bottom: 12,
          zIndex: 9999,
          background: 'rgba(59, 130, 246, 0.9)',
          color: '#fff',
          border: 'none',
          padding: '8px 12px',
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 600,
          cursor: 'pointer',
          hover: { background: 'rgba(59, 130, 246, 1)' },
        }}
      >
        {isOpen ? '✕ Close Debug' : '⚙ Debug'}
      </button>

      {/* Debug Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            right: 12,
            bottom: 60,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.9)',
            color: '#fff',
            padding: 12,
            borderRadius: 8,
            fontSize: 12,
            maxWidth: 420,
            border: '1px solid rgba(59, 130, 246, 0.5)',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Dev Debug Panel</div>
          <div>Active fetches: {fetching}</div>
          <div style={{ maxHeight: 240, overflow: 'auto', marginTop: 8 }}>
            {queries.map((q, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 8,
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  paddingBottom: 6,
                }}
              >
                <div style={{ color: '#ffd' }}>{JSON.stringify(q.key)}</div>
                <div>status: {q.state.status}</div>
                {q.state.error && (
                  <div style={{ color: '#f88' }}>
                    error: {String((q.state.error as unknown)?.message || q.state.error)}
                  </div>
                )}
                <div style={{ fontSize: 11, color: '#ccc' }}>
                  data: {q.state.data ? 'present' : 'null'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default DebugPanel;
