
function asc(a, b) {
  return a.name < b.name ? -1 : a.name > b.name ? 1 : 0
}

function intersect2(a,b){
  const tmp = {}
  const r = []
  const l = Math.max(a.length, b.length)
  for(let i = 0; i < l; i++){
    if(a[i]) tmp[a[i]] = true
    if(b[i] && tmp[b[i]]) r.push(b[i])
  }
  return r
}

function intersect(a,b){
  let small = null
  let big = null
  const r = []
  if(a.length > b.length) {
    small = b
    big = a
  } else {
    small = a
    big = b
  }
  for(let i = 0; i < small.length; i++){
    if(big.indexOf(small[i]) !== -1) r.push(small[i])
  }
  return r
}

export { asc, intersect }
