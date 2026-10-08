'use client'

import { useFormStatus } from 'react-dom'

type SubmitButtonProps = {
  form?: string
}

export function SubmitButton({ form } : SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      form={form}
      disabled={pending}
      aria-disabled={pending}
      className={`
        relative w-full flex items-center justify-center gap-2 px-5 py-3 
        font-medium text-sm transition-all duration-200 rounded-lg shadow-sm
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black
        ${
          pending
            ? 'bg-neutral-800 text-neutral-400 cursor-not-allowed opacity-90'
            : 'bg-black text-white hover:bg-neutral-800 active:scale-[0.99] cursor-pointer'
        }
      `}
    >
      {pending ? (
        <>
          {/* Subtle monochrome loading spinner */}
          <svg
            className="animate-spin -ml-1 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Creating Invoice...</span>
        </>
      ) : (
        <>
          <span>Create Invoice</span>
          {/* Subtle arrow icon pointing right to encourage action */}
          <svg
            className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </>
      )}
    </button>
  )
}