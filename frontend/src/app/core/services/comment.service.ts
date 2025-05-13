import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from '../models/comment.model';
import { getApiUrl } from '../config/app-config';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private readonly apiUrl = getApiUrl('comments');

  constructor(private readonly http: HttpClient) {}

  getCommentsByPostId(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/post/${postId}`);
  }

  createComment(postId: number, content: string): Observable<Comment> {
    return this.http.post<Comment>(this.apiUrl, { postId, content });
  }

  updateComment(id: number, content: string): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}/${id}`, { content });
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
