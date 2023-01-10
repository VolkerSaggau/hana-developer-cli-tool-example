// @ts-check
import * as base from '../utils/base.js'
import * as btp from '../utils/btp.js'
const colors = base.colors
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const inquirer = require('inquirer')
const TreePrompt = require('inquirer-tree-prompt')


export const command = 'btp [directory] [subaccount]'
export const aliases = ['btpTarget', 'btptarget', 'btp']
export const describe = base.bundle.getText("btpCmd")

export const builder = base.getBuilder({
    subaccount: {
        alias: ['sa'],
        type: 'string',
        desc: base.bundle.getText("btpSa")
    }
}, false)


export async function handler(argv) {
    let schema = {
        subaccount: {
            description: base.bundle.getText("btpSa"),
            type: 'string',
            required: false
        }
    }


    try {
        var account = await btp.getBTPGlobalAccount()
        try {
            console.log(`${base.bundle.getText("btpGlobal")}: ${colors.green(account.DisplayName)}`)
            let hierarchy = await btp.getBTPHierarchy()
            base.debug(hierarchy)
            inquirer.registerPrompt('tree', TreePrompt)

            let tree = []
            for (let item of hierarchy.children) {
                let children = []
                for (let itemSub of item.subaccounts) {
                    let child = {
                        name: `🧾 ${itemSub.displayName}`,
                        value: `{"guid": "${itemSub.guid}", "type": "item" }`,
                        short: `Selected: ${itemSub.displayName}`
                    }
                    children.push(child)
                }
                let leaf = {
                    name: `📁 ${item.displayName}`,
                    value: `{"guid": "${item.guid}", "type": "folder" }`,
                    children: children
                }
                tree.push(leaf)
            }
            for (let item of hierarchy.subaccounts) {
                let leaf = {
                    name: `🧾 ${item.displayName}`,
                    value: `{"guid": "${item.guid}", "type": "item" }`,
                    short: `Selected: ${item.displayName}`
                }
                tree.push(leaf)
            }
            inquirer
                .prompt([
                    {
                        type: 'tree',
                        name: 'subaccount',
                        message: base.bundle.getText("btpSa"),
                        validate: (value) => {
                            value = JSON.parse(value)
                            if (value.type === 'folder') { return false } else { return true }
                        },
                        tree: tree
                    }
                ])
                .then(answers => {
                    let value = JSON.parse(answers.subaccount)
                    schema.subaccount.default = value.guid
                    base.debug(schema)
                    base.promptHandler(argv, callBTP, schema)
                })
        } catch (error) {
            base.error(error)
        }
    } catch (error) {
        base.error(base.bundle.getText("err.BTPNoTarget"))
        base.end()
    }
}


export async function callBTP(prompts) {
    base.debug('callBTP')
    base.debug(prompts)
    try {
        base.setPrompts(prompts)
        let targetOutput = await btp.setBTPSubAccount(prompts.subaccount)
        console.log(targetOutput)

        return base.end()
    } catch (error) {
        base.error(error)
    }
}