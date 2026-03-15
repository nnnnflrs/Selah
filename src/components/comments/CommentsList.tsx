"use client";

import { useRealtimeComments } from "@/hooks/useRealtimeComments";
import { CommentItem } from "./CommentItem";
import { CommentForm } from "./CommentForm";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import styles from "./CommentsList.module.css";

interface CommentsListProps {
  recordingId: string;
}

export function CommentsList({ recordingId }: CommentsListProps) {
  const { comments, isLoading, hasMore, loadMore, addComment } =
    useRealtimeComments(recordingId);

  return (
    <div className={styles.container}>
      <CommentForm recordingId={recordingId} onCommentAdded={addComment} />

      <div className={styles.commentsContainer}>
        {isLoading ? (
          <div className={styles.loadingWrapper}>
            <Spinner size={20} />
          </div>
        ) : comments.length === 0 ? (
          <p className={styles.emptyMessage}>
            No comments yet. Be the first to share a thought.
          </p>
        ) : (
          <>
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
            {hasMore && (
              <div className={styles.loadMoreWrapper}>
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
