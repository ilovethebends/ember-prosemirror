import Component from '@ember/component';
import layout from '../templates/components/ember-prosemirror';
import { EditorState, Plugin } from 'prosemirror-state';
import { EditorView, DecorationSet, Decoration } from 'prosemirror-view';
import { baseKeymap } from 'prosemirror-commands';
import { keymap } from 'prosemirror-keymap';
import { buildInputRules, buildKeymap } from 'prosemirror-example-setup';
import { buildMenuItems } from '../utils/custom-menu';
import { dropCursor } from 'prosemirror-dropcursor';
import { gapCursor } from 'prosemirror-gapcursor';
import { renderGrouped } from 'prosemirror-menu';
import { history } from 'prosemirror-history';
import crel from 'crel';
import { schema, defaultMarkdownParser } from "prosemirror-markdown";
import { defaultMarkdownSerializer } from '../utils/custom-markdown';

class ToolTipMenuBarView {
	constructor(editorView, options) {
		var prefix$2 = "ProseMirror-menubar";
		this.tooltip = crel('div', {
			class: 'ember-prosemirror-tooltip'
		});
		this.tooltip.className = "ember-prosemirror-tooltip toolcount";

		// document.querySelector('#modal-container').appendChild(this.tooltip);
		editorView.dom.parentNode.appendChild(this.tooltip)

		this.editorView = editorView;

		this.editorView.dom.addEventListener('blur', () => {
			this.tooltip.style.display = "none";
		});

		this.editorView.dom.className = 'border-1 rounded-lg px-10 border-gray-00 hover:border-dark-blue-20 focus:border-gray-50 py-6';
		this.options = options;

		this.menu = this.tooltip.appendChild(crel("div", {class: prefix$2}));
		this.menu.className = prefix$2;
		this.spacer = null;

		this.maxHeight = 0;
		this.widthForMaxHeight = 0;
		this.floating = false;

		var ref = renderGrouped(this.editorView, this.options.content);
		var dom = ref.dom;
		var update = ref.update;
		this.contentUpdate = update;
		this.menu.appendChild(dom);
		this.update(editorView, null);
	}

	update (view) {
		let state = view.state

		// Update menu contents
		this.contentUpdate(view.state);

		// Hide the tooltip if the selection is empty
		if (state.selection.empty) {
			this.tooltip.style.display = "none"
			return
		}

		// Otherwise, reposition it and update its content
		this.tooltip.style.display = ""
		let {from, to} = state.selection
		// These are in screen coordinates
		let start = view.coordsAtPos(from), end = view.coordsAtPos(to)
		// The box in which the tooltip is positioned, to use as base
		// let box = document.querySelector('aside').getBoundingClientRect();
		// // Find a center-ish x position from the selection endpoints (when
		// // crossing lines, end may be more to the left)
		// let left = Math.max((start.left + end.left) / 2, start.left + 3)
		// this.tooltip.style.left = (left - box.left) + "px"
		// this.tooltip.style.bottom = (box.bottom - start.top) + "px"
		let box = this.tooltip.offsetParent.getBoundingClientRect()
		// Find a center-ish x position from the selection endpoints (when
		// crossing lines, end may be more to the left)
		let left = Math.max((start.left + end.left) / 2, start.left + 3)
		this.tooltip.style.left = (left - box.left) + "px"
		this.tooltip.style.bottom = (box.bottom - start.top) + "px"

	}

	destroy() { this.tooltip.remove() }
	get content() {
		return defaultMarkdownSerializer.serialize(this.editorView.state.doc)
	}
}

function placeholderPlugin(text) {
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

export default Component.extend({
	layout,
	classNames: ['ember-prosemirror'],
	focusOut() {
		let content = defaultMarkdownSerializer.serialize(this.get('view.state.doc'));
		this.get('onFocusOut')(content);
	},
	didInsertElement() {
		this._initProseMirror();
	},
	_initProseMirror() {
		let plugins = [
			buildInputRules(schema),
			keymap(buildKeymap(schema)),
			keymap(baseKeymap),
			dropCursor(),
			gapCursor(),
			history(),
			placeholderPlugin('--'),
			this.toolTipMenuBar({
				content: buildMenuItems(schema).fullMenu
			})
		];

		let content = this.get('content');

		// this.element.querySelector('.content').innerHTML = content;

		let view = new EditorView(this.element, {
			state: EditorState.create({
				doc: defaultMarkdownParser.parse(content),
				plugins
			})
		});

		this.set('view', view);
	},

	toolTipMenuBar(options) {
		return new Plugin({
			view: function view(editorView) {
				return new ToolTipMenuBarView(editorView, options);
			}
		})
	}
});
