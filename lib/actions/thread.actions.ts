"use server"

import { connectToDB } from "../mongoose";
import Thread from "../models/Thread.model";
import User from "../models/User.model";
import { revalidatePath } from "next/cache";
import path from "path";

interface Params {
    text: string;
    author: string;
    communityId: string | null;
    path: string;
}


export async function createThread({text, author, communityId, path}: Params) {
    await connectToDB();

    try {
        const createdThread = await Thread.create({
            text,
            author,
            community: null,
        });

        // update user model
        await User.findByIdAndUpdate(author, {
            $push: { threads: createdThread._id }
        });

        revalidatePath(path);
    } catch (error) {
        console.error(error);
    }
}

export async function fetchThreads(pageNumber = 1, pageSize = 10) {
    await connectToDB();

    try {
        // calc number of posts to skip
        const skipAmount = (pageNumber - 1) * pageSize;
        const threads = Thread.find({parentId: {$in: [null, undefined]}}).sort({createdAt: 'desc'}).skip(skipAmount).limit(pageSize).populate({path: 'author', model: 'User'}).populate({path: 'children',
            populate: {
                path: 'author',
                model: 'User',
                select: "_id name parentId image"
            }
        })

        const totalPostsCount = await Thread.countDocuments({parentId: {$in: [null, undefined]}});

        const posts = await threads.exec();

        const isNextPage = totalPostsCount > pageNumber * pageSize;

        return {posts, isNextPage};
    } catch (error) {
        console.error(error);
    }

    return {posts: [], isNextPage: false};
}

export async function fetchThreadById(id: string) {
    await connectToDB();

    try {
        const thread = await Thread.findById(id)
        .populate({path: 'author', model: 'User', select: "_id id name  image"})
            .populate({path: 'children',
                populate: [{
                    path: 'author',
                    model: 'User',
                    select: "_id id name parentId image"
                },
                {
                    path: 'children',
                    model: 'Thread',
                    populate: {
                        path: 'author',
                        model: 'User',
                        select: "_id id name parentId image"
                    }
                }]
            }).exec();
        return thread;
    } catch (error) {
        console.error(error);
    }
}

export async function addCommentToThread(
    threadId: string,
    commentText: string,
    userID: string,
    path: string,
) {
    await connectToDB();

    try {
        // find original thread by id
        const originalThread = await Thread.findById(threadId);
        
        if (!originalThread) {
            throw new Error("Thread not found");
        }

        const commentThread = new Thread({
            text: commentText,
            author: userID,
            parentId: threadId,
        })

        // save comment thread
        const savedComment = await commentThread.save();

        // update original thread
        originalThread.children.push(savedComment._id);

        // save original thread
        await originalThread.save();

        revalidatePath(path);
    } catch (error) {
        console.error(error);
    }
}