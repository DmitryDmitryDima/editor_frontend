

export default async function  javaDotCompletion (context) {


    const before = context.matchBefore(/[\w.]*$/); // часть, записанная после последней точки
    if (!before || before.text.indexOf('.') < 0) return null;

    // извлекаем выражение, чтобы послать его на анализ в бэк
    let expression = context.state.doc.lineAt(context.pos).text;
    expression = expression.substring(0, expression.length-1); // убираем ненужную точку




    const lastDotPos = before.text.lastIndexOf('.');
    const prefix = before.text.substring(lastDotPos + 1); // то, что введено после точки
    const from = before.from + lastDotPos + 1; // позиция начала ввода после точки








    const way = "/api/editor/suggest/dot";

    //console.log(expression + ' expression');





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

    let methods = completions.methods.map(c => ({label: c, type: "method", apply:c+"()"}));
    let fields = completions.fields.map(c => ({label: c, type: "variable", apply:c}));



    return {
        from: from, //context.pos,
        options: methods.concat(fields)
    };




}