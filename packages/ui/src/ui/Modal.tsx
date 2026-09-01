import type { ReactNode } from "react"; export const Modal=({open,children}:{open:boolean;children:ReactNode})=>open?<div role="dialog">{children}</div>:null;
