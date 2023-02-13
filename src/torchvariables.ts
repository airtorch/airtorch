//import { JSONObject } from "@lumino/coreutils";
import { Airtorch } from "./tokens";

export function getVariable(lineCode: string):string{
    const namesToDeleteArr = ['var', 'let','def'];
    let lineCodeNoExtraSpace = lineCode.replace(/\s+/g,' ').trim();
    const variableCode = lineCodeNoExtraSpace.split('=');
    const namesToDeleteSet = new Set(namesToDeleteArr);
    const variableCodeArray = variableCode[0].split(' ');
    const variableCodeArrayNoNamesToDelete = variableCodeArray.filter((name) => {
        // return those elements not in the namesToDeleteSet
        return !namesToDeleteSet.has(name);
    });
    return(variableCodeArrayNoNamesToDelete.join(' '));
}

export function getNameFromLine(lineCode: string):string{
    const variableRegex = /(\w+)\s*=\s*/;
    const functionRegex = /def\s+(\w+)\s*\(/;
    let match;

    if ((match = variableRegex.exec(lineCode)) !== null) {
        return match[1];
    } else if ((match = functionRegex.exec(lineCode)) !== null) {
        return match[1];
    } else {
        return null;
    }
}

export class TorchVariables implements Airtorch.IVariable
{
    name: string;
    variable_name: string;
    line_code: string;
    is_torched_variable: boolean;
    tag: string | null;
    line_number: number;

    constructor(
        name: string,
        variable_name: string,
        line_code: string,
        line_number: number,
        is_torched_variable= false,
        tag = 'Default'

    ){
        this.is_torched_variable = is_torched_variable;
        this.name = name;
        this.variable_name = variable_name;
        this.line_code = line_code;
        this.tag = tag;
        this.line_number = line_number;
    }

    public createJsonObject():Airtorch.IVariable{
        const jsonobj: Airtorch.IVariable = {
            'name': this.name,
            'variable_name': this.variable_name,
            'line_code': this.line_code,
            'line_number': this.line_number,
            'is_torched_variable': this.is_torched_variable,
            'tag': this.tag
        };
        return jsonobj;
    }
}
