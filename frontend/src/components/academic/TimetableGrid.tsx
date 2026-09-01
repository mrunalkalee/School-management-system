export const TimetableGrid=({items=[]}:{items?:string[]})=><div className="grid">{items.map((x,i)=><div className="card" key={i}>{x}</div>)}</div>;
