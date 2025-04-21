//
export default function snippetCompletions(context) {
    const snippets = [
        {
            label: "sout",
            type: "snippet",
            apply: "System.out.println();",
            

        },

        // ... other snippets
    ];

    return {
        from: context.matchBefore(/\w*/).from,
        options: snippets
    };
}