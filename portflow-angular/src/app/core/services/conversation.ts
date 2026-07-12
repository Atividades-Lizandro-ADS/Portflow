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
  count: number;
  next: string | null;
  previous: string | null;
  results: ChatMessage[];
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

  getMessages(conversationId: number | string): Observable<ChatMessagePage> {
    return this.http.get<ChatMessagePage>(`${this.api}/chat-messages/`, {
      params: { conversation: conversationId },
    });
  }

  sendMessage(conversationId: number | string, body: string): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.api}/chat-messages/`, { conversation: conversationId, body });
  }
}
