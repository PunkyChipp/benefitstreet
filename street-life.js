// A tiny transparent sprite crosses the existing street panorama.
function passerBy(turn){
 const palette={k:'#2b2431',b:'#517c92',B:'#84b3ad',s:'#d39779',h:'#705044',g:'#93a65f',p:'#df8ca8',w:'#ffdc99',c:'#bd774e',l:'#c5c2b5'};
 const walkers=[
 ['....kkk.....','...khhhk....','...ksssk....','....ssk.....','...kBBbk....','..kbBBbbk...','..ksBBbsk...','...kbbbk....','...kbbbk....','...kb.bk....','..kk..bkk...'],
 ['.....kk.....','...klllkk...','...ksslsk...','....ssk.....','...kpppk....','..kpppppk...','..kspppsk...','...kpppk....','..kpppppk...','...kk.kk....','..kk..kkk...'],
 ['............','............','............','............','.........c.c','........kcck','..c....kccck','..kcccccwwk.','...kccccck..','...ck..kck..','..kk....kk..']
 ];
 const sprite=walkers[Math.floor(turn/2)%walkers.length],c=document.createElement('canvas');c.width=12;c.height=11;c.className='route pedestrian';const ctx=c.getContext('2d');if(ctx)sprite.forEach((row,y)=>[...row].forEach((col,x)=>{if(palette[col]){ctx.fillStyle=palette[col];ctx.fillRect(x,y,1,1)}}));return c;
}
