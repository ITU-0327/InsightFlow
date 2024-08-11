import React, { ReactNode } from "react";

interface BaseCardProps {
  children: ReactNode;
  className?: string;
}

const BaseCard: React.FC<BaseCardProps> = ({ children, className }) => {
  return (
    <div
      className={`w-full rounded-lg shadow-lg border border-gray-300 bg-white p-6 ${className}`}
    >
      {children}
    </div>
  );
};

export default BaseCard;
