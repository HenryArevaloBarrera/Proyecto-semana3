import type { Timestamp } from "firebase/firestore";

export interface Author {
    uid: string;
    displayName: string;
    photoURL: string | null;
}

export interface LikeInfo {
    uid: string;
    displayName: string;
    photoURL: string | null;
    likedAt: Timestamp;
}

/* ================================
   MEDIA (imagenes o videos)
================================ */

export interface MediaItem {
    url: string;
    type: "image" | "video";
}

/* ================================
   POST
================================ */

export interface Post {
    id: string;
    content: string;
    createdAt: Timestamp;
    author: Author;
    likes: LikeInfo[];
    media?: MediaItem[]; // hasta 5 fotos o videos
}

export type NewPost = Omit<Post, "id">;