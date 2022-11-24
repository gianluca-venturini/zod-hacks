import { z } from './src/index';

//
// Internal documentation representation
//

type FieldType = 'string' | 'boolean' | 'number' | 'object' | 'date_iso_string' | 'unknown';
type SchemaValueType = Readonly<(string | number)[]>;
interface InternalSchemaDocumentation<T> {
    $description: string;

    $type: FieldType;

    /** Legal values that can be assigned. */
    $values?: SchemaValueType;

    /**
     * Indicates that this field is a discriminator field in a union. Only `string` and `number` types are supported as discriminator fields.
     * You are not supposed to set the property explicitly. Use SchemaExample.unionSchemas() when you want to create union documentation.
     */
    $isDiscriminator?: boolean;

    /** Documentation about the fields of this array or object. */
    $fields: { [K in keyof T]?: T[K] extends Array<any> ? InternalSchemaDocumentation<T[K][number]> : InternalSchemaDocumentation<T[K]> }; // Array are represented as a flat structure

    /**
     * Documentation about the fields of this array or object.
     * Only present if the documentation is the result of SchemaExample.unionSchemas().
     * Fields that are present only when the discriminator field assumes a specific value.
     *
     * E.g. `{ foo: { bar: <BAR>, baz: <BAZ> } }` (where <BAR> and <BAZ> are collections of fields) means that
     * * when the discriminator field `foo` assumes `foo='bar'`, then `<BAR>` should be added to the $fields
     * * when `foo='bar'`, then `<BAZ>` should be added to the $fields
     *
     * Make sure to always call `getFieldsFromDocumentation()` helper function in order to merge `$fields` and the correct subset of `$unionFields`
     */
    $unionFields: {
        [discriminatorField in string]: { [discriminatorValue in string]: { [K in keyof T]?: InternalSchemaDocumentation<T[K]> } };
    };

    /* Do not show this field in the documentation UI. **/
    $hidden: boolean;

    /** The current object is an array. */
    $isArray: boolean;
}

const USERNAME = z.string().doc({ description: 'this the username', hidden: true });
const USER = z.object({
  username: USERNAME.doc({ description: 'this is an override' })
});

/** Creates documentation from a Zod schema. */
function toDocumentation(field: z.ZodObject<z.ZodRawShape>) {
    const doc: InternalSchemaDocumentation<any> = {
        $description: field.documentation?.description ?? '',
        $type: 'unknown',
        $fields: {},
        $unionFields: {},
        $isArray: false,
        $hidden: field.documentation?.hidden ?? false,
    };
    if (field instanceof z.ZodObject) {
        doc.$type = 'object';
        // eslint-disable-next-line ban/ban
        for (const key of Object.keys(field.shape)) {
            doc.$fields[key] = toDocumentation(field.shape[key] as z.ZodObject<z.ZodRawShape>);
        }
    }
    if (field instanceof z.ZodString) {
        doc.$type = 'string';
    }
    return doc;
}

console.log(toDocumentation(USER));