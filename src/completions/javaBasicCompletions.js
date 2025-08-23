



/*
данная функция также применима и для запроса обычных слов
 */
export default async function javaBasicCompletions(context, data, splat) {

    let word = context.matchBefore(/\w*/);


    // пустой ивент
    if (word.from == word.to && !context.explicit) return null;

    // готовим пост запрос - тут нам важен номер линии (чтобы полностью ее закомментировать для парсера), id's для кеша
    // мы передаем актуальное состояние кода, так как анализ разделяется на два этапа - внешние зависимости + внутренние.
    // Внутренние опираются на текущее состояние кода

    console.log(context.state.doc.lineAt(context.pos));

    let body = JSON.stringify({
            text: word.text, // то, что пользователь ввел - позволяет отфильтровать результаты на стороне сервера
            fullPath:splat,
            code: context.state.doc.toString(), // анализ внутренних зависимостей для формирования предложки
            line:context.state.doc.lineAt(context.pos).number,
            lineStart:context.state.doc.lineAt(context.pos).from, // место для коммента
            project_id:data.project_id, // данные нужны для анализа внешних зависимостей/проекта
            file_id:data.file_id,






        }
    )


    // запрос на бэк
    const response = await fetch("/api/tools/editor/completions/basic", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: body
    });

    const completions = await response.json();
    console.log(completions);



    //console.log(body)




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




