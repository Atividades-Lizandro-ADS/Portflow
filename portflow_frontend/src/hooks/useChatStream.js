import { useEffect, useRef } from 'react';
import EventSource from 'react-native-sse';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from '../api/client';

export function useChatStream(conversationId, onMessage) {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!conversationId) return;
    let es;
    let cancelled = false;

    (async () => {
      const token = await SecureStore.getItemAsync('access_token');
      if (!token || cancelled) return;

      es = new EventSource(`${BASE_URL}/api/notif-stream/?token=${token}`);
      es.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'chat_message' && String(data.conversation_id) === String(conversationId)) {
            onMessageRef.current(data);
          }
        } catch {}
      });
    })();

    return () => {
      cancelled = true;
      es?.close();
    };
  }, [conversationId]);
}
