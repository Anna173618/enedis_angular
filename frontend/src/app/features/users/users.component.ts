import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { FollowService } from '../../core/services/follow.service';
import { AuthService } from '../../auth/services/auth.service';
import { User } from '../../core/models/user.model';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzMessageService } from 'ng-zorro-antd/message';
import { RouterModule } from '@angular/router';
import { getProfileImageUrl } from '../../core/config/app-config';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzCardModule,
    NzAvatarModule,
    NzButtonModule,
    NzGridModule,
    NzSpinModule,
    NzEmptyModule
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  isLoading = false;
  currentUserId: number | null = null;
  followingMap: { [key: number]: boolean } = {};

  constructor(
    private readonly userService: UserService,
    private readonly followService: FollowService,
    private readonly authService: AuthService,
    private readonly message: NzMessageService
  ) { }

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.currentUserId = currentUser.id;
    }
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        // Filter out the current user
        this.users = users.filter(user => user.id !== this.currentUserId);
        this.isLoading = false;
      },
      error: (error) => {
        this.message.error('Failed to load users');
        console.error('Error loading users:', error);
        this.isLoading = false;
      }
    });
  }

  followUser(userId: number): void {
    this.followService.followUser(userId).subscribe({
      next: () => {
        this.followingMap[userId] = true;
        this.message.success('You are now following this user');
      },
      error: (error) => {
        this.message.error('Failed to follow user');
        console.error('Error following user:', error);
      }
    });
  }

  unfollowUser(userId: number): void {
    this.followService.unfollowUser(userId).subscribe({
      next: () => {
        this.followingMap[userId] = false;
        this.message.success('You have unfollowed this user');
      },
      error: (error) => {
        this.message.error('Failed to unfollow user');
        console.error('Error unfollowing user:', error);
      }
    });
  }

  getProfileImageUrl(user: User): string {
    return getProfileImageUrl(user.profilePicture);
  }
}
