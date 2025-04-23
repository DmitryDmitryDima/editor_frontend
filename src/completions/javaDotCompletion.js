

export default async function javaDotCompletion (context) {

    const before = context.matchBefore(/[\w.]*$/);
    if (!before || before.text.indexOf('.') < 0) return null;

    const object = before.text.split('.')[0];


    console.log("object...")
    console.log(object);
    console.log("before...")
    console.log(before.text);


    const way = "/api/editor/suggest/dot";

    /*
    current api request json
    {
    code:
    object:
    absolute}
     */




    // запрос на бэк
    const response = await fetch(way, {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({

            code: context.state.doc.toString(),
            object: object,
            line: context.state.doc.lineAt(context.pos).number,
            position:context.pos

        })
    });

    const completions = await response.json();
    console.log(completions);


    return {
        from: context.pos,
        options: completions.methods.map(c => ({label: c+"()", type: "method"}))
    };




}