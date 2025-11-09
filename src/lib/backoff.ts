export async function retry<T>(fn:()=>Promise<T>, attempts=5, baseMs=300) {
    let err:any;
    for (let i=0;i<attempts;i++){
      try { return await fn(); } catch(e){ err=e; await new Promise(r=>setTimeout(r, baseMs*(2**i))); }
    }
    throw err;
  }
  