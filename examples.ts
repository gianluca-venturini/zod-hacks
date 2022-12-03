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

// Note that you can't use .strict() on unions, you need to use it on single objects composing it
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

// Literals
const Literal = z.union([z.literal("a"), z.literal("b")]);
export type TypeLiteral = z.infer<typeof Literal>;

// Extends
const First = z.object({
    a: z.number(),
    b: z.number(),
});
const Second = z.object({
    ...First.shape,
    c: z.string(),
});
export type TypeSecond = z.infer<typeof Second>;

// Arrays
const Array = z.array(z.object({
    a: z.number(),
}))
export type TypeArray = z.infer<typeof Array>;

console.log('end');
