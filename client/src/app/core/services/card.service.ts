import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiCard } from '../models/board.model';

/**
 * Service for card CRUD operations within a list.
 */
@Injectable({ providedIn: 'root' })
export class CardService {
  private readonly apiUrl = `${environment.apiUrl}/cards`;

  constructor(private http: HttpClient) {}

  /**
   * Creates a new card at the end of the given list.
   * @param title - Card title (required)
   * @param description - Card description
   * @param listId - Parent list MongoDB ObjectId
   * @param assignee - Assignee object or null for unassigned
   */
  createCard(
    title: string,
    description: string,
    listId: string,
    assignee?: { name: string } | null
  ): Observable<ApiCard> {
    return this.http.post<ApiCard>(this.apiUrl, { title, description, listId, assignee: assignee ?? null });
  }

  /**
   * Updates a card's title, description and/or assignee.
   * @param id - Card MongoDB ObjectId
   * @param title - New title
   * @param description - New description
   * @param assignee - New assignee or null to unassign
   */
  updateCard(
    id: string,
    title: string,
    description: string,
    assignee?: { name: string } | null
  ): Observable<ApiCard> {
    return this.http.put<ApiCard>(`${this.apiUrl}/${id}`, { title, description, assignee: assignee ?? null });
  }

  /**
   * Moves a card to a different list and/or a new position within a list.
   * Used for drag & drop persistence.
   * @param id - Card MongoDB ObjectId
   * @param listId - Target list MongoDB ObjectId
   * @param position - New zero-based position in the target list
   */
  moveCard(id: string, listId: string, position: number): Observable<ApiCard> {
    return this.http.put<ApiCard>(`${this.apiUrl}/${id}/move`, { listId, position });
  }

  /**
   * Permanently deletes a card.
   * @param id - Card MongoDB ObjectId
   */
  deleteCard(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
