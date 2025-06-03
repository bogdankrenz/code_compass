export const basicFunction = `
function add(a: number, b: number) {
    return a + b;
}
`;

export const ifElseFunction = `
function checkAge(age:number){
    if(age >= 18 && age < 25) {
        return 'Young Adult';
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

export const assignmentCheck = `
let x = 5;
`;

export const unaryOperations = `
let count = 1;

count++

let flag = true;
flag = !flag
`;

export const functionCallAndMemberAccess = `
function greet(user: { name: string }) {
    console.log("Hello " + user.name);
}
`;

export const arrayOperations = `
const numbers = [1, 2, 3];
const doubled = numbers.map(n => n * 2);
const len = numbers.length;
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

export const negatedCondition = `
function isNotTrue(value: boolean) {
    return !value;
}
`;

export const defaultParameterFunction = `
function log(message: string = "default") {
    console.log(message);
}
`;

export const typescriptFeatures = `
enum Status {
    Active,
    Inactive
}

interface User {
    id: number;
    status: Status;
}

function getStatus(user: User): string {
    return Status[user.status];
}
`;

export const optionalChainingAndCoalescing = `
const user = { profile: { name: "Alice" } };
const name = user?.profile?.name ?? "Anonymous";
`;

export const destructuringExample = `
const person = { name: "Max", age: 30 };
const { name, age } = person;
`;

export const complexLogicalExpression = `
function canVote(user: { age: number, citizen: boolean }) {
    return user.age >= 18 && user.citizen || false;
}
`;

export const classWithMethod = `
class Car {
    constructor(private brand: string) {}
    drive() {
        console.log("Driving a " + this.brand);
    }
}
`;
