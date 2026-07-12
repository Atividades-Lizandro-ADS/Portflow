import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Conversation as ConversationModel, ChatMessage } from '../models/conversation';

export interface ConversationPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: ConversationModel[];
}

export interface ChatMessagePage {
  results: ChatMessage[];
  has_more: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class Conversation {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/api`;

  list(): Observable<ConversationPage> {
    return this.http.get<ConversationPage>(`${this.api}/conversations/`);
  }

  get(id: number | string): Observable<ConversationModel> {
    return this.http.get<ConversationModel>(`${this.api}/conversations/${id}/`);
  }

  createConversation(tierId: number): Observable<ConversationModel> {
    return this.http.post<ConversationModel>(`${this.api}/conversations/`, { tier: tierId });
  }

  getMessages(conversationId: number | string, before?: number): Observable<ChatMessagePage> {
    const params: Record<string, string> = { conversation: String(conversationId) };
    if (before) params['before'] = String(before);
    return this.http.get<ChatMessagePage>(`${this.api}/chat-messages/`, { params });
  }

  sendMessage(conversationId: number | string, body: string, attachments: File[] = []): Observable<ChatMessage> {
    const form = new FormData();
    form.append('conversation', String(conversationId));
    form.append('body', body ?? '');
    attachments.forEach(file => form.append('attachments[]', file));
    return this.http.post<ChatMessage>(`${this.api}/chat-messages/`, form);
  }

  heartbeat(conversationId: number | string): Observable<void> {
    return this.http.post<void>(`${this.api}/conversations/${conversationId}/heartbeat/`, {});
  }
}
