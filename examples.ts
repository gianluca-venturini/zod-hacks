import { toDeepStrict } from './hacks';
import { z } from './src/index';

const A = z.object({
    foo : z.object({
        a: z.string()
    })
});

const B = z.object({
    foo : z.object({
        b: z.string()
    })
});

// Note that you can't use .strict() on unions
const C = z.union([A, B]);

// Correctly infers types
export type TypeA = z.infer<typeof A>;
export type TypeC = z.infer<typeof C>;

C.parse({ foo: { a: 'hello' }});
C.parse({ foo: { b: 'hello' }});
try {
    // It doesn't validate
    C.parse({ foo: { c: 'hello' }});
} catch (error) {}

// Sanitize by default
console.log(C.parse({ foo: { a: 'hello', c: 'hello' }}));

try {
    // Throw error if extra key is in there
    console.log(A.strict().parse({ foo: { a: 'hello' }, bar: 'hello'}));
} catch (error) {}

try {
    // Throw error if extra key is in there deep
    // but requires a toDeepStrict() function
    console.log(toDeepStrict(C as any).parse({ foo: { a: 'hello', bar: 'hello' } }));
} catch (error) {}

console.log('end');
