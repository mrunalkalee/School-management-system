export const SubjectPerformanceBar=({subject,score}:{subject:string;score:number})=><div><span>{subject}</span><progress value={score} max="100"/></div>;
