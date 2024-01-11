function test(a, b) {
  const tests = /*html */ `<div>
                               <div>hihi</div><div>hihi</div> <div> <div>hihi</div>
                                 <div>hihi</div>
                               </div><div>
                                 <div >hihi< /div                ><div>hihi</div           >
       </div>
                               <div>
                  <div>hihi</div><div>hihi</div>
                               </div>
   <div>
            <div>hihi</div>
                                 <div>            <div        >hihi<     /div > <div>hihi</div><div>hihi</div>
                                     <div>   <div>hihi</div>
                                       <div>hihi</div>          </div><div>hihi</div> 
               <div>hihi</div>
  <div>
          <div>hihi</div>
                                     <div>hihi</div>
                                     <div>   <div>hihi</div>
                                       <div>hihi</button>          </div>
                                   </div>
                                   <div>hihi</div>
                                 </div>
                                 <div>hihi</div>
                               </div>
                             </div>`;
  return a + b;
}
