import { Comment } from "@/types/comment";
import { relativeTime } from "@/lib/utils/time";

interface CommentItemProps {
  comment: Comment;
}

export function CommentItem({ comment }: CommentItemProps) {
  return (
    <div className="py-3 border-b border-selah-700/50 last:border-0 animate-fade-in">
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className="text-xs font-medium text-selah-300">
          {comment.anonymous_name}
        </span>
        <span className="text-xs text-selah-500 flex-shrink-0">
          {relativeTime(comment.created_at)}
        </span>
      </div>
      <p className="text-sm text-white/80 leading-relaxed break-words">
        {comment.content}
      </p>
    </div>
  );
}
