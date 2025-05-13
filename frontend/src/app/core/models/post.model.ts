import { User } from './user.model';
import { Comment } from './comment.model';

export interface Post {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  user?: User;
  comments?: Comment[];
  _count?: {
    comments: number;
    likes: number;
  };
  userHasLiked?: boolean;
}
