import { test } from 'node:test';
import assert from 'node:assert/strict';
import { occurs, validData } from './planner.js';
test('recurrence respects start date, weekdays, missing month days and leap years', () => {
  assert.equal(occurs({date:'2026-10-28',repeat:'daily'},'2026-10-27'),false);
  assert.equal(occurs({date:'2026-10-28',repeat:'weekly'},'2026-11-04'),true);
  assert.equal(occurs({date:'2026-10-28',repeat:'weekly'},'2026-11-05'),false);
  assert.equal(occurs({date:'2026-01-31',repeat:'monthly'},'2026-02-28'),false);
  assert.equal(occurs({date:'2026-01-31',repeat:'monthly'},'2026-03-31'),true);
  assert.equal(occurs({date:'2024-02-29',repeat:'yearly'},'2025-02-28'),false);
  assert.equal(occurs({date:'2024-02-29',repeat:'yearly'},'2028-02-29'),true);
});
test('legacy backup remains valid, malformed dates and reminders are rejected', () => {
 const event={id:'legacy',title:'予定',date:'2026-10-28',time:'09:00',allDay:false,repeat:'weekly',color:'#d49159',reminder:'10'};
 assert.ok(validData({events:[event],tasks:[]}));
 assert.equal(validData({events:[{...event,date:'2026-02-30'}],tasks:[]}),false);
 assert.equal(validData({events:[{...event,reminder:'unexpected'}],tasks:[]}),false);
});

import { notificationPlan } from './planner.js';
test('notification plan is ordered, capped and excludes expired, disabled and all-day events', () => {
 const event={id:'e',date:'2026-10-28',title:'予定',time:'09:00',allDay:false,repeat:'daily',color:'#d49159',reminder:'10'};
 const now=new Date('2026-10-28T08:55:00');
 const plan=notificationPlan([event,{...event,id:'off',reminder:'off'},{...event,id:'all',allDay:true}],now);
 assert.equal(plan.length,60);
 assert.equal(plan[0].date,'2026-10-29');
 assert.equal(plan[0].when,new Date('2026-10-29T08:50:00').getTime());
 assert.ok(plan.every(x=>x.event.id==='e'&&x.when>now.getTime()));
 assert.equal(notificationPlan([{...event,repeat:'none'}],now).length,0);
});
test('notification crossing midnight is scheduled on the preceding day',()=>{
 const event={id:'e',date:'2026-10-29',time:'00:15',repeat:'none',reminder:'30'};
 const plan=notificationPlan([event],new Date('2026-10-28T23:00:00'));
 assert.equal(plan.length,1);
 assert.equal(plan[0].when,new Date('2026-10-28T23:45:00').getTime());
});
