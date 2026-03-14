"use client";

interface PublicPrivateToggleProps {
  isPublic: boolean;
  onChange: (isPublic: boolean) => void;
  disabled?: boolean;
}

export function PublicPrivateToggle({
  isPublic,
  onChange,
  disabled = false,
}: PublicPrivateToggleProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm text-selah-300">Visibility</label>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(true)}
          className={`
            flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
            ${
              isPublic
                ? "bg-glow-grateful/20 text-glow-grateful border border-glow-grateful/30"
                : "bg-selah-800 text-selah-400 border border-selah-700 hover:border-selah-600"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          <div className="flex items-center justify-center gap-1.5">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            Public
          </div>
          <p className="text-xs mt-0.5 opacity-70">Visible on globe</p>
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(false)}
          className={`
            flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
            ${
              !isPublic
                ? "bg-glow-nostalgic/20 text-glow-nostalgic border border-glow-nostalgic/30"
                : "bg-selah-800 text-selah-400 border border-selah-700 hover:border-selah-600"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          <div className="flex items-center justify-center gap-1.5">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Private
          </div>
          <p className="text-xs mt-0.5 opacity-70">Only in your journal</p>
        </button>
      </div>
    </div>
  );
}
