

export default async function  javaDotCompletion (context) {


    const before = context.matchBefore(/[\w.]*$/); // часть, записанная после последней точки
    if (!before || before.text.indexOf('.') < 0) return null;

    // извлекаем выражение, чтобы послать его на анализ в бэк
    let expression = context.state.doc.lineAt(context.pos).text;
    expression = expression.substring(0, expression.length-1); // убираем ненужную точку


    // todo помимо выражения, на бэк посылается позиция и контекст (весь код)






    const way = "/api/editor/suggest/dot";

    console.log(expression + ' expression');





    const line = context.state.doc.lineAt(context.pos);



    // запрос на бэк
    const response = await fetch(way, {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({

            code: context.state.doc.toString(),
            expression:expression,
            position:context.pos,
            line:line.number,
            column:context.pos - line.from

        })
    });

    const completions = await response.json();
    console.log(completions);


    return {
        from: context.pos,
        options: completions.methods.map(c => ({label: c+"()", type: "method"}))
    };




}