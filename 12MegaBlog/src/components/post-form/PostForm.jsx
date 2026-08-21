import React, { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, RTE, Select } from "..";
import appwriteService from "../../appwrite/config";
import authService from "../../appwrite/auth";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PostForm({ post }) {
    const { register, handleSubmit, watch, setValue, control, getValues } = useForm({
        defaultValues: {
            title: post?.title || "",
            slug: post?.$id || "",
            content: post?.content || "",
            status: post?.status || "active",
        },
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    const submit = async (data) => {
        setLoading(true);
        setError("");
        setSuccessMessage("");
        try {
            // Get user ID with fallback
            let currentUserId = userData?.$id;
            if (!currentUserId) {
                const currentAuth = await authService.getCurrentUser();
                currentUserId = currentAuth?.$id;
            }

            if (!currentUserId && !post) {
                throw new Error("You must be logged in to publish an article.");
            }

            if (post) {
                // Updating existing post
                const file = data.image?.[0] ? await appwriteService.uploadFile(data.image[0]) : null;

                if (file && post.featuredImage) {
                    await appwriteService.deleteFile(post.featuredImage);
                }

                const dbPost = await appwriteService.updatePost(post.$id, {
                    ...data,
                    featuredImage: file ? file.$id : undefined,
                });

                if (dbPost) {
                    setSuccessMessage("🎉 Article updated successfully! Redirecting...");
                    setTimeout(() => {
                        navigate(`/post/${dbPost.$id}`);
                    }, 1200);
                } else {
                    throw new Error("Failed to update the article. Please check your data and try again.");
                }
            } else {
                // Creating new post
                if (!data.image || !data.image[0]) {
                    throw new Error("Please select a cover image for your article.");
                }

                const file = await appwriteService.uploadFile(data.image[0]);

                if (!file) {
                    throw new Error("Failed to upload the cover image. Please check file format and size.");
                }

                const dbPost = await appwriteService.createPost({
                    ...data,
                    featuredImage: file.$id,
                    userId: currentUserId,
                });

                if (dbPost) {
                    setSuccessMessage("🎉 You have successfully published your article! Redirecting...");
                    setTimeout(() => {
                        navigate(`/post/${dbPost.$id}`);
                    }, 1200);
                } else {
                    throw new Error("Failed to publish the article. Please try again.");
                }
            }
        } catch (err) {
            console.error("Post submission error:", err);
            setError(err.message || "An unexpected error occurred while saving the post.");
        } finally {
            setLoading(false);
        }
    };

    const slugTransform = useCallback((value) => {
        if (value && typeof value === "string")
            return value
                .trim()
                .toLowerCase()
                .replace(/[^a-zA-Z\d\s]+/g, "-")
                .replace(/\s+/g, "-")
                .slice(0, 36);

        return "";
    }, []);

    React.useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === "title" && !post) {
                setValue("slug", slugTransform(value.title), { shouldValidate: true });
            }
        });

        return () => subscription.unsubscribe();
    }, [watch, slugTransform, setValue, post]);

    return (
        <form onSubmit={handleSubmit(submit)} className="space-y-6">
            {/* Success Message Banner */}
            {successMessage && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 text-sm font-bold flex items-center gap-3 shadow-md shadow-emerald-500/10 animate-fade-in">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">{successMessage}</p>
                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mt-0.5">Your changes are saved to the community journal.</p>
                    </div>
                </div>
            )}

            {/* Error Message Banner */}
            {error && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800 text-sm font-semibold flex items-center gap-3 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Content Area */}
                <div className="w-full lg:w-2/3 space-y-5">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
                        <Input
                            label="Post Title"
                            placeholder="Enter an engaging title..."
                            {...register("title", { required: true })}
                        />
                        <Input
                            label="Custom URL Slug (Max 36 characters)"
                            placeholder="url-slug"
                            maxLength={36}
                            {...register("slug", { required: true })}
                            onInput={(e) => {
                                setValue("slug", slugTransform(e.currentTarget.value), { shouldValidate: true });
                            }}
                        />
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
                        <label className="inline-block mb-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                            Content Body
                        </label>
                        <RTE name="content" control={control} defaultValue={getValues("content")} />
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="w-full lg:w-1/3 space-y-5">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
                        <h3 className="text-base font-bold text-slate-950 dark:text-white">
                            Publishing Settings
                        </h3>

                        <Input
                            label="Cover Image"
                            type="file"
                            accept="image/*, image/png, image/jpeg, image/jpg, image/webp, image/gif, image/svg+xml"
                            {...register("image", { required: !post })}
                        />

                        {post && post.featuredImage && (
                            <div className="w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                                <img
                                    src={appwriteService.getFilePreview(post.featuredImage)}
                                    alt={post.title}
                                    className="w-full h-36 object-cover"
                                />
                            </div>
                        )}

                        <Select
                            options={["active", "inactive"]}
                            label="Visibility Status"
                            {...register("status", { required: true })}
                        />

                        <div className="pt-2">
                            <Button
                                type="submit"
                                disabled={loading || !!successMessage}
                                className="w-full button-primary text-base py-3 font-bold cursor-pointer"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Publishing...
                                    </span>
                                ) : successMessage ? (
                                    "Published! ✓"
                                ) : post ? (
                                    "Update Article"
                                ) : (
                                    "Publish Article"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}