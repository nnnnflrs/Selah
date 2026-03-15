"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/authStore";
import { sileo } from "sileo";
import { generateAnonymousName } from "@/lib/utils/names";
import { MAX_COMMENT_LENGTH } from "@/lib/constants";
import { Comment } from "@/types/comment";
import styles from "./CommentForm.module.css";

interface CommentFormProps {
  recordingId: string;
  onCommentAdded?: (comment: Comment) => void;
}

export function CommentForm({ recordingId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, signIn } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <div className={styles.signInWrapper}>
        <button
          onClick={signIn}
          className={styles.signInButton}
        >
          Sign in to leave a comment
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = content.trim();
    if (!trimmed) return;

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/recordings/${recordingId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: trimmed,
          anonymous_name: generateAnonymousName(),
        }),
      });

      if (!res.ok) {
        let message = "Failed to post comment";
        try {
          const body = await res.json();
          message = body.error || message;
        } catch { /* non-JSON response */ }
        throw new Error(message);
      }

      const { data } = await res.json();
      onCommentAdded?.(data);
      setContent("");
    } catch (err) {
      sileo.error({
        title: err instanceof Error ? err.message : "Failed to post comment",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Leave a thought..."
        maxLength={MAX_COMMENT_LENGTH}
        rows={2}
        className={styles.textareaWrapper}
      />
      <Button
        type="submit"
        disabled={!content.trim()}
        isLoading={isSubmitting}
        className={styles.submitButton}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </Button>
    </form>
  );
}
