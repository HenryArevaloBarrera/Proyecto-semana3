import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    Timestamp,
} from "firebase/firestore";

import imageCompression from "browser-image-compression";

import { db } from "../firebase";
import { uploadToCloudinary } from "./cloudinary.service";

import type { Post, Author, LikeInfo } from "../types/post";

const COLLECTION = "posts";
const postsRef = collection(db, COLLECTION);


/* ================================
   CREATE POST (CON MEDIA)
================================ */
export const updatePostMedia = async (
    postId: string,
    media: any[]
) => {

    await updateDoc(doc(db, COLLECTION, postId), {
        media
    });

};
export const createPost = async (
    content: string,
    files: File[],
    author: Author
): Promise<void> => {

    let media: { url: string; type: "image" | "video" }[] = [];

    if (files.length) {

        media = await Promise.all(

            files.map(async (file) => {

                let processedFile = file;

                // comprimir imágenes
                if (file.type.startsWith("image")) {

                    processedFile = await imageCompression(file, {
                        maxSizeMB: 0.7,
                        maxWidthOrHeight: 1920,
                        useWebWorker: true
                    });

                }

                return await uploadToCloudinary(processedFile);

            })
        );
    }

    await addDoc(postsRef, {
        content,
        createdAt: serverTimestamp(),
        author,
        likes: [],
        media
    });

};


/* ================================
   SUBSCRIBE POSTS
================================ */

export const subscribePosts = (callback: (posts: Post[]) => void): (() => void) => {

    const q = query(postsRef, orderBy("createdAt", "desc"));

    return onSnapshot(q, (snapshot) => {

        const posts = snapshot.docs
            .filter((d) => {

                const change = snapshot.docChanges().find(
                    (c) => c.doc.id === d.id
                );

                return !(d.metadata.hasPendingWrites && change?.type === "added");

            })
            .map((d) => ({
                id: d.id,
                ...(d.data() as Omit<Post, "id">),
            }));

        callback(posts);

    });

};


/* ================================
   UPDATE POST
================================ */

export const updatePost = async (id: string, content: string): Promise<void> => {

    await updateDoc(doc(db, COLLECTION, id), {
        content
    });

};


/* ================================
   DELETE POST
================================ */

export const deletePost = async (id: string): Promise<void> => {

    await deleteDoc(doc(db, COLLECTION, id));

};


/* ================================
   LIKE SYSTEM
================================ */

export const toggleLike = async (
    postId: string,
    currentLikes: LikeInfo[],
    userInfo: Author,
): Promise<void> => {

    const ref = doc(db, COLLECTION, postId);

    const alreadyLiked = currentLikes.some(
        (l) => l.uid === userInfo.uid
    );

    if (alreadyLiked) {

        await updateDoc(ref, {
            likes: currentLikes.filter(
                (l) => l.uid !== userInfo.uid
            ),
        });

    } else {

        const newLike: LikeInfo = {
            uid: userInfo.uid,
            displayName: userInfo.displayName,
            photoURL: userInfo.photoURL,
            likedAt: Timestamp.now(),
        };

        await updateDoc(ref, {
            likes: [...currentLikes, newLike],
        });

    }

};
