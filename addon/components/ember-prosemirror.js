import Component from '@ember/component';
import layout from '../templates/components/ember-prosemirror';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { buildMenuItems } from '../utils/custom-menu';
import { schema, defaultMarkdownParser } from "prosemirror-markdown";
import { defaultMarkdownSerializer } from '../utils/custom-markdown';
import { getDefaultPlugins } from '../utils/default-plugins-setup';
import { placeholderPlugin } from '../utils/placeholder-plugin';
import { tooltipMenuBarPlugin } from '../utils/tooltip-menubar-plugin';

export default Component.extend({
	layout,
	classNames: ['ember-prosemirror'],
	content: '',
	contentClassNames: '',
	view: '',

	focusOut() {
		let content = defaultMarkdownSerializer.serialize(this.get('view.state.doc'));
		this.get('onFocusOut')(content);
	},

	didInsertElement() {
		this._initProseMirror();
	},

	_initProseMirror() {
		let content = this.get('content');

		let plugins = getDefaultPlugins(schema);
		plugins.pushObject(placeholderPlugin('--'));
		plugins.pushObject(tooltipMenuBarPlugin({
				content: buildMenuItems(schema).fullMenu,
				contentClassNames: this.get('contentClassNames')
		}));

		let view = new EditorView(this.element, {
			state: EditorState.create({
				doc: defaultMarkdownParser.parse(content),
				plugins
			})
		});

		this.set('view', view);
	}
});
