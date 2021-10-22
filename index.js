const { v4 } = require('uuid')
const fs = require('fs/promises')
const domData = require('./dom.json')

const Dom = () => {
	const root = domData
	let html = ''

	const saveElement = (id, node, newNode) => {
		node.forEach((item) => {
			if (item.id === id) {
				item.children.push(newNode)
				return
			} else if (item.children.length > 0) {
				saveElement(id, item.children, newNode)
			}
		})
	}

	const createNode = (
		parent = null,
		{
			tag = 'div',
			style = null,
			text = null,
			children = [],
			attribute = { selfClosing: false },
			event = null,
			data = null,
		} = {
			tag: 'div',
			style: null,
			text: null,
			children: [],
			attribute: { selfClosing: false },
			event: null,
			data: null,
		}
	) => {
		if (!parent && !root?.length) {
			root.push({
				id: v4(),
				tag,
				style,
				text,
				children,
				attribute,
				event,
				data,
			})
			return
		}

		saveElement(parent, root, {
			id: v4(),
			tag,
			style,
			text,
			children,
			attribute,
			event,
			data,
		})
	}

	const getRoot = () => root
	const getHtml = () => html
	const save = async (filename, data) => {
		await fs.writeFile(filename, JSON.stringify(data))
	}

	const clearCanvas = () => (html = '')
	const convertStyle = (style) => {
		let result = ''
		for (let key in style) {
			result += `${key}: ${style[key]}; `
		}
		return result
	}

	const paint = (node) => {
		return node
			.map((item) => {
				const { tag, style, text, children, attribute, event, data } = item

				const styleAtr = style ? `style="${convertStyle(style)}"` : ''
				if (attribute.selfClosing) {
					return `<${tag} ${styleAtr}/>`
				}

				if (children.length) {
					return `<${tag} ${styleAtr}>${paint(children)}</${tag}>`
				}

				if (text) {
					return `<${tag} ${styleAtr}>${text}</${tag}>`
				}
			})
			.join('')
	}

	const render = async () => {
		const elements = paint(root)

		const html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <title>Demo</title>
        </head>
        <body style="margin:0;">
            ${elements}
        </body>
        </html>`
		await fs.writeFile('index.html', html)
	}

	return {
		createNode,
		getRoot,
		save,
		render,
		clearCanvas,
	}
}

const dom = Dom()

dom.render()
