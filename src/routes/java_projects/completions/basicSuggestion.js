

export default async function basicSuggestion(context, api, project_id, file_id) {


    let word = context.matchBefore(/\w*/);


    let address
        = "/api/projects/java/"+project_id+"/actions/suggestion/basic/"+file_id+"?userText="
        +word.text+"&"+"line="+context.state.doc.lineAt(context.pos).number;

    console.log(address);


    // пустой ивент
    if (word.from === word.to && !context.explicit) return null;


    const response = await api.get(address);



    if (response.status===200) {
        return {

            from: word.from,
            options:[




            ...response.data.types.map(t=>({label: t.name,
                type: "class",
                detail:t.path}))]

        }}



    else {
        return null;
    }



}