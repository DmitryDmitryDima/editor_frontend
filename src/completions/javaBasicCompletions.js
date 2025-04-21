




export default function javaBasicCompletions(context) {
    let word = context.matchBefore(/\w*/);
    console.log(word);
    if (word.from == word.to && !context.explicit) return null;

    // Basic Java keywords and common methods
    const keywords = [
        "abstract", "assert", "boolean", "break", "byte", "case", "catch",
        "char", "class", "const", "continue", "default", "do", "double",
        "else", "enum", "extends", "final", "finally", "float", "for",
        "if", "implements", "import", "instanceof", "int", "interface",
        "long", "native", "new", "package", "private", "protected",
        "public", "return", "short", "static", "strictfp", "super",
        "switch", "synchronized", "this", "throw", "throws", "transient",
        "try", "void", "volatile", "while"
    ];

    /*
    const commonMethods = [
        "println", "print", "length", "size", "add", "get", "set", "put",
        "contains", "equals", "hashCode", "toString"
    ];

     */

    const types = [
        "String", "Integer", "Double", "Float", "Boolean", "Object",
        "List", "ArrayList", "Map", "HashMap", "Set", "HashSet"
    ];

    return {
        from: word.from,
        options: [
            ...keywords.map(k => ({label: k, type: "keyword"})),
            //...commonMethods.map(m => ({label: m, type: "method"})),
            ...types.map(t => ({label: t, type: "class"})),
            {label: "main", type: "method", detail: "main method"},
            {label: "args", type: "variable", detail: "main method arguments"}
        ]
    };
}




