export interface SessionUser {
  id: string;
  fullName: string;
  email: string;
  preferredCategories: string[];
}

export interface ApiUser {
  id: string;
  email: string;
  full_name: string;
  preferred_categories: string[];
  created_at: string;
}

export interface Lecture {
  id: string;
  course_id: string;
  title: string;
  youtube_video_id: string;
  order_index: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  provider: string;
  source_url: string;
  created_at: string;
  lectures: Lecture[];
  lecture_count: number;
  enrolled: boolean;
  recommended: boolean;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
}

export interface Progress {
  id: string;
  user_id: string;
  lecture_id: string;
  completed_at: string;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  course_id: string;
  author_name: string;
  body: string;
  created_at: string;
}

export interface AuthPayload {
  email: string;
  password: string;
  fullName?: string;
  preferredCategories?: string[];
}

export interface ApiCoursesResponse {
  courses: Course[];
  preferred_categories: string[];
}

export interface ApiEnrollResponse {
  enrollment: Enrollment;
  course: Course;
}

export interface ApiProgressResponse {
  progress: Progress;
}

export interface ApiCommunityResponse {
  post: CommunityPost;
}