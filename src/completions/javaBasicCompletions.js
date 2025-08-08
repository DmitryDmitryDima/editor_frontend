



/*
данная функция также применима и для запроса обычных слов
 */
export default function javaBasicCompletions(context) {
    let word = context.matchBefore(/\w*/);
    // пустой ивент
    if (word.from == word.to && !context.explicit) return null;

    let body = JSON.stringify({
            text: word.text,
        }
    )


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




    // commit test

    const types = [
        "String", "Integer", "Double", "Float", "Boolean", "Object",
        "List", "ArrayList", "Map", "HashMap", "Set", "HashSet"
    ];

    return {
        from: word.from,
        options: [
            ...keywords.map(k => ({label: k, type: "keyword"})),
            //...commonMethods.map(m => ({label: m, type: "method"})),
            ...types.map(t => ({label: t, type: "class"}))
        ]
    };
}




