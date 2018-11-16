import { buildInputRules, buildKeymap } from 'prosemirror-example-setup';
import { keymap } from 'prosemirror-keymap';
import { dropCursor } from 'prosemirror-dropcursor';
import { gapCursor } from 'prosemirror-gapcursor';
import { baseKeymap } from 'prosemirror-commands';
import { history } from 'prosemirror-history';
import { Plugin } from 'prosemirror-state';

export function getDefaultPlugins(schema) {
	let plugins = [
		buildInputRules(schema),
		keymap(buildKeymap(schema)),
		keymap(baseKeymap),
		dropCursor(),
		gapCursor(),
		history()
	];

	return plugins.concat(new Plugin({
		props: {
			attributes: {class: "ProseMirror-example-setup-style"}
		}
	}));
}
