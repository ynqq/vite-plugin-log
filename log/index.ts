import type { Plugin } from 'vite';
import { babelParse, parse as vueParse } from 'vue/compiler-sfc'
import { parse } from '@babel/parser';
import generater from '@babel/generator';
import traverser, { NodePath } from '@babel/traverse';
import { ArrowFunctionExpression, BlockStatement, FunctionDeclaration, IfStatement, ReturnStatement, Statement, VariableDeclaration } from '@babel/types'
import { config, util, cache } from './util';

const traverse = (traverser as any).default as typeof traverser
const generate = (generater as any).default as typeof generater

export default function vitePluginConsoleLog(): Plugin {
    return {
        name: 'vite-plugin-ynqq-log',
        transform: {
            order: 'pre',
            handler(code, id) {
                if (id.endsWith('.vue')) {
                    const ast = vueParse(code)
                    const setupContent = ast.descriptor.scriptSetup!.content
                    const setupAst = babelParse(setupContent, {
                        sourceType: 'module',
                        plugins: ['jsx', 'flow'],
                        allowAwaitOutsideFunction: true,
                        allowImportExportEverywhere: true
                    })
    
                    traverse(setupAst, {
                        VariableDeclaration(path) {
                            if (checkHasId(path)) {
                                addFunConsoleByVar(path)
                            }
                        },
                        ArrowFunctionExpression(path) {
                            if (checkHasId(path)) {
                                addArrowFunConsoleByFun(path)
                            }
                        },
                        FunctionDeclaration(path) {
                            if (checkHasId(path)) {
                                addFunConsoleByFun(path)
                            }
                        }
                    })
                    const transformedCode = generate(setupAst).code;
                    ast.descriptor.scriptSetup!.content = transformedCode
    
                    code = code.replace(/<script setup lang="ts">.*<\/script>/s, `<script setup lang="ts">
            ${transformedCode}
</script>`)
                    return code
                }else if(id.endsWith('.js') || id.endsWith('.ts')){
                    const ast = parse(code, {
                        sourceType: 'module',
                        plugins: ['jsx', 'flow'],
                        attachComment: true,
                        allowAwaitOutsideFunction: true, // 允许在函数外使用 await
                        allowImportExportEverywhere: true, // 在任何地方使用 import/export
                    })
                    traverse(ast, {
                        VariableDeclaration(path) {
                            if (checkHasId(path, true)) {
                                addFunConsoleByVar(path)
                            }
                        },
                        ArrowFunctionExpression(path) {
                            if (checkHasId(path, true)) {
                                addArrowFunConsoleByFun(path)
                            }
                        },
                        FunctionDeclaration(path) {
                            if (checkHasId(path, true)) {
                                addFunConsoleByFun(path)
                            }
                        }
                    })
                    return generate(ast).code
                }
                return null;
            }
        }
    };
}

// 判断是否有#ynqq.log注释
function checkHasId(path: NodePath, fromParent = false) {
    let leadingComments = path.node.leadingComments
    if(fromParent){
        leadingComments = leadingComments || path.parent.leadingComments
    }
    if (leadingComments) {
        if (leadingComments.some(comment => util.checkId(comment.value))) {
            return true
        }
    }
}

// 校验 return cosnt/let/var代码并增加日志
function checkReturnVars(blockStatements: Statement[]) {
    for (let i = 0; i < blockStatements.length; i++) {
        let statement = blockStatements[i]
        if (isReturnStatement(statement)) {
            const id = util.getDataId('return')
            // 获取前面一行代码 如果有输出id就不往下执行
            const prevStatement = blockStatements[i - 1]
            if (prevStatement) {
                const prevStatementCode = generate(prevStatement).code
                if (prevStatementCode.includes(id)) {
                    continue
                }
            }
            // 将源代码的return data 截取为 data
            let codes = generate(statement).code.replace('return ', '')
            // 将return data 拼成 const x = data console.log(x)
            const dataStatement = `const ${id} = ${codes}
console.log('${config.log.RETURN}', ${id})`
            // 转换为ast插入到节点中
            parse(dataStatement).program.body
                .reverse()
                .forEach((b) => {
                    blockStatements.splice(i, 0, b)
                })
            // 将return data 替换成 return x
            const returnCode = `${id}`
            statement.argument = parse(returnCode).program.body[0] as any
            i += 2
        } else if (isVariableDeclaration(statement)) {
            const statementType = statement.declarations[0].init?.type
            if (statementType && ['ArrowFunctionExpression'].includes(statementType)) {
                continue
            }
            const statementCode = generate(statement).code
            if (!util.checkVar(statementCode)) {
                // 获取变量名称
                const varName = (statement.declarations[0].id as any).name
                // 获取下一行代码
                const nextStatement = blockStatements[i + 1]
                let canInsert = false
                if (nextStatement) {
                    const nextCode = generate(nextStatement).code
                    if (!nextCode.includes(config.log.VARS)) {
                        canInsert = true
                    }
                } else {
                    canInsert = true
                }
                if (canInsert) {
                    const appendCode = `console.log('${config.log.VARS}${varName}:', ${varName})`
                    blockStatements.splice(i + 1, 0, parse(appendCode).program.body[0])
                    i++
                }
            }
        } else if (isIfStatement(statement)) {
            const consequent = (statement as any).consequent.body
            if (consequent) {
                checkReturnVars(consequent)
            }
        }
    }
}

// 箭头函数内部添加代码
function addArrowFunConsoleByFun(path: NodePath<ArrowFunctionExpression>) {
    const blockStatements = (path.node.body as any).body
    if (blockStatements) {
        checkReturnVars(blockStatements)
    }
}
// 函数内部添加代码
function addFunConsoleByFun(path: NodePath<FunctionDeclaration>) {
    const blockStatements = path.node.body.body
    checkReturnVars(blockStatements)
}
// 使用const/let/var定义的函数
function addFunConsoleByVar(path: NodePath<VariableDeclaration>) {
    path.node.declarations.forEach(({ init }) => {
        if (init && (init as any)?.body?.body) {
            const blockStatements = (init as any).body.body
            checkReturnVars(blockStatements)
        }
    })
}

function isIfStatement(statement: any): statement is IfStatement {
    return statement.type === 'IfStatement'
}
function isVariableDeclaration(statement: any): statement is VariableDeclaration {
    return statement.type === 'VariableDeclaration';
}

function isReturnStatement(statement: any): statement is ReturnStatement {
    return statement.type === 'ReturnStatement'
}