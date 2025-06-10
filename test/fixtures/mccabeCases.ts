export const basicFunction = `
function add(a:number, b:number){
    return a + b;
}
`;

export const ifElseFunction = `
function checkAge(age:number){
    if(age >= 18) {
        return 'Adult';
    } else {
        return 'Minor';
    }
}
`;

export const forLoopFunction = `
function sumUpTo(n:number) {
    let sum = 0;
    for(let i = 0; i < n; i++){
        sum += i;
    }
    return sum;
}
`;

export const arrowFunction = `
const multiply = (x:number, y:number) => x * y;
`;

export const nestedConditions = `
function validateUser(user: { age: number, active: boolean }) {
    if(user.age > 18) {
        if(user.active) {
            return true;
        }
    }
    return false;
}
`;

export const switchCaseFunction = `
function getColorCode(color: string) {
    switch(color) {
        case 'red':
            return '#FF0000';
        case 'green':
            return '#00FF00';
        case 'blue':
            return '#0000FF';
        default:
            return '#000000';
    }
}
`;

export const ternaryExpression = `
function isEven(n: number) {
    return n % 2 === 0 ? 'even' : 'odd';
}
`;

export const tryCatchBlock = `
function riskyOperation() {
    try {
        throw new Error("Oops");
    } catch (e) {
        console.error(e);
    }
}
`;

export const complexLogicalExpression = `
function canVote(user: { age: number, citizen: boolean }) {
    return user.age >= 18 && user.citizen || false;
}
`;

export const nestedTernary = `
function getCategory(score: number) {
    return score > 90 ? 'A' : score > 75 ? 'B' : 'C';
}
`;

export const tryCatchFinally = `
function safeExecute(fn: () => void) {
    try {
        fn();
    } catch (e) {
        console.error(e);
    } finally {
        console.log("Cleanup");
    }
}
`;

export const asyncFunction = `
async function fetchData(url: string) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Error');
        return await res.json();
    } catch (e) {
        console.error(e);
    }
}
`;
