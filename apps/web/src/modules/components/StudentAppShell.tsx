import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import './StudentAppShell.css';

export function StudentAppShell({ children }: { children: ReactNode }) {
  return <div className="erp"><aside className="erp-sidebar"><div className="erp-brand"><span>ES</span><div><strong>EduSmart</strong><small>School Management</small></div></div><nav aria-label="School Management navigation"><span className="erp-disabled">Dashboard</span><NavLink to="/students">Students</NavLink><NavLink to="/students/new">Add Student</NavLink></nav></aside><div className="erp-main">{children}</div></div>;
}
