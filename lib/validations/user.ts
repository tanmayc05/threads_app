import * as z from 'zod';

export const UserValidation = z.object({
    profile_photo: z.string().url().nonempty(),
    name: z.string().min(3, {message: 'MIN 3 characters'}).max(30).nonempty(),
    username: z.string().min(3, {message: 'MIN 3 characters'}).max(30).nonempty(),
    bio: z.string().max(100)
})