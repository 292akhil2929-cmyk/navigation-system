
import test from 'node:test';import assert from 'node:assert/strict';
import {distance,prepareDistance,normalizeRoute,project,guidance,pointAt,instruction,uaePoint} from '../src/navigation.js';
const raw={routes:[{distance:2000,duration:100,geometry:{coordinates:[[55,25],[55.01,25],[55.02,25]]},legs:[{steps:[{distance:1000,name:'Main Road',maneuver:{type:'depart'}},{distance:1000,name:'Exit Road',maneuver:{type:'off ramp',modifier:'right'}},{distance:0,maneuver:{type:'arrive'}}]}]}]};
test('GPS distance handles identical points and scale',()=>{assert.equal(distance([55,25],[55,25]),0);assert.ok(distance([55,25],[55.01,25])>900);});
test('early reminder lead time has bounded distance',()=>{assert.equal(prepareDistance(0,60),700);assert.equal(prepareDistance(30,60),1800);assert.equal(prepareDistance(100,100),3000);assert.equal(prepareDistance(-20,60),700);});
test('route step distances use same geometry scale as GPS progress',()=>{const r=normalizeRoute(raw);assert.ok(Math.abs(r.steps[1].at-r.total/2)<0.01);const g=guidance(r,100,30,60);assert.equal(g.prepare,true);assert.equal(g.exit.maneuver.type,'off ramp');});
test('projection follows along road and detects deviations',()=>{const r=normalizeRoute(raw);assert.ok(project(r,[55.005,25]).distance<1);assert.ok(project(r,[55.005,25.01]).distance>1000);});
test('passed exits stop generating early reminders',()=>{const r=normalizeRoute(raw);const g=guidance(r,r.steps[1].at+50,20,60);assert.equal(g.prepare,false);assert.equal(g.exit,undefined);});
test('arrival only when geometric remaining distance is small',()=>{const r=normalizeRoute(raw);assert.equal(guidance(r,r.total-10).arrived,true);assert.equal(guidance(r,r.total-100).arrived,false);});
test('preview interpolates and clamps route endpoints',()=>{const r=normalizeRoute(raw);assert.deepEqual(pointAt(r,0),[55,25]);assert.deepEqual(pointAt(r,r.total+100),[55.02,25]);const p=pointAt(r,r.total/4);assert.ok(p[0]>55&&p[0]<55.01);});
test('route matcher avoids jumping to distant later sections',()=>{const r={coords:[[55,25],[55.01,25],[55,25.00001],[55.01,25.00001]],cumulative:[0,1000,2000,3000]};const p=project(r,[55.005,25.00001],0);assert.ok(p.at<1800);});
test('UAE coordinate bounds reject non-finite and distant locations',()=>{assert.equal(uaePoint([55.27,25.2]),true);assert.equal(uaePoint([0,0]),false);assert.equal(uaePoint([NaN,25]),false);});
test('missing routes fail clearly',()=>{assert.throws(()=>normalizeRoute({routes:[]}),/No drivable route/);});
test('instructions retain exits and roundabout numbers',()=>{assert.match(instruction({exits:'39',maneuver:{type:'off ramp',modifier:'right'}}),/39/);assert.match(instruction({maneuver:{type:'roundabout',exit:3}}),/exit 3/);});
