import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiList } from '../models/board.model';

/**
 * Service for list (column) CRUD operations within a board.
 */
@Injectable({ providedIn: 'root' })
export class ListService {
  private readonly apiUrl = `${environment.apiUrl}/lists`;

  constructor(private http: HttpClient) {}

  /**
   * Creates a new list at the end of the given board.
   * @param title - List title
   * @param boardId - Parent board MongoDB ObjectId
   */
  createList(title: string, boardId: string): Observable<ApiList> {
    return this.http.post<ApiList>(this.apiUrl, { title, boardId });
  }

  /**
   * Renames a list.
   * @param id - List MongoDB ObjectId
   * @param title - New title
   */
  updateList(id: string, title: string): Observable<ApiList> {
    return this.http.put<ApiList>(`${this.apiUrl}/${id}`, { title });
  }

  /**
   * Deletes a list and all its cards.
   * @param id - List MongoDB ObjectId
   */
  deleteList(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
