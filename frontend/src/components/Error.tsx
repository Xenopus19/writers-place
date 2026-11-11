import { RiCloseLine, RiErrorWarningLine } from '@remixicon/react';
import useError from '../hooks/useError';
import { Button } from './ui/button';

const Error = () => {
  const { error, dismissError } = useError();

  if (!error) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-[110] mx-auto flex max-w-md items-start gap-3 rounded-xl border border-[#e8d5cf] bg-[#fffefa] p-4 text-[#443c36] shadow-lg sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-full">
      <RiErrorWarningLine aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#a6574d]" />
      <p role="alert" className="min-w-0 flex-1 text-sm leading-5">{error.message}</p>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Dismiss error"
        onClick={dismissError}
        className="-m-2 size-8 shrink-0 text-[#73746a] hover:bg-[#f7f6f0] hover:text-[#303328]"
      >
        <RiCloseLine aria-hidden="true" className="size-4" />
      </Button>
    </div>
  );
};

export default Error;
