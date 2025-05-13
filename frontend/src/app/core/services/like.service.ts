import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { getApiUrl } from '../config/app-config';

@Injectable({
  providedIn: 'root'
})
export class LikeService {
  private readonly apiUrl = getApiUrl('likes');

  constructor(private readonly http: HttpClient) {}

  likePost(postId: number): Observable<{liked: boolean, message: string}> {
    return this.http.post<{liked: boolean, message: string}>(this.apiUrl, { postId });
  }
  
  // Keep this method for backward compatibility, but we'll use likePost for toggling
  unlikePost(postId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${postId}`);
  }

  getPostLikes(postId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/post/${postId}`);
  }

  checkUserLiked(postId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check/${postId}`);
  }
}
