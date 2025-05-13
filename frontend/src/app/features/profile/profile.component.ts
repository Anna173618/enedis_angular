import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { UserService } from '../../core/services/user.service';
import { PostService } from '../../core/services/post.service';
import { FollowService } from '../../core/services/follow.service';
import { AuthService } from '../../auth/services/auth.service';
import { UserProfile } from '../../core/models/user.model';
import { Post } from '../../core/models/post.model';
import { getProfileImageUrl, getApiUrl } from '../../core/config/app-config';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    NzCardModule,
    NzAvatarModule,
    NzButtonModule,
    NzIconModule,
    NzTabsModule,
    NzUploadModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzSkeletonModule,
    NzEmptyModule,
    NzSpinModule,
    NzDropDownModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profile: UserProfile | null = null;
  posts: Post[] = [];
  isCurrentUser = false;
  isLoading = false;
  isLoadingPosts = false;
  isFollowing = false;
  isEditModalVisible = false;
  editForm: FormGroup;
  uploadUrl = getApiUrl('users/upload-profile-picture');
  
  constructor(
    private readonly route: ActivatedRoute,
    private readonly fb: FormBuilder,
    private readonly userService: UserService,
    private readonly postService: PostService,
    private readonly followService: FollowService,
    private readonly authService: AuthService,
    private readonly message: NzMessageService
  ) {
    this.editForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      bio: [''] 
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const userId = +params['id'];
      if (userId) {
        this.loadUserProfile(userId);
      } else {
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          this.loadUserProfile(currentUser.id);
        }
      }
    });
  }

  loadUserProfile(userId: number): void {
    this.isLoading = true;
    this.userService.getUserById(userId).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.isCurrentUser = this.authService.getCurrentUser()?.id === profile.id;
        
        // Load user posts
        this.loadUserPosts(userId);
        
        // Initialize form values if it's the current user
        if (this.isCurrentUser) {
          console.log('Patching form values:', profile);
          this.editForm.patchValue({
            firstName: profile.firstName,
            lastName: profile.lastName,
            bio: profile.bio ?? ''
          });
          console.log('Form values after patch:', this.editForm.value);
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        this.message.error('Failed to load user profile');
        console.error('Error loading user profile:', error);
        this.isLoading = false;
      }
    });
  }

  loadUserPosts(userId: number): void {
    this.isLoadingPosts = true;
    this.postService.getUserPosts(userId).subscribe({
      next: (posts) => {
        this.posts = posts;
        this.isLoadingPosts = false;
      },
      error: (error) => {
        this.message.error('Failed to load user posts');
        console.error('Error loading user posts:', error);
        this.isLoadingPosts = false;
      }
    });
  }
  
  followUser(): void {
    if (!this.profile) return;
    
    this.followService.followUser(this.profile.id).subscribe({
      next: () => {
        this.isFollowing = true;
        if (this.profile?._count) {
          this.profile._count.followedBy++;
        }
        this.message.success(`You are now following ${this.profile?.firstName}`);
      },
      error: (error) => {
        this.message.error('Failed to follow user');
        console.error('Error following user:', error);
      }
    });
  }

  unfollowUser(): void {
    if (!this.profile) return;
    
    this.followService.unfollowUser(this.profile.id).subscribe({
      next: () => {
        this.isFollowing = false;
        if (this.profile?._count) {
          this.profile._count.followedBy--;
        }
        this.message.success(`You have unfollowed ${this.profile?.firstName}`);
      },
      error: (error) => {
        this.message.error('Failed to unfollow user');
        console.error('Error unfollowing user:', error);
      }
    });
  }

// Add this function to your component
showEditModal(): void {
  if (this.profile) {
    console.log('Opening modal with profile:', this.profile);
    
    // Force re-patching the values when opening the modal
    this.editForm.patchValue({
      firstName: this.profile.firstName || '',
      lastName: this.profile.lastName || '',
      bio: this.profile.bio || ''
    });
    
    console.log('Form values after patching:', this.editForm.value);
    this.isEditModalVisible = true;
  } else {
    this.message.error('Profile data not loaded');
  }
}

  handleCancel(): void {
    this.isEditModalVisible = false;
  }

  submitEditForm(): void {
    if (this.editForm.valid && this.profile) {
      const { firstName, lastName, bio } = this.editForm.value;
      
      this.userService.updateUser(this.profile.id, { firstName, lastName, bio }).subscribe({
        next: (updatedUser) => {
          this.profile!.firstName = updatedUser.firstName;
          this.profile!.lastName = updatedUser.lastName;
          this.profile!.bio = updatedUser.bio;
          this.isEditModalVisible = false;
          this.message.success('Profile updated successfully');
        },
        error: (error) => {
          this.message.error('Failed to update profile');
          console.error('Error updating profile:', error);
        }
      });
    }
  }

  handleUploadSuccess(info: any): void {
    if (info.file.status === 'done') {
      const response = info.file.response;
      if (response && this.profile) {
        this.profile.profilePicture = response.profilePicture;
        this.message.success('Profile picture uploaded successfully');
      }
    }
  }

  handleUploadError(): void {
    this.message.error('Failed to upload profile picture');
  }

  getProfileImageUrl(): string {
    return getProfileImageUrl(this.profile?.profilePicture);
  }

  getUploadHeaders(): { [key: string]: string } {
    return {
      Authorization: `Bearer ${this.authService.getToken()}`
    };
  }
}
