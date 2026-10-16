// Small, explicit teaching models. No hardware prediction or device connection.
export const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
export function qubit(theta,phi){const t=theta*Math.PI/180,p=phi*Math.PI/180;return {p0:Math.cos(t/2)**2,p1:Math.sin(t/2)**2,x:Math.sin(t)*Math.cos(p),y:Math.sin(t)*Math.sin(p),z:Math.cos(t),a:Math.cos(t/2),br:Math.sin(t/2)*Math.cos(p),bi:Math.sin(t/2)*Math.sin(p)};}
export function basisProbability(theta,phi,basis){const s=qubit(theta,phi);return clamp((1-(basis==='X'?s.x:s.z))/2,0,1);}
export function shots(p,n,rng=Math.random){let ones=0;for(let i=0;i<n;i++)if(rng()<p)ones++;return {zero:n-ones,one:ones};}
export const interactionRatio=r=>(6/r)**6; // normalized toy |V|/(ℏΩ), one chosen C6 and drive scale
export function czAmplitudes(entangle){return [.5,.5,.5,entangle?-.5:.5];}
export function cnot(a,b){return [a,a^b];}
export function correction(bits){const s1=bits[0]^bits[1],s2=bits[1]^bits[2];const idx=({'10':0,'11':1,'01':2})[`${s1}${s2}`];const corrected=[...bits];if(idx!==undefined)corrected[idx]^=1;return {syndrome:[s1,s2],index:idx,corrected};}
export function surfaceResources(d){return {data:d*d,ancilla:d*d-1,total:2*d*d-1,correctable:(d-1)/2};}
export function arrange(atoms,reservoir,capacity=16){const missing=capacity-atoms.filter(Boolean).length;const moved=Math.min(reservoir,missing);let left=moved;const filled=atoms.map(v=>v||left-->0);return {atoms:filled,reservoir:reservoir-moved,moved};}
