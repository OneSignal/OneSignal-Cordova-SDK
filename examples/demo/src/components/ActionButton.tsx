import type { ButtonHTMLAttributes, FC } from 'react';

type Variant = 'primary' | 'outline';

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const ActionButton: FC<ActionButtonProps> = ({
  variant = 'primary',
  className = '',
  ...props
}) => {
  const variantClass =
    variant === 'outline' ? 'action-btn outline' : 'action-btn';
  return (
    <button {...props} className={`${variantClass} ${className}`.trim()} />
  );
};

export default ActionButton;
