import React from 'react';
import { Lock } from 'lucide-react';
import clsx from 'clsx';

const colorMap: Record<ButtonColor, string> = {
  red: 'bg-[#e5484d] hover:bg-[#d33a3f] active:bg-[#b92f33]', // Vermilion-like red
  emerald: 'bg-[#1f9c5a] hover:bg-[#198c4f] active:bg-[#137b45]', // Rich green, modern
  amber: 'bg-[#f5a623] hover:bg-[#e5981d] active:bg-[#d88a18]', // Golden amber, not neon
  zinc: 'bg-[#3a3a3a] hover:bg-[#2f2f2f] active:bg-[#262626]', // Refined neutral gray
  cyan: 'bg-[#2acfcf] hover:bg-[#23baba] active:bg-[#1ea5a5]', // Calm tech blue-cyan
  slate: 'bg-[#475569] hover:bg-[#364152] active:bg-[#2b3442]', // Slightly muted, works on light and dark
  // optional extra for default Tailwind purple but tuned
  purple: 'bg-[#7e3ff2] hover:bg-[#6b2fd4] active:bg-[#591fb7]',
};

type ButtonColor =
  | 'red'
  | 'emerald'
  | 'amber'
  | 'zinc'
  | 'cyan'
  | 'slate'
  | 'purple';

type SmartButtonProps = {
  label: string;
  onClick?: () => void;
  isProUser?: boolean;
  requiresPro?: boolean;
  color?: ButtonColor;
  icon?: React.ReactNode;
  className?: string;
};

/**
 * SmartButton
 *
 * A reusable, styled button component that optionally supports Pro-locking and color variants.
 *
 * Props:
 *
 * - `label: string`
 *   The text displayed on the button.
 *
 * - `onClick?: () => void`
 *   Function called when the button is clicked. Ignored if locked.
 *
 * - `isProUser?: boolean`
 *   Whether the current user has a Pro subscription.
 *
 * - `requiresPro?: boolean` (default: false)
 *   If true, the button will appear locked to non-Pro users.
 *
 * - `color?: ButtonColor` (default: "emerald")
 *   The visual color theme of the button.
 *
 * - `icon?: React.ReactNode`
 *   An icon to display on the right of the button.
 *
 * - `className?: string`
 *   Inputted class data.
 *
 * Supported `color` values:
 * - `"red"` → #e5484d
 * - `"emerald"` → #1f9c5a
 * - `"amber"` → #f5a623
 * - `"zinc"` → #3a3a3a
 * - `"cyan"` → #2acfcf
 * - `"slate"` → #475569
 * - `"purple"` → #7e3ff2
 *
 * Behavior:
 * - If `requiresPro` is true and `isProUser` is false:
 *   - Button is disabled
 *   - A tooltip appears on hover: "Requires a Pro subscription"
 *   - Lock icon is shown beside the label
 *
 * Example:
 * <SmartButton
 *   label="Select From Saved"
 *   onClick={handleClick}
 *   isProUser={user.isPro}
 *   requiresPro={true}
 *   color="amber"
 *   icon={<Arrow />}
 * />
 */

const SmartButton: React.FC<SmartButtonProps> = ({
  label,
  onClick,
  isProUser = false,
  requiresPro = false,
  color = 'emerald',
  icon,
  className,
}) => {
  const isLocked = requiresPro && !isProUser;

  const baseColor = colorMap[color] || colorMap['emerald'];
  const disabledColor = 'bg-zinc-500';

  const buttonClasses = clsx(
    'inline-flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-colors',
    isLocked
      ? `${disabledColor} opacity-60 cursor-not-allowed`
      : `text-white ${baseColor} cursor-pointer`,
    className
  );

  return (
    <div className="relative group inline-block">
      <button
        onClick={isLocked ? undefined : onClick}
        disabled={isLocked}
        className={buttonClasses}
      >
        {label}
        {isLocked ? <Lock size={14} /> : icon}
      </button>
      {isLocked && (
        <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 w-max max-w-xs rounded-md bg-gray-800 px-3 py-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          Requires a Pro subscription
        </div>
      )}
    </div>
  );
};

export default SmartButton;
