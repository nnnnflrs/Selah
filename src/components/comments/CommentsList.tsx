"use client";

import { useRealtimeComments } from "@/hooks/useRealtimeComments";
import { CommentItem } from "./CommentItem";
import { CommentForm } from "./CommentForm";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

interface CommentsListProps {
  recordingId: string;
}

export function CommentsList({ recordingId }: CommentsListProps) {
  const { comments, isLoading, hasMore, loadMore, addComment } =
    useRealtimeComments(recordingId);

  return (
    <div className="space-y-4">
      <CommentForm recordingId={recordingId} onCommentAdded={addComment} />

      <div className="space-y-0">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner size={20} />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-selah-500 text-center py-6">
            No comments yet. Be the first to share a thought.
          </p>
        ) : (
          <>
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
            {hasMore && (
              <div className="pt-2 text-center">
                <Button variant="ghost" onClick={loadMore}>
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
