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
