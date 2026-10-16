// Ideal two-qubit circuit model. A is the left bit in |AB>; no device prediction.
const radians=degrees=>degrees*Math.PI/180;
const gates=new Set(['H','X','T','RY','RZ','CZ','CNOT']);
function validate(op){
  if(!gates.has(op.gate))throw new RangeError('Unsupported gate');
  if(op.target!==0&&op.target!==1)throw new RangeError('Target must be A or B');
  if(['RY','RZ'].includes(op.gate)&&!Number.isFinite(op.angle))throw new RangeError('Rotation angle must be finite');
}
const multiply=([a,b],[c,d])=>[a*c-b*d,a*d+b*c];
const sum=([a,b],[c,d])=>[a+c,b+d];
function single(amplitudes,target,matrix){
  const mask=target===0?2:1;
  for(let i=0;i<4;i++)if(!(i&mask)){
    const j=i|mask,a=amplitudes[i],b=amplitudes[j];
    amplitudes[i]=sum(multiply(matrix[0],a),multiply(matrix[1],b));
    amplitudes[j]=sum(multiply(matrix[2],a),multiply(matrix[3],b));
  }
}
function apply(amplitudes,op){
  validate(op);
  const c=Math.cos(radians(op.angle||0)/2),s=Math.sin(radians(op.angle||0)/2),h=Math.SQRT1_2;
  if(op.gate==='H')single(amplitudes,op.target,[[h,0],[h,0],[h,0],[-h,0]]);
  if(op.gate==='X')single(amplitudes,op.target,[[0,0],[1,0],[1,0],[0,0]]);
  if(op.gate==='RY')single(amplitudes,op.target,[[c,0],[-s,0],[s,0],[c,0]]);
  if(op.gate==='RZ')single(amplitudes,op.target,[[c,-s],[0,0],[0,0],[c,s]]);
  if(op.gate==='T')single(amplitudes,op.target,[[1,0],[0,0],[0,0],[h,h]]);
  if(op.gate==='CZ')amplitudes[3]=amplitudes[3].map(x=>-x);
  if(op.gate==='CNOT'){
    const controlMask=op.target===0?1:2,targetMask=op.target===0?2:1;
    for(let i=0;i<4;i++)if((i&controlMask)&&!(i&targetMask)){
      const j=i|targetMask;[amplitudes[i],amplitudes[j]]=[amplitudes[j],amplitudes[i]];
    }
  }
}
export function runCircuit(program,input=0){
  if(!Number.isInteger(input)||input<0||input>3)throw new RangeError('Input must be a two-bit basis state');
  const amplitudes=Array.from({length:4},(_,i)=>[i===input?1:0,0]);
  const history=[amplitudes.map(a=>[...a])];
  for(const op of program){apply(amplitudes,op);history.push(amplitudes.map(a=>[...a]));}
  return {amplitudes,probabilities:amplitudes.map(([r,i])=>r*r+i*i),history};
}
export function compileCircuit(program){
  // Time order, left to right. These decompositions agree up to global phase.
  const h=target=>[{gate:'RZ',target,angle:180},{gate:'RY',target,angle:90}];
  return program.flatMap((op,source)=>{
    validate(op);let native;
    if(op.gate==='H')native=h(op.target);
    else if(op.gate==='X')native=[{gate:'RZ',target:op.target,angle:180},{gate:'RY',target:op.target,angle:180}];
    else if(op.gate==='T')native=[{gate:'RZ',target:op.target,angle:45}];
    else if(op.gate==='CNOT')native=[...h(op.target),{gate:'CZ',target:1},...h(op.target)];
    else native=[{...op}];
    return native.map(g=>({...g,source}));
  });
}
export function sampleRegister(probabilities,n,rng=Math.random){
  const counts=[0,0,0,0];
  for(let shot=0;shot<n;shot++){
    const r=rng();let cumulative=0;
    for(let i=0;i<4;i++){cumulative+=probabilities[i];if(r<cumulative||i===3){counts[i]++;break;}}
  }
  return counts;
}
