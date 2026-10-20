import { useState, useEffect, useRef, useCallback } from 'react';
import { ScreenplayDocument } from '@screenplay/schema';

export interface Peer {
  clientId: string;
  userName: string;
  color: string;
}

export interface PeerCursor {
  clientId: string;
  userName: string;
  color: string;
  nodeId: string;
  offset: number;
}

export type ConnectionState = 'connected' | 'connecting' | 'disconnected' | 'offline';

export function useCollaborationSync(
  docId: string,
  userName = 'Writer',
  onRemoteDocumentUpdate?: (updatedDoc: ScreenplayDocument) => void
) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionState>('connecting');
  const [peers, setPeers] = useState<Peer[]>([]);
  const [peerCursors, setPeerCursors] = useState<Record<string, PeerCursor>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const clientIdRef = useRef<string>(`client-${Math.random().toString(36).slice(2, 9)}`);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Compute endpoints from env variables with safe fallbacks
  const getEndpoints = useCallback(() => {
    const isLocalhost =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    const apiBase =
      (import.meta.env.VITE_API_URL as string) ||
      (isLocalhost ? 'http://127.0.0.1:8000' : '');

    const wsBase =
      (import.meta.env.VITE_WS_URL as string) ||
      (isLocalhost ? 'ws://127.0.0.1:8000' : '');

    return { apiBase, wsBase };
  }, []);

  useEffect(() => {
    const { wsBase } = getEndpoints();

    // If on a static host like GitHub Pages and no custom backend URL is configured, stay in graceful offline mode
    if (!wsBase) {
      setConnectionStatus('offline');
      return;
    }

    let socket: WebSocket | null = null;
    let isSubscribed = true;

    const connect = () => {
      try {
        setConnectionStatus('connecting');
        const url = `${wsBase}/ws/documents/${docId}`;
        socket = new WebSocket(url);
        wsRef.current = socket;

        socket.onopen = () => {
          if (!isSubscribed) return;
          setConnectionStatus('connected');
          // Announce presence
          socket?.send(
            JSON.stringify({
              type: 'join',
              clientId: clientIdRef.current,
              userName,
              color: '#f59e0b',
            })
          );
        };

        socket.onmessage = (event) => {
          if (!isSubscribed) return;
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'peer_joined') {
              setPeers((prev) => {
                if (prev.some((p) => p.clientId === msg.clientId)) return prev;
                return [...prev, { clientId: msg.clientId, userName: msg.userName, color: msg.color }];
              });
            } else if (msg.type === 'peer_left') {
              setPeers((prev) => prev.filter((p) => p.clientId !== msg.clientId));
              setPeerCursors((prev) => {
                const next = { ...prev };
                delete next[msg.clientId];
                return next;
              });
            } else if (msg.type === 'peer_cursor') {
              setPeerCursors((prev) => ({
                ...prev,
                [msg.clientId]: {
                  clientId: msg.clientId,
                  userName: msg.userName,
                  color: msg.color,
                  nodeId: msg.nodeId,
                  offset: msg.offset,
                },
              }));
            } else if (msg.type === 'document_update') {
              if (msg.senderId !== clientIdRef.current && onRemoteDocumentUpdate && msg.payload) {
                onRemoteDocumentUpdate(msg.payload);
              }
            }
          } catch (e) {
            console.error('WS parse error:', e);
          }
        };

        socket.onerror = () => {
          if (!isSubscribed) return;
          setConnectionStatus('disconnected');
        };

        socket.onclose = () => {
          if (!isSubscribed) return;
          setConnectionStatus('disconnected');
          // Reconnect attempt after 5 seconds if still mounted
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isSubscribed) connect();
          }, 5000);
        };
      } catch (e) {
        if (isSubscribed) setConnectionStatus('offline');
      }
    };

    connect();

    return () => {
      isSubscribed = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        socket.close();
      }
    };
  }, [docId, userName, onRemoteDocumentUpdate, getEndpoints]);

  const broadcastCursor = useCallback((nodeId: string, offset = 0) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'cursor',
          clientId: clientIdRef.current,
          nodeId,
          offset,
        })
      );
    }
  }, []);

  const broadcastDocumentUpdate = useCallback((doc: ScreenplayDocument) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'document_update',
          senderId: clientIdRef.current,
          payload: doc,
        })
      );
    }
  }, []);

  const saveCloudSnapshot = useCallback(
    async (document: ScreenplayDocument) => {
      const { apiBase } = getEndpoints();
      if (!apiBase) return false;

      try {
        const res = await fetch(`${apiBase}/api/documents/${docId}/snapshots`, {
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
    },
    [docId, getEndpoints]
  );

  return {
    connectionStatus,
    peers,
    peerCursors,
    broadcastCursor,
    broadcastDocumentUpdate,
    saveCloudSnapshot,
    clientId: clientIdRef.current,
  };
}
