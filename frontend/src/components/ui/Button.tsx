import type { ButtonHTMLAttributes } from "react"; export const Button=({children,...props}:ButtonHTMLAttributes<HTMLButtonElement>)=><button className="button" {...props}>{children}</button>;
