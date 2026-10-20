import { useState, useEffect, useRef, useCallback } from 'react';
import { ScreenplayDocument } from '@screenplay/schema';

export interface Peer {
  clientId: string;
  userName: string;
  color: string;
}

export function useCollaborationSync(
  docId: string,
  userName = 'Writer',
  onRemoteDocumentUpdate?: (payload: any) => void
) {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [peers, setPeers] = useState<Peer[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const clientIdRef = useRef<string>(`client-${Math.random().toString(36).slice(2, 9)}`);

  useEffect(() => {
    const wsUrl = `ws://127.0.0.1:8000/ws/documents/${docId}`;
    let socket: WebSocket;

    try {
      socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setConnectionStatus('connected');
        // Announce presence
        socket.send(
          JSON.stringify({
            type: 'join',
            clientId: clientIdRef.current,
            userName,
            color: '#f59e0b',
          })
        );
      };

      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'peer_joined') {
            setPeers((prev) => {
              if (prev.some((p) => p.clientId === msg.clientId)) return prev;
              return [...prev, { clientId: msg.clientId, userName: msg.userName, color: msg.color }];
            });
          } else if (msg.type === 'peer_left') {
            setPeers((prev) => prev.filter((p) => p.clientId !== msg.clientId));
          } else if (msg.type === 'document_update') {
            if (onRemoteDocumentUpdate) {
              onRemoteDocumentUpdate(msg.payload);
            }
          }
        } catch (e) {
          console.error('WS parse error:', e);
        }
      };

      socket.onerror = () => {
        setConnectionStatus('disconnected');
      };

      socket.onclose = () => {
        setConnectionStatus('disconnected');
      };
    } catch (e) {
      setConnectionStatus('disconnected');
    }

    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [docId, userName, onRemoteDocumentUpdate]);

  const broadcastCursor = useCallback((nodeId: string, offset = 0) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'cursor',
          nodeId,
          offset,
        })
      );
    }
  }, []);

  const saveCloudSnapshot = useCallback(async (document: ScreenplayDocument) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/documents/${docId}/snapshots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_json: JSON.stringify(document),
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }, [docId]);

  return {
    connectionStatus,
    peers,
    broadcastCursor,
    saveCloudSnapshot,
  };
}
