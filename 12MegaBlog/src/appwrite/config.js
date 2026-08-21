import conf from '../conf/conf.js';
import { Client, ID, Databases, Storage, Query, Permission, Role } from "appwrite";

export class Service{
    client = new Client();
    databases;
    bucket;
    
    constructor(){
        this.client
        .setEndpoint(conf.appwriteUrl)
        .setProject(conf.appwriteProjectId);
        this.databases = new Databases(this.client);
        this.bucket = new Storage(this.client);
    }

    async createPost({title, slug, content, featuredImage, status, userId}){
        try {
            // Appwrite requires Document ID to be max 36 chars and start with alphanumeric
            let documentId = ID.unique();
            if (slug && typeof slug === 'string' && slug.trim()) {
                const cleaned = slug.trim().toLowerCase().replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 36);
                if (cleaned && /^[a-zA-Z0-9]/.test(cleaned)) {
                    documentId = cleaned;
                }
            }

            const permissions = [
                Permission.read(Role.any()),
                ...(userId ? [
                    Permission.update(Role.user(userId)),
                    Permission.delete(Role.user(userId))
                ] : [])
            ];

            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                documentId,
                {
                    title,
                    content,
                    featuredImage,
                    status: status || "active",
                    userId,
                },
                permissions
            );
        } catch (error) {
            console.error("Appwrite service :: createPost :: error", error);
            throw error;
        }
    }

    async updatePost(slug, {title, content, featuredImage, status}){
        try {
            const dataToUpdate = {
                title,
                content,
                status,
            };
            if (featuredImage) {
                dataToUpdate.featuredImage = featuredImage;
            }

            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug,
                dataToUpdate
            );
        } catch (error) {
            console.error("Appwrite service :: updatePost :: error", error);
            throw error;
        }
    }

    async deletePost(slug){
        try {
            await this.databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug
            );
            return true;
        } catch (error) {
            console.error("Appwrite service :: deletePost :: error", error);
            return false;
        }
    }

    async getPost(slug){
        try {
            return await this.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug
            );
        } catch (error) {
            console.error("Appwrite service :: getPost :: error", error);
            return false;
        }
    }

    async getPosts(queries = []){
        try {
            const q = Array.isArray(queries) && queries.length > 0 ? queries : [];
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                q
            );
        } catch (error) {
            console.warn("Appwrite service :: getPosts with query failed, retrying without queries", error);
            try {
                // Resilient fallback if queries (like index on status) are missing in Appwrite dashboard
                return await this.databases.listDocuments(
                    conf.appwriteDatabaseId,
                    conf.appwriteCollectionId
                );
            } catch (fallbackError) {
                console.error("Appwrite service :: getPosts fallback :: error", fallbackError);
                return { documents: [] };
            }
        }
    }

    // File upload service with explicit public read permissions
    async uploadFile(file){
        try {
            return await this.bucket.createFile(
                conf.appwriteBucketId,
                ID.unique(),
                file,
                [
                    Permission.read(Role.any()),
                    Permission.read(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users())
                ]
            );
        } catch (error) {
            console.warn("Upload with custom permissions failed, falling back to standard upload", error);
            return await this.bucket.createFile(
                conf.appwriteBucketId,
                ID.unique(),
                file
            );
        }
    }

    async deleteFile(fileId){
        try {
            await this.bucket.deleteFile(
                conf.appwriteBucketId,
                fileId
            );
            return true;
        } catch (error) {
            console.error("Appwrite service :: deleteFile :: error", error);
            return false;
        }
    }

    getFilePreview(fileId){
        if (!fileId) return "";
        try {
            const result = this.bucket.getFileView(
                conf.appwriteBucketId,
                fileId
            );
            const urlStr = result?.href || (typeof result === 'string' ? result : String(result));
            if (urlStr && urlStr.startsWith("http") && urlStr !== "[object Object]") {
                return urlStr;
            }
        } catch (error) {
            console.warn("Appwrite service :: getFileView error, trying getFilePreview", error);
        }

        try {
            const preview = this.bucket.getFilePreview(
                conf.appwriteBucketId,
                fileId
            );
            const previewStr = preview?.href || (typeof preview === 'string' ? preview : String(preview));
            if (previewStr && previewStr.startsWith("http") && previewStr !== "[object Object]") {
                return previewStr;
            }
        } catch (err) {
            console.warn("Appwrite service :: getFilePreview error, using direct URL", err);
        }

        // Direct REST endpoint URL
        return `${conf.appwriteUrl}/storage/buckets/${conf.appwriteBucketId}/files/${fileId}/view?project=${conf.appwriteProjectId}`;
    }

    getFileView(fileId){
        if (!fileId) return "";
        try {
            const result = this.bucket.getFileView(
                conf.appwriteBucketId,
                fileId
            );
            const urlStr = result?.href || (typeof result === 'string' ? result : String(result));
            if (urlStr && urlStr.startsWith("http") && urlStr !== "[object Object]") {
                return urlStr;
            }
        } catch (error) {
            console.warn("Appwrite service :: getFileView error, using direct URL", error);
        }

        return `${conf.appwriteUrl}/storage/buckets/${conf.appwriteBucketId}/files/${fileId}/view?project=${conf.appwriteProjectId}`;
    }
}

const service = new Service();
export default service;