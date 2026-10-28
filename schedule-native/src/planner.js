export const key='little-planner-v1', colors=['#d49159','#a7b88c','#92aec6','#c59fb6'];
export const fmt=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

export const parse=s=>new Date(s+'T12:00:00');

export function validDate(s){return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&fmt(parse(s))===s}

export function validData(d){return d&&['events','tasks'].every(k=>Array.isArray(d[k])&&d[k].length<=10000&&d[k].every(e=>e&&typeof e.id==='string'&&typeof e.title==='string'&&e.title.trim()&&e.title.length<=100&&validDate(e.date)&&colors.includes(e.color)&&(k==='tasks'?typeof e.done==='boolean':['none','daily','weekly','monthly','yearly'].includes(e.repeat)&&typeof e.allDay==='boolean'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(e.time)&&['off','0','10','30','60'].includes(e.reminder))))}

export function occurs(e,s){if(s<e.date)return false;let a=parse(e.date),b=parse(s);switch(e.repeat){case 'daily':return true;case 'weekly':return a.getDay()===b.getDay();case 'monthly':return a.getDate()===b.getDate();case 'yearly':return a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();default:return s===e.date}}

export function notificationPlan(events, clock = new Date()) {
    const now = clock.getTime(), candidates = [];
    for (const event of events) {
      if (event.allDay || event.reminder === 'off') continue;
      let found = 0;
      for (let offset = 0; offset < 366 * 5 && found < 60; offset++) {
        const day = new Date(clock); day.setHours(12, 0, 0, 0); day.setDate(day.getDate() + offset);
        const date = fmt(day);
        if (!occurs(event, date)) continue;
        const when = new Date(`${date}T${event.time}`).getTime() - Number(event.reminder) * 60000;
        if (when <= now) continue;
        candidates.push({ event, when, date }); found++;
        if (event.repeat === 'none') break;
      }
    }
    return candidates.sort((a,b) => a.when - b.when).slice(0,60);
}
