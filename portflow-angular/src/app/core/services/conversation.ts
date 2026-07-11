import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Conversation as ConversationModel, ChatMessage } from '../models/conversation';

@Injectable({
  providedIn: 'root',
})
export class Conversation {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/api`;

  createConversation(tierId: number): Observable<ConversationModel> {
    return this.http.post<ConversationModel>(`${this.api}/conversations/`, { tier: tierId });
  }

  sendMessage(conversationId: number, body: string): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.api}/chat-messages/`, { conversation: conversationId, body });
  }
}
