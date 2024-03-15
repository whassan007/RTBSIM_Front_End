import * as ts from 'typescript';

/**
 * Converts a TypeScript type definition string into an object notation.
 */
function convertToObject(typeDefinition: string): { [key: string]: any } {
  const typeObject: { [key: string]: any } = {};

  // Create a SourceFile from the type definition string
  const sourceFile = ts.createSourceFile('temp.ts', typeDefinition, ts.ScriptTarget.Latest, true);

  ts.forEachChild(sourceFile, node => {
    if (ts.isTypeAliasDeclaration(node)) {
      const typeName = node.name.getText(sourceFile);
      const typeValues: string[] = [];

      if (ts.isUnionTypeNode(node.type)) {
        node.type.types.forEach(typeNode => {
          if (ts.isLiteralTypeNode(typeNode) && ts.isStringLiteral(typeNode.literal)) {
            typeValues.push(typeNode.literal.text);
          }
        });
      } else if (ts.isTypeLiteralNode(node.type)) {
        typeValues.push(convertTypeLiteral(node.type));
      }

      typeObject[typeName] = { type: typeValues };
    }
  });

  return typeObject;
}

/**
 * Converts a type literal node into a string.
 */
function convertTypeLiteral(typeLiteral: ts.TypeLiteralNode): string {
  const properties: string[] = [];

  typeLiteral.members.forEach(member => {
    if (ts.isPropertySignature(member) && ts.isIdentifier(member.name)) {
      const propertyName = member.name.getText();
      const propertyType = member.type ? member.type.getText() : 'any';
      properties.push(`${propertyName}: ${propertyType}`);
    }
  });

  return `{ ${properties.join(', ')} }`;
}

// input string for convertToObject
const typeDefinition = `type Auction = {
  type: "open" | "pmp";
};`;

const result = convertToObject(typeDefinition);
console.log(result);
