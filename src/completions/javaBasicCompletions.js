



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
    const response = await fetch("/api/tools/java/editor/completions/basic", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: body
    });

    const completions = await response.json();


    console.log("basic completions", completions);


    //console.log(body)














    return {
        from: word.from,
        options: [
            ...completions.contextBasedInfo.keywords.map(k => ({label: k, type: "keyword"})),
            ...completions.contextBasedInfo.methods.map(k => ({label: k, type: "method", apply:k+"()"})),
            ...completions.contextBasedInfo.localVariables.map(k => ({label: k, type: "variable"})),
            ...completions.contextBasedInfo.fields.map(k => ({label: k, type: "variable"})),
            ...completions.projectTypes.map(t => ({
                label: t.name,
                type: "class",
                detail:t.packageWay,
                apply: (view, completion, from, to) => {
                    // при выборе подсказки
                    // Базовое поведение - вставка текста
                    view.dispatch({
                        changes: {from, to, insert: completion.label}
                    });
                    console.log(completion)

                    if (completion.detail!=null){
                        let importStatement = "\nimport "+completion.detail+"."+completion.label+";"

                        // Находим позицию для вставки import (после package declaration)
                        const doc = view.state.doc.toString();
                        const packageMatch = doc.match(doc.match(/^\s*package\s+[\w\.]+;/m));
                        console.log(packageMatch)
                        if (packageMatch) {
                            const importPos = packageMatch.index + packageMatch[0].length;

                            if (!doc.match(importStatement)){
                                view.dispatch({
                                    changes: {from: importPos, insert: importStatement}
                                });
                            }

                        }
                    }

                }
                })),
                ...completions.outerTypes.map(t => ({
                    label: t.name,
                    type: "class",
                    detail:t.packageWay,
                    apply: (view, completion, from, to) => {
                        // при выборе подсказки
                        // Базовое поведение - вставка текста
                        view.dispatch({
                            changes: {from, to, insert: completion.label}
                        });

                        if (completion.detail!=null){
                            let importStatement = "\nimport "+completion.detail+"."+completion.label+";"
                            console.log(importStatement)
                            // Находим позицию для вставки import (после package declaration)
                            const doc = view.state.doc.toString();
                            const packageMatch = doc.match(/^\s*package\s+[\w\.]+;/m);
                            if (packageMatch) {
                                const importPos = packageMatch.index + packageMatch[0].length;
                                if (!doc.match(importStatement)){
                                    view.dispatch({
                                        changes: {from: importPos, insert: importStatement}
                                    });
                                }

                            }
                        }

                    }
                }))
        ]
    };
}




