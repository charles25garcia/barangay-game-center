"use client";

import { FormEvent, useState } from "react";
import { Button, Card, FormField } from "@shared/components";
import { validateFeedPostContent } from "@shared/helpers";

interface FeedComposerProps {
  onSubmitPost: (input: { content: string }) => void;
}

export function FeedComposer({ onSubmitPost }: FeedComposerProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateFeedPostContent(content);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    onSubmitPost({ content });
    setContent("");
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField label="Share an update, achievement, or announcement" htmlFor="post-content" error={error}>
          <textarea
            id="post-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={3}
            placeholder="What's happening?"
            className="platform-field"
          />
        </FormField>

        <Button type="submit" className="self-start">
          Post
        </Button>
      </form>
    </Card>
  );
}
