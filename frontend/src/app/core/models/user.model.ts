export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  bio?: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  _count?: {
    posts: number;
    followedBy: number;
    following: number;
  };
}
