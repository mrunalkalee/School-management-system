export const teacherStatus=(t)=>t.status||(t.isActive===false?'On Leave':'Active')
export const statusBadge=(s)=>`status ${s==='On Leave'?'leave':'active'}`
