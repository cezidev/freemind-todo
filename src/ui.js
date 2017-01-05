'use strict';
/**
 * Created by egslava on 27/12/2016.
 */

let inquirer = require('inquirer'),
    Node = require('./node');

// {
//     "CREATED":"1482734890708",
//     "ID":"ID_1056967150",
//     "LINK":"http://www.fonetiks.org/dictations/",
//     "MODIFIED":"1482834538269",
//     "TEXT":"fonetiks.org > Dictations"
// }

/**
 * Marks 'in-place' tasks. Without creation of the new copy of JSON.
 * @param tasks - all tasks in JSON form (just XML2JS)
 * @param marked - array of ids:
 * { "tasks": [
 *  "ID_1532930210",    // standard case. User just marked leaf
 *  "ID_606715181", // unreal situation. User marked 'stopped'-branch. But anyway, it's just a multi-icon test
 * ]}
 * It assumes that this array is generated by the 'inquirer' library
 */

function mark_ok(tasks, marked){
    const marks = marked['tasks'];

    const icon = {
        '$' : {
            'BUILTIN': 'button_ok'
        }
    };
    marks.forEach(id =>{
        // const a_node = tasks[tasks.findIndex((task)=>task['ID'] == id)];
        const a_node = Node.nodeById(tasks, id);

        if (!a_node.hasOwnProperty('icon')){
            a_node['icon'] = [];
            // Object.defineProperty(a_node, 'icon', {
            //     get: function() { return icon }
            // });
        }


        a_node['icon'].splice(0, 0, icon);  // inserting to 0 pos. 'ok' icons should be first
    });
}


function _commonPrefixLength(str1, str2){
    let i = 0;
    for(i = 0; i < Math.min(str1.length, str2.length); i++){
        if (str1[i] != str2[i]) break;
    }

    for(i; i > 0; i--){
        if (str1[i] == " ") break;
    }

    return i;
}



/**
 *
 * @param lines  ['daily -> Full-Stack -> Angular.io',
                  'daily -> Full-Stack -> Cucumber']
 @returns ['daily -> Full-Stack -> Angular.io',
           '---------------------- Cucumber']
 */
function removeCommonPrefixes(lines, symbol){
    const result = lines.sort().slice();
    for (let i = 0; i < lines.length; i++){
        for (let j = i+1; j < lines.length; j++){
            const prefix = _commonPrefixLength(lines[i], lines[j])
            if (prefix > 0){
                result[j] = symbol.repeat(prefix) + lines[j].substring(prefix);
            }
        }
    }
    return result;
}

function getHierachyLabels(tasks, tree, symbol){
    // console.log(JSON.stringify(tasks));
    // console.log(JSON.stringify(tree));
    const labels = tasks.map( (task) => {
        return { name: Node.getPath(tree, task.ID).map(node => node['$'].TEXT).join(" -> "), value: task.ID}
    }).sort( (_1, _2) => _1.name >= _2.name );

    const   names = labels.map(it => it.name),
        namesHierachy = removeCommonPrefixes(names, symbol);
    return labels.map((label, index) => {
        return {name: namesHierachy[index], value: label.value}
    });
}

function checkTasksPrompt(message, tasks, tree, callback) {
    const labels = getHierachyLabels(tasks, tree, "·");

    console.log(JSON.stringify(labels));
    labels.push(new inquirer.Separator());
    inquirer.prompt([
        {
            type: 'checkbox',
            message: message,
            name: 'tasks',
            choices: labels,
            pageSize: 18,
            validate: answer =>{
                if (answer.length < 1) {
                    return 'You must choose at least one topping.';
                }
                return true;
            }
        }
    ]).then( (answers) => {
        // console.log(JSON.stringify(answers, null, '  '));
        mark_ok(tree, answers);
        callback();
    }).catch(err => console.log(err.stack));
}



module.exports.checkTasksPrompt = checkTasksPrompt;
module.exports.mark_ok = mark_ok;
module.exports.removeCommonPrefixes = removeCommonPrefixes;
module.exports.getHierachyLabels = getHierachyLabels;

// var Sparkline = require('clui').Sparkline;
// var reqsPerSec = [10, 12, 3, 7, 12, 9, 23, 10, 9, 19, 16, 18, 12, 12];
//
//
// console.log(Sparkline(reqsPerSec, 'reqs/sec'));
