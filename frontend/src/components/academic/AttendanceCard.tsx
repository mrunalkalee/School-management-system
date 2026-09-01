export const AttendanceCard=({present=0,total=0}:{present?:number;total?:number})=><section className="card"><b>Attendance</b><p>{present}/{total} days present</p></section>;
