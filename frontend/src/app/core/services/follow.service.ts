import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getApiUrl } from '../config/app-config';

@Injectable({
  providedIn: 'root'
})
export class FollowService {
  private readonly apiUrl = getApiUrl('follows');

  constructor(private readonly http: HttpClient) {}

  followUser(followingId: number): Observable<any> {
    return this.http.post(this.apiUrl, { followingId });
  }

  unfollowUser(followingId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${followingId}`);
  }
}
