import { writeFileSync } from 'fs';
import { printSchema, lexicographicSortSchema } from 'graphql';
import { schema } from '../src/graphql/schema';

const schemaAsString = printSchema(lexicographicSortSchema(schema));
writeFileSync('schema.graphql', schemaAsString);
console.log('Schema generated at packages/functions/schema.graphql');

