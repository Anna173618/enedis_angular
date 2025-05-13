import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserProfile } from '../models/user.model';
import { getApiUrl } from '../config/app-config';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = getApiUrl('users');

  constructor(private readonly http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserById(id: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/${id}`);
  }

  updateUser(id: number, data: { firstName?: string; lastName?: string; bio?: string }): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, data);
  }

  uploadProfilePicture(file: File): Observable<User> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<User>(`${this.apiUrl}/upload-profile-picture`, formData);
  }

  getFollowers(userId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/${userId}/followers`);
  }

  getFollowing(userId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/${userId}/following`);
  }
}
