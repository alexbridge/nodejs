/** ====== Access ======== */
let obj = {}, map = new Map();

const elements = 100_000

/*
for (let i = 0; i < elements; i++) {
  obj[i] = [i];
  map.set(i, [i]);
}

let result;

console.time('Object');
console.warn('@@@', obj[Math.round(elements / 2)]);
console.timeEnd('Object');

console.time('Map');
console.warn('@@@', map.get(Math.round(elements / 2)));
console.timeEnd('Map');
*/

/** ====== Memory ======== */
let startMemory = process.memoryUsage().heapUsed
obj = {}
for (let i = 0; i < elements; i++) {
  obj[i] = {p: i, p2: i};
}
console.warn((process.memoryUsage().heapUsed - startMemory).toLocaleString())

startMemory = process.memoryUsage().heapUsed
const set = new Map();
for (let i = 0; i < elements; i++) {
  set.set(i, {p: i, i2: i});
}
console.warn((process.memoryUsage().heapUsed - startMemory).toLocaleString())

console.warn('@@@', JSON.stringify(set));
console.warn('@@@', JSON.parse(JSON.stringify(set)));


const numbs = [1,2,3]
delete numbs[1]
console.warn('@@@', JSON.stringify(numbs));



