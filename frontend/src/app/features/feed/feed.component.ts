import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCommentModule } from 'ng-zorro-antd/comment';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PostService } from '../../core/services/post.service';
import { CommentService } from '../../core/services/comment.service';
import { LikeService } from '../../core/services/like.service';
import { AuthService } from '../../auth/services/auth.service';
import { Post } from '../../core/models/post.model';
import { User } from '../../core/models/user.model';
import { Comment } from '../../core/models/comment.model';
import { RouterModule } from '@angular/router';
import { getProfileImageUrl } from '../../core/config/app-config';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NzCardModule,
    NzAvatarModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzCommentModule,
    NzListModule,
    NzSkeletonModule,
    NzEmptyModule,
    NzSpinModule
  ],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FeedComponent implements OnInit {
  posts: Post[] = [];
  currentUser: User | null = null;
  isLoading = false;
  postForm: FormGroup;
  commentForms: { [key: number]: FormGroup } = {};
  showComments: { [key: number]: boolean } = {};

  constructor(
    private readonly fb: FormBuilder,
    private readonly postService: PostService,
    private readonly commentService: CommentService,
    private readonly likeService: LikeService,
    private readonly authService: AuthService,
    private readonly message: NzMessageService
  ) {
    this.postForm = this.fb.group({
      content: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadPosts();
  }

  loadPosts(): void {
    this.isLoading = true;
    this.postService.getNewsFeed().subscribe({
      next: (posts) => {
        this.posts = posts;
        this.posts.forEach(post => {
          this.commentForms[post.id] = this.fb.group({
            content: ['', [Validators.required]]
          });
          this.showComments[post.id] = false;
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.message.error('Failed to load posts');
        console.error('Error loading posts:', error);
        this.isLoading = false;
      }
    });
  }

  createPost(): void {
    if (this.postForm.valid) {
      const content = this.postForm.value.content;
      this.postService.createPost(content).subscribe({
        next: (newPost) => {
          this.posts = [newPost, ...this.posts];
          this.postForm.reset();
          this.message.success('Post created successfully');
          
          // Initialize comment form for the new post
          this.commentForms[newPost.id] = this.fb.group({
            content: ['', [Validators.required]]
          });
          this.showComments[newPost.id] = false;
        },
        error: (error) => {
          this.message.error('Failed to create post');
          console.error('Error creating post:', error);
        }
      });
    }
  }
  handleImageChange(event: any): void {
    if (event.file.status === 'done') {
      this.message.success('Image uploaded successfully');
      // Optionally store the URL of the image in the form or elsewhere
    } else if (event.file.status === 'error') {
      this.message.error('Image upload failed');
    }
  }

  toggleLike(post: Post): void {
    this.likeService.likePost(post.id).subscribe({
      next: (response) => {
        // Update the UI based on the response from the server
        post.userHasLiked = response.liked;
        
        if (response.liked) {
          // Post was liked
          post._count!.likes++;
        } else {
          // Post was unliked
          post._count!.likes--;
        }
      },
      error: (error) => {
        this.message.error('Failed to toggle like status');
        console.error('Error toggling like status:', error);
      }
    });
  }

  toggleComments(post: Post): void {
    this.showComments[post.id] = !this.showComments[post.id];
    
    if (this.showComments[post.id] && (!post.comments || post.comments.length === 0)) {
      this.loadComments(post);
    }
  }

  loadComments(post: Post): void {
    this.commentService.getCommentsByPostId(post.id).subscribe({
      next: (comments) => {
        post.comments = comments;
      },
      error: (error) => {
        this.message.error('Failed to load comments');
        console.error('Error loading comments:', error);
      }
    });
  }

  addComment(post: Post): void {
    const form = this.commentForms[post.id];
    if (form.valid) {
      const content = form.value.content;
      this.commentService.createComment(post.id, content).subscribe({
        next: (newComment) => {
          post.comments ??= [];
          post.comments.unshift(newComment);
          post._count!.comments++;
          form.reset();
          this.message.success('Comment added successfully');
        },
        error: (error) => {
          this.message.error('Failed to add comment');
          console.error('Error adding comment:', error);
        }
      });
    }
  }

  deletePost(post: Post): void {
    this.postService.deletePost(post.id).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.id !== post.id);
        this.message.success('Post deleted successfully');
      },
      error: (error) => {
        this.message.error('Failed to delete post');
        console.error('Error deleting post:', error);
      }
    });
  }

  deleteComment(post: Post, comment: Comment): void {
    this.commentService.deleteComment(comment.id).subscribe({
      next: () => {
        post.comments = post.comments?.filter(c => c.id !== comment.id);
        post._count!.comments--;
        this.message.success('Comment deleted successfully');
      },
      error: (error) => {
        this.message.error('Failed to delete comment');
        console.error('Error deleting comment:', error);
      }
    });
  }

  isPostOwner(post: Post): boolean {
    return this.currentUser?.id === post.userId;
  }

  isCommentOwner(comment: Comment): boolean {
    return this.currentUser?.id === comment.userId;
  }

  getProfileImageUrl(user: User): string {
    return getProfileImageUrl(user.profilePicture);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }
}
