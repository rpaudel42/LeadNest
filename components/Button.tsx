import React from 'react';
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' };
export default function UIButton({ variant='primary', className='', children, ...props }: Props){
  const base = 'btn ' + (variant === 'primary' ? 'btn-primary' : 'btn-outline');
  return <button {...props} className={`${base} ${className}`}>{children}</button>;
}
