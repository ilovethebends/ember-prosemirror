import { DecorationSet, Decoration } from 'prosemirror-view';
import { Plugin } from 'prosemirror-state';

export function placeholderPlugin(text) {
	return new Plugin({
		props: {
			decorations(state) {
				let doc = state.doc
				if (doc.childCount > 1 || !doc.firstChild.isTextblock || doc.firstChild.content.size > 0)
					return;

				const placeHolder = document.createElement('div')
				placeHolder.classList.add('placeholder')
				placeHolder.textContent = text

				return DecorationSet.create(doc, [Decoration.widget(1, placeHolder)])
			}
		}
	});
}
