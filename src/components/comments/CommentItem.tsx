import { Comment } from "@/types/comment";
import { relativeTime } from "@/lib/utils/time";
import styles from "./CommentItem.module.css";

interface CommentItemProps {
  comment: Comment;
}

export function CommentItem({ comment }: CommentItemProps) {
  return (
    <div className={styles.item}>
      <div className={styles.header}>
        <span className={styles.authorName}>
          {comment.anonymous_name}
        </span>
        <span className={styles.timestamp}>
          {relativeTime(comment.created_at)}
        </span>
      </div>
      <p className={styles.content}>
        {comment.content}
      </p>
    </div>
  );
}
