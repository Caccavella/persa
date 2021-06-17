function createString() {
  let charArr = ['A', 'B', 'C'];
  let startPos = 0;
  let char = 'A';
  let charString = '';
  while (char != 'CT') {
    if(char[char.length-1] == 'Z') {
      char = charArr[startPos]+'A'
      startPos += 1;
    } else {
      if(char.length > 1) {
        char = char[0] + String.fromCharCode(char[char.length-1].charCodeAt(0) + 1);
      } else {
        char = String.fromCharCode(char.charCodeAt(0) + 1);
      }
    }
    charString += char + '1:' + char+ '66;';
  }
  console.log(charString);
}

function createString3() {
  let i = 0;
  let char = 'A';
  let charString = '';
  while ( i < 25) {
    char = String.fromCharCode(char.charCodeAt(0) + 1);
    charString += 'J'+char+',';
    i+=1;
  }
  console.log(charString);
}

function createString2() {
  let finalArr = ["JX","JY","JZ"]
  // let finalArr = ["DA","DB","DC","DD","DE","DF","DG","DH","DI","DJ","DK","DL","DM","DN","DO","DP","DQ","DR","DS","DT","DU","DV","DW","DX","DY","DZ"];
  let times = 1;
  let charArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  let startPos = 0;
  let char = 'A';
  let charString = '';
  while (!finalArr.includes(char)) {
    if(char[char.length-1] === 'X') {
      char = charArr[startPos]+'A'
      startPos += 1;
    } else if(char[char.length-1] === 'Y' ) {
      char = charArr[startPos]+'B'
      startPos += 1;
    } else if(char[char.length-1] === 'Z' ) {
      char = charArr[startPos]+'C'
      startPos += 1;
    } else {
      if(char.length > 1) {
        char = char[0] + String.fromCharCode(char[char.length-1].charCodeAt(0) + 3);
      } else {
        char = String.fromCharCode(char.charCodeAt(0) + 3);
      }
    }
    charString += char + '3:' + char+ '68;';
    times++;
  }
  console.log(times);
}

function createString4() {
  let charString = '';
  for (let index = 2; index < 292; index += 3) {
    charString += 'Col' + index + ',';
  }
  console.log(charString);
}

// createString();
// createString2();
// createString3();
createString4();