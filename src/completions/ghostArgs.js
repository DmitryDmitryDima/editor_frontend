import { EditorView, Decoration } from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import {WidgetType} from "@uiw/react-codemirror";
import { StateField, StateEffect } from "@codemirror/state";


// длям удобства попадания в пустые скобки
class PlaceholderWidget extends WidgetType {
    constructor(pos) {
        super();
        this.pos = pos;
        console.log("created")
    }
    toDOM(view) {
        const span = document.createElement("span");
        span.textContent = "args";
        span.style.cssText = `
            opacity: 0.5;
            cursor: pointer;
            user-select: none;
        `;


        span.addEventListener("click", e => {
            console.log("clicked");
            e.stopPropagation();
            e.preventDefault();
            console.log("Widget clicked at position", this.pos);

            // при нажатии фокусируемся в скобках
            view.dispatch({
                selection: { anchor: this.pos },
                scrollIntoView: true
            });
        })


        return span;
    }
    ignoreEvent() { return false; }



}



// Ghost text for empty method brackets
export const ghostTextExtension = EditorView.decorations.compute(
    ["doc"],
    (state) => {
        const decorations = [];
        syntaxTree(state).iterate({
            enter(node) {

                if (node.name === "MethodDeclaration") {
                    const text = state.sliceDoc(node.from, node.to);
                    if (text.includes("()")) {
                        const pos = text.indexOf("()") + node.from + 1;
                        decorations.push(
                            Decoration.widget({
                                widget: new PlaceholderWidget(pos),
                                side: 1,
                            }).range(pos)
                        );
                    }
                }
            }
        });
        return Decoration.set(decorations);
    }
);

