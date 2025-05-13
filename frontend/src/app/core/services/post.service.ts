import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from '../models/post.model';
import { getApiUrl } from '../config/app-config';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private readonly apiUrl = getApiUrl('posts');

  constructor(private http: HttpClient) {}

  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl);
  }

  getNewsFeed(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/feed`);
  }

  getUserPosts(userId: number): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/user/${userId}`);
  }

  getPostById(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${id}`);
  }

  createPost(content: string): Observable<Post> {
    return this.http.post<Post>(this.apiUrl, { content });
  }

  updatePost(id: number, content: string): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/${id}`, { content });
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
