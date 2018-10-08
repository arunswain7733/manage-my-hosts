const config = require('./config');
const colors = require('colors');
const commander = require('commander');
const table = require('table').table;
const fs = require('fs');
const os = require('os');

const regexForIp = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;

if (process.argv[2] === undefined) {
    console.log(colors.yellow('Try : -h or --help'));
}

// path to hosts file
const filePath = config.filePath;
// const filePath = '/Users/smrutiranjanpatra/workspace/test/modify_host/hosts';

const tableBorderColor = config.tableBorderColor;
const tableHeaderColor = config.tableHeaderColor;

commander
    .version('0.1.0', '-v, --version')
    .option('-l, --list', 'Shows the list of hosts', displayHosts)
    .option('-d, --deactivate <lineNum>', 'Mention the line number to deactive the host', deactivateHost)
    .option('-a, --activate <lineNum>', 'Mention the line number to activate the host', activateHost)
    .option('-c, --create <ip> <domainm>', 'Mention the ip and domain to be added to the hosts file', createHost)
    .option('-r, --remove <lineNum>', 'Mention the line number to remove the host from the hosts file', removeHost)
    .option('-p, --print', 'Prints the entire hosts file', printHosts)
    .parse(process.argv);
    

function readFile() {
    const file = fs.readFileSync(filePath).toString();
    return file.split(os.EOL);
}

function displayHosts() {
    let data = readFile();
    let hostArray = [];
    data.forEach((value, key) => {
        value = value.trim();
        
        if (regexForIp.test(value)) {
            const serialNum = colors.bold(key + 1);
            const isActive = !value.startsWith('#');
            const status = isActive ? colors.bold.green('ACTIVE') : colors.bold.red('INACTIVE');
            const arr = value.replace(/#/g, '').split(/\s+/);
            const ip = isActive ? colors.green(arr[0]) : colors.red(arr[0]);;
            const domain = arr.slice(1, arr.length).join(' ');
            hostArray.push([serialNum, ip, domain, status]);
        }
    });

    printData(hostArray);
}

function deactivateHost(lineNum) {
    let data = readFile();
    let newFileData = '';
    let commentSymbol = '';
    data.forEach((value, key) => {
        commentSymbol = (lineNum - 1 == key && !value.startsWith('#')) ? '#' : '';
        newFileData += commentSymbol + value + os.EOL;
    });

    fs.writeFileSync(filePath, newFileData);
    displayHosts();
}

function activateHost(lineNum) {
    let data = readFile();
    let newFileData = '';
    data.forEach((value, key) => {
        if (lineNum - 1 == key && value.startsWith('#')) {
            value = value.slice(1, value.length)
        }
        newFileData += value + os.EOL;
    });

    fs.writeFileSync(filePath, newFileData);
    displayHosts();
}

function createHost(ip){
    if (!regexForIp.test(ip)) {
        console.log(colors.bold.red('Invalid IP provided'));
        return;
    } else if (process.argv[4] === undefined) {
        console.log(colors.bold.red('Domain not provided'));
        return;
    }

    let data = readFile();
    let newFileData = '';
    data.forEach((value, key) => {
        newFileData += value + os.EOL;
    });

    const domain = process.argv.slice(4, process.argv.length).join(' ');
    newFileData += ip + "\t" + domain ;

    fs.writeFileSync(filePath, newFileData);
    displayHosts();
}

function removeHost(lineNum) {
    let data = readFile();
    let newFileData = '';
    data.forEach((value, key) => {
        if (lineNum - 1 != key) {
            newFileData += value + os.EOL;
        }
    });

    fs.writeFileSync(filePath, newFileData);
    displayHosts();
}

function printHosts() {
    let data = readFile();
    data.forEach((value, key) => {
        value = value.trim();
        console.log(`${colors.cyan('[')} ${colors.green(key+1)} ${colors.cyan(']')} \t ${colors.red(': ')}` + 
        `${colors.white(value)}`);
    });
}

function printData(data) {
    const header = [colors.bold[tableHeaderColor]('LINE'), colors.bold[tableHeaderColor]('IP'), colors.bold[tableHeaderColor]('DOMAIN'), colors.bold[tableHeaderColor]('STATUS')];
    data.splice(0,0,header);

    const tableConfig = {
        border: {
            topBody: colors[tableBorderColor]('─'), topJoin: colors[tableBorderColor]('┬'), topLeft: colors[tableBorderColor]('┌'), topRight: colors[tableBorderColor]('┐'),
            bottomBody: colors[tableBorderColor]('─'), bottomJoin: colors[tableBorderColor]('┴'), bottomLeft: colors[tableBorderColor]('└'), bottomRight: colors[tableBorderColor]('┘'),
            bodyLeft: colors[tableBorderColor]('│'), bodyRight: colors[tableBorderColor]('│'), bodyJoin: colors[tableBorderColor]('│'),
            joinBody: colors[tableBorderColor]('─'), joinLeft: colors[tableBorderColor]('├'), joinRight: colors[tableBorderColor]('┤'), joinJoin: colors[tableBorderColor]('┼')
        }
    };
    
    console.log(table(data, tableConfig));
}