import('./dist/index.js').then(m => { 
  console.log('cjkIdeographic.parse(1023):', m.cjkIdeographic.parse(1023)); 
  console.log('tradChineseFormal.parse(1023):', m.tradChineseFormal.parse(1023)); 
  console.log('simpChineseFormal.parse(1023):', m.simpChineseFormal.parse(1023)); 
  console.log('cjkHeavenlyStem.parse(10):', m.cjkHeavenlyStem.parse(10)); 
  console.log('cjkEarthlyBranch.parse(12):', m.cjkEarthlyBranch.parse(12)); 
  console.log('integer.parseInt("一千零二十三"):', m.integer.parseInt('一千零二十三')); 
  console.log('integer.parseInt("癸"):', m.integer.parseInt('癸')); 
  console.log('integer.parseInt("亥"):', m.integer.parseInt('亥')); 
})
