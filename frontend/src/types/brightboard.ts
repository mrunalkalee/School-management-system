export type Role='Admin'|'Teacher'|'Student'|'Parent'; export interface User{id:string;name:string;role:Role} export interface Notice{id:string;title:string;body:string;audience:Role[]}
