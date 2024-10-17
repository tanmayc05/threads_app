"use client";

import * as z from "zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { usePathname, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ThreadValidation } from "@/lib/validations/thread";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CommentValidation } from "@/lib/validations/thread";
import { addCommentToThread } from "@/lib/actions/thread.actions";


interface Props {
    threadId: string;
    currentUserImg: string;
    currentUserId: string;
}

const Comment = ({threadId, currentUserImg, currentUserId}: Props) => {
    const router = useRouter();
    const pathname = usePathname();
  
    const form = useForm({
      resolver: zodResolver(CommentValidation),
      defaultValues: {
        thread: '',
      },
    });

    const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
        await addCommentToThread(threadId, values.thread, JSON.parse(currentUserId), pathname);
        form.reset();
    };

    return (
        <Form {...form}>
        <form
          className='comment-form'
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name='thread'
            render={({ field }) => (
              <FormItem className='flex w-full gap-3 items-center'>
                <FormLabel>
                    <Image
                        src={currentUserImg}
                        alt="user"
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                    />
                </FormLabel>
                <FormControl className="border-none bg-transparent">
                  <Input
                    className="no-focus outline-none text-light-1"
                    type="text"
                    placeholder="Comment..."
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
            <Button
                type='submit'
                className='comment-form_btn'
            >
                Reply
            </Button>
        </form>
      </Form>
    );
}

export default Comment;