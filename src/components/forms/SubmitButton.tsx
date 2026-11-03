import { Loader2 } from 'lucide-react';

export function SubmitButton({ submitting, label }: { submitting: boolean; label: string }) {
  return (
    <button type="submit" className="btn-primary mt-7 w-full sm:w-auto sm:min-w-[220px]" disabled={submitting}>
      {submitting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Sending…
        </>
      ) : (
        label
      )}
    </button>
  );
}
