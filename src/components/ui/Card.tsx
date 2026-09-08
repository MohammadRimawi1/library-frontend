import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export function Card({ children, hover = false, className = '', ...rest }: CardProps) {
  return (
    <div
      className={`card ${hover ? 'transition-shadow duration-150 hover:shadow-card-hover' : ''} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}
