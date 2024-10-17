import * as z from 'zod';

export const ThreadValidation = z.object({
    thread: z.string().nonempty().min(1, {message: 'MIN 1 character'}).max(100),
    accountId: z.string().nonempty()
})

export const CommentValidation = z.object({
    thread: z.string().nonempty().min(1, {message: 'MIN 1 character'}).max(100),
})