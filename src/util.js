
function asc(a, b) {
  return a.name < b.name ? -1 : a.name > b.name ? 1 : 0
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

// https://stackoverflow.com/questions/4197591/parsing-url-hash-fragment-identifier-with-javascript
function getHashParams() {
    var hashParams = {};
    var e,
        a = /\+/g,  // Regex for replacing addition symbol with a space
        r = /([^&;=]+)=?([^&;]*)/g,
        d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
        q = window.location.hash.substring(1);

    while (e = r.exec(q))
       hashParams[d(e[1])] = d(e[2]);

    return hashParams;
}

export { asc, intersect, getHashParams }
