import React from "react";

interface ButtonProps {
  text: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  loading?: boolean;                // NEW
  loaderPosition?: "replace" | "left" | "right"; // NEW
  py?: string;
  px?: string;
  fullWidth?: boolean;
  mt?: string;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  text,
  onClick,
  disabled = false,
  loading = false,
  loaderPosition = "replace",
  py,
  px,
  fullWidth = true,
  mt = "mt-6",
  className = "",
}) => {
  const base =
    "inline-flex items-center justify-center rounded-full text-primary-blue text-sm font-semibold " +
    "shadow-[0_10px_30px_rgba(0,0,0,0.12)] bg-secondary-blue transition " +
    "hover:shadow-[0_12px_36px_rgba(0,0,0,0.15)] hover:scale-[102%] duration-300 " +
    "disabled:opacity-60 disabled:cursor-not-allowed text-nowrap";

  const paddingY = py ?? "py-4 sm:py-5";
  const paddingX = px ?? "px-6";
  const width = fullWidth ? "w-full" : "w-auto";

  const Dot = ({ delay }: { delay: string }) => (
    <span
      className="h-1.5 w-1.5 rounded-full bg-white/90 animate-bounce"
      style={{ animationDelay: delay }}
    />
  );

  const Loader = (
    <span className="inline-flex items-center gap-1 py-2" aria-hidden="true">
      <Dot delay="0ms" />
      <Dot delay="150ms" />
      <Dot delay="300ms" />
    </span>
  );

  const content =
    loading && loaderPosition === "replace" ? (
      <>
        <span className="sr-only">Loading</span>
        {Loader}
      </>
    ) : loaderPosition === "left" && loading ? (
      <>
        {Loader}
        <span className="ml-2">{text}</span>
      </>
    ) : loaderPosition === "right" && loading ? (
      <>
        <span className="mr-2">{text}</span>
        {Loader}
      </>
    ) : (
      text
    );

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${base} ${mt} ${paddingY} ${paddingX} ${width} ${className}`.trim()}
    >
      {content}
    </button>
  );
};

export default Button;
