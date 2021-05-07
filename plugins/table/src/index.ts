import {
	CARD_KEY,
	EDITABLE_SELECTOR,
	isEngine,
	NodeInterface,
	Plugin,
	SchemaBlock,
} from '@aomao/engine';
import TableComponent, { Template } from './component';
import locales from './locale';
import './index.css';

class Table extends Plugin {
	static get pluginName() {
		return 'table';
	}

	init() {
		this.editor.language.add(locales);
		this.editor.schema.add(this.schema());
		this.editor.on('paser:html', node => this.parseHtml(node));
		this.editor.on('paste:each-after', child => this.pasteHtml(child));
	}

	schema(): Array<SchemaBlock> {
		return [
			{
				name: 'table',
				type: 'block',
				attributes: {
					class: 'data-table',
					style: {
						width: '@length',
					},
				},
			},
			{
				name: 'colgroup',
				type: 'block',
			},
			{
				name: 'col',
				type: 'block',
				attributes: {
					width: '@number',
					span: '@number',
				},
				allowIn: ['colgroup'],
			},
			{
				name: 'thead',
				type: 'block',
			},
			{
				name: 'tbody',
				type: 'block',
			},
			{
				name: 'tr',
				type: 'block',
				attributes: {
					style: {
						height: '@length',
					},
				},
				allowIn: ['tbody'],
			},
			{
				name: 'td',
				type: 'block',
				attributes: {
					colspan: '@number',
					rowspan: '@number',
					class: [
						'table-last-column',
						'table-last-row',
						'table-last-column',
						'table-cell-selection',
					],
				},
				allowIn: ['tr'],
			},
			{
				name: 'th',
				type: 'block',
				attributes: {
					colspan: '@number',
					rowspan: '@number',
				},
				allowIn: ['tr'],
			},
		];
	}

	execute(rows?: number, cols?: number): void {
		if (!isEngine(this.editor)) return;
		//可编辑子区域内不插入表格
		const { change } = this.editor;
		const range = change.getRange();
		if (range.startNode.closest(EDITABLE_SELECTOR).length > 0) return;
		//插入表格
		this.editor.card.insert(TableComponent.cardName, {
			rows: rows || 3,
			cols: cols || 3,
		});
	}

	pasteHtml(node: NodeInterface) {
		if (!isEngine(this.editor)) return;
		if (node.name === 'table') {
			this.editor.card.replaceNode(node, TableComponent.cardName, {
				html: node.get<HTMLElement>()!.outerHTML,
			});
		}
	}

	parseHtml(root: NodeInterface) {
		const { $ } = this.editor;
		root.find(`[${CARD_KEY}=${TableComponent.cardName}`).each(tableNode => {
			const node = $(tableNode);
			const table = node.find('table');
			if (table.length === 0) {
				node.remove();
				return;
			}
			table.css({
				outline: 'none',
				'border-collapse': 'collapse',
			});
			table.find('td').css({
				'min-width': '90px',
				'font-size': '14px',
				'white-space': 'normal',
				'word-wrap': 'break-word',
				border: '1px solid #d9d9d9',
				padding: '4px 8px',
				cursor: 'default',
			});
			table.find(Template.TABLE_TD_BG_CLASS).remove();
			table.find(Template.TABLE_TD_CONTENT_CLASS).each(content => {
				this.editor.node.unwrap($(content));
			});
			node.replaceWith(table);
		});
	}
}

export default Table;

export { TableComponent };