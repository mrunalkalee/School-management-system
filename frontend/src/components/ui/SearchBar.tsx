export const SearchBar=({onChange}:{onChange?:(value:string)=>void})=><input className="input" placeholder="Search…" onChange={e=>onChange?.(e.target.value)}/>;
