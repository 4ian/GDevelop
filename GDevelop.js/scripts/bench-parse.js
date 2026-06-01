const path=require('path'); const init=require(path.join(__dirname,'../../Binaries/embuild/GDevelop.js/libGD.js'));
(async()=>{const gd=await init({print:()=>{},printErr:()=>{}});
  console.error('N | parse(ms) | parse+getType-on-deepest-leaf(ms)');
  for(const N of [500,1000,2000,4000]){
    const expr=Array.from({length:N},(_,i)=>`"x${i}"`).join(' + ');
    const parser=new gd.ExpressionParser2();
    let t=process.hrtime.bigint();
    const node=parser.parseExpression(expr);
    const parseMs=Number(process.hrtime.bigint()-t)/1e6;
    parser.delete();
    node.delete();
    console.error(`  ${String(N).padStart(4)} | ${parseMs.toFixed(1).padStart(8)}`);
  }
})();
