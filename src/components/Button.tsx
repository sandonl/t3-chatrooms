import React from "react";

export enum Variant {
  Primary,
  Secondary,
  InLine,
}

type ButtonProps = {
  onClick?: () => void;
  variant: Variant;
  children: string;
};

export const Button = ({ children, variant, ...props }: ButtonProps) => {
  const variantColors = {
    [Variant.Primary]: "bg-blue-300 hover:bg-blue-200",
    [Variant.Secondary]: "bg-gray-300 hover:bg-gray-200",
    [Variant.InLine]: "bg-gray-300 hover:bg-gray-200 py-1",
  };

  return (
    <button
      {...props}
      className={`text-md m-2 
          p-2 rounded text-white ${variantColors[variant]}`}
    >
      {children}
    </button>
  );
};
