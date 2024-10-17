"use server";

import { FilterQuery, SortOrder } from "mongoose";
import { revalidatePath } from "next/cache";
import User from "../models/User.model";

import { connectToDB } from "../mongoose";
import Thread from "../models/Thread.model";
import { skip } from "node:test";

interface Params {
    userId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
    path: string;
    onboarded: boolean;
  }
  

export async function updateUser({
  userId,
  bio,
  name,
  path,
  username,
  image,
  onboarded
}: Params): Promise<void> {
  try {
    await connectToDB();

    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded
      },
      { upsert: true }
    );

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}

export async function fetchUser(userId: string) {
  try {
    await connectToDB();
    return await User.findOne({ id: userId })
    // .populate({
    
    // });
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

export async function fetchUserPosts(userId: string) {
  try {
    await connectToDB();
    const threads = await User.findOne({ id: userId }).populate({
      path: "threads",
      model: Thread,
      populate: 
        {
          path: "children",
          model: Thread,
          populate: {
            path: "author",
            model: User,
            select: "name image id", // Select the "name" and "_id" fields from the "User" model
          },
        },
    });

    return threads;
  }
  catch (error: any) {
    throw new Error(`Failed to fetch user posts: ${error.message}`);
  }
}

export async function fetchUsers({userId, searchString, pageNumber = 1 , pageSize = 20, sortBy = "desc"} : {userId: string, searchString: string, pageNumber?: number, pageSize?: number, sortBy?: SortOrder}) {
  try {
    await connectToDB();
    const skipAmount = (pageNumber - 1) * pageSize;

    const regex = new RegExp(searchString, "i");

    const query : FilterQuery<typeof User> = {
      id: {$ne: userId},
    }

    if (searchString.trim() !== "") {
      query.$or = [
        {username : {$regex: regex}},
        {name : {$regex: regex}},
      ]
    }

    const sortOptions = {createdAt: sortBy};

    const userQuery = User.find(query).sort(sortOptions).skip(skipAmount).limit(pageSize);

    const totalUsersCount = await User.countDocuments(query);

    const users = await userQuery.exec();

    const isNext = totalUsersCount > skipAmount + users.length;

    return {users, isNext};

  }
  catch (error: any) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
}

export async function getActivity(userId: string) {
  try {
    await connectToDB();

    // find all threads created by the user
    const userThreads = await Thread.find({author: userId})

    // collect all the child thread ids
    const childThreadIds = userThreads.reduce((acc, userThread) => {
      return acc.concat(userThread.children);
    }, []);

    const replies = await Thread.find({
      _id: {$in: childThreadIds},
      author: {$ne: userId}
    }).populate({
      path: "author",
      model: User,
      select: "name image _id",
    });
    return replies;
  }
  catch (error: any) {
    throw new Error(`Failed to fetch activity: ${error.message}`);
  }
}