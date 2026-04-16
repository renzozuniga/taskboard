import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiBoard } from '../models/board.model';

/**
 * Service for board CRUD operations.
 * All requests require a valid JWT (injected automatically by AuthInterceptor).
 */
@Injectable({ providedIn: 'root' })
export class BoardService {
  private readonly apiUrl = `${environment.apiUrl}/boards`;

  constructor(private http: HttpClient) {}

  /**
   * Returns all boards owned by the authenticated user.
   */
  getBoards(): Observable<ApiBoard[]> {
    return this.http.get<ApiBoard[]>(this.apiUrl);
  }

  /**
   * Returns a single board with its lists and cards nested.
   * @param id - Board MongoDB ObjectId
   */
  getBoardById(id: string): Observable<ApiBoard> {
    return this.http.get<ApiBoard>(`${this.apiUrl}/${id}`);
  }

  /**
   * Creates a new board for the authenticated user.
   * @param title - Board title (required)
   * @param description - Optional board description
   */
  createBoard(title: string, description = ''): Observable<ApiBoard> {
    return this.http.post<ApiBoard>(this.apiUrl, { title, description });
  }

  /**
   * Updates a board's title and/or description.
   * @param id - Board MongoDB ObjectId
   * @param title - New title
   * @param description - New description
   */
  updateBoard(id: string, title: string, description = ''): Observable<ApiBoard> {
    return this.http.put<ApiBoard>(`${this.apiUrl}/${id}`, { title, description });
  }

  /**
   * Deletes a board and all its lists and cards.
   * @param id - Board MongoDB ObjectId
   */
  deleteBoard(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
