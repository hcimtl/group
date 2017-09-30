

function unique(array, key) {
    const o = {};
    const tmp = [];
    if(key){
      for(let i = 0 ; i < array.length; i++){
        if(!o[array[i][key]]){
          o[array[i][key]] = true;
          tmp.push(array[i])
        }
      }
    } else {
      for(let i = 0 ; i < array.length; i++){
        if(!o[array[i]]){
          o[array[i]] = true;
          tmp.push(array[i])
        }
      }
    }
    return tmp;
}

export { unique }
