

export default async function basicSuggestion(context) {

    console.log(context)
    let word = context.matchBefore(/\w*/);



    console.log(word)

    // пустой ивент
    if (word.from === word.to && !context.explicit) return null;

    return {
        from: word.to,
        options: [
            {"label":"some suggestion", "type": "keyword"}, {"label":"some suggestion2", "type": "keyword"}
        ],

    }

}