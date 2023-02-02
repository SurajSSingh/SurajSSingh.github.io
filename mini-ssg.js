#!/usr/bin/env node

/*
MIT License

Copyright (c) 2021 Hilman Ramadhan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/* Modification made by Suraj Singh in accordance with MIT License

*/
import denoliver from 'https://deno.land/x/denoliver/mod.ts';
import { emptyDirSync, copy } from 'npm:fs-extra/esm';
import { readdirSync, statSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { extname } from 'node:path';
import process from 'node:process';

const dir = {
    static: "./dev/static",
    pages: "./dev/pages",
    layout: "./dev/_layouts",
    import: "./dev/_imports",
    component: "./dev/_components",
    public: "./docs/"
};

const patterns = {
    codeTag: /(<code([\S\s]*?)>([\S\s]*?)<\/code>)/g,
    import: /@import\((.*?)\)/g,
    layout: /@layout\((.*?)\)/g,
    attach: /@attach\((.*?)\)/g,
    section: /(@section)([\S\s]*?)(@endsection)/gi,
    simpleSection: /(@section\()(.*?),(.*?)(\))/g,
    component: /(@component)([\S\s]*?)(@endcomponent)/g,
    slot: /(@slot)([\S\s]*?)(@endslot)/g,
};


function runSSG() {

    let codeTagHolder = [];

    //Pages file
    const pages = readdirSync(dir.pages);
    const publicDir = dir.public;
    emptyDirSync(publicDir);
    createFolderIfNone(publicDir);
    pages.forEach(function (page) {
        generateFile(`${dir.pages}/${page}`, page);
    });

    //Static folder
    copy(dir.static, `${publicDir}`)
        .then(() => console.log('success!'))
        .catch(err => err);


    function generateFile(item, fileName) {
        //check if DIR
        if (statSync(item).isDirectory()) {
            return generatePageSubFolder(item);
        }

        //restart for new files
        codeTagHolder = [];

        let content = readFile(item);

        const ext = extname(fileName);
        if (ext == ".html") {
            content = renderPage(content);
            const folder = fileName.split('.')[0]; //get name with subfolder

            //except index, no folder.
            if (folder != 'index') {
                createFolderIfNone(`${publicDir}` + folder);
                fileName = folder + '/index.html';
            }
        }

        //save to new Dir
        writeFileSync(`${publicDir}/${fileName}`, content);
        return;
    }

    function generatePageSubFolder(item) {
        let subFolder = item.replace('./dev/pages/', '');

        const subPages = readdirSync(item);
        createFolderIfNone(`${publicDir}/${subFolder}`);

        subPages.forEach(function (page) {
            generateFile(`${dir.pages}/${subFolder}/${page}`, `${subFolder}/${page}`);
        });

        return;
    }

    function renderPage(content) {

        //Render Layout
        const layoutLabel = content.match(patterns.layout);
        if (layoutLabel != null) {
            content = content.replace(patterns.layout, renderTag.bind(this, 'layout'));
        }
        content = maskCodeTag(content);

        //Render simple section
        const simpleSectionLabels = content.match(patterns.simpleSection);
        if (simpleSectionLabels != null) {
            simpleSectionLabels.forEach(function (match) {
                content = content.replace(patterns.attach, renderSimpleSection.bind(this, content));
            });

            content = content.replace(patterns.simpleSection, '');
        }

        //Render complex section / swap attach & section
        const attachLabels = content.match(patterns.attach);
        if (attachLabels != null) {
            attachLabels.forEach(function (match) {
                content = content.replace(patterns.attach, renderLayout.bind(this, content));
            });

            content = content.replace(patterns.section, '');
        }

        //Render Import pages
        const importLabels = content.match(patterns.import);
        if (importLabels != null) {
            importLabels.forEach(function (match) {
                content = content.replace(patterns.import, renderTag.bind(this, 'import'));
            });
        }

        //Render components
        const componentLabels = content.match(patterns.component);
        if (componentLabels != null) {
            componentLabels.forEach(function (match) {
                content = content.replace(patterns.component, renderComponent.bind(this, content));
            });
        }

        return unMaskCodeTag(content.trim());
    }

    function maskCodeTag(content) {
        const codeTags = content.match(patterns.codeTag);
        if (codeTags != null) {
            codeTags.forEach(function (match) {
                let newHolder = 'code-nr-' + Math.floor(Math.random() * 99999);
                codeTagHolder[newHolder] = match;
                content = content.replace(match, newHolder);
            });
        }

        return content;
    }

    function unMaskCodeTag(content) {
        if (codeTagHolder != null) {
            for (const [key, value] of Object.entries(codeTagHolder)) {
                content = content.replace(key, value);
            }
        }

        return content;
    }

    function renderTag(type, text) {
        const fileName = getCompleteFileName(text, type);
        const content = readFile(fileName);
        return content;
    }

    function renderSimpleSection(content, text) {
        const attachName = getTagContent(text.split(',')[0]);

        const patternBetweenSection = /(?<=@section\()(.*),(.*)(?=\))/g;
        const matchSection = content.match(patternBetweenSection).filter(
            item => item.startsWith(attachName)
        )[0];

        //Since attach can include both simple & not simple Section
        //we need to make an exception
        if (matchSection == undefined)
            return text;

        const value = removeKeyName(matchSection);
        return value;
    }

    function renderLayout(content, text) {
        const attachName = getTagContent(text);
        const patternBetweenSection = /(?<=@section)([\S\s]*?)(?=@endsection)/g;

        const matchSection = content.match(patternBetweenSection).filter(
            item => item.startsWith("(" + attachName)
        )[0];

        if (matchSection == undefined) {

            if (attachName.includes(",")) {
                //attach has default value
                return removeKeyName(attachName);
            }
            return text;
        }

        const sectionContent = matchSection.replace(`(${attachName})`, '');
        return sectionContent;
    }

    function renderComponent(content, rawComp) {
        const compName = rawComp.split(")")[0].replace('@component(', '');
        let compContent = maskCodeTag(renderTag('component', compName));
        compContent = compContent.replace(patterns.attach, renderSlot.bind(this, rawComp));

        return compContent;
    }

    function renderSlot(rawComp, rawAttach) {
        const attachName = getTagContent(rawAttach);

        const patternBetweenSlot = /(?<=@slot)([\S\s]*?)(?=@endslot)/g;
        const slots = rawComp.match(patternBetweenSlot);

        let matchSlot = '';

        if (slots == null) { //If No slots mean simple component
            matchSlot = rawComp.split(')').slice(1).toString()
                .replace('@endcomponent', '');
        } else {
            matchSlot = slots.filter(
                item => item.startsWith("(" + attachName)
            )[0];
        }
        const slotContent = matchSlot.replace(`(${attachName})`, '');

        return slotContent;
    }

    function readFileRaw(filename) {
        return readFileSync(filename).toString();
    }

    function readFile(filename) {
        return maskCodeTag(readFileSync(filename).toString());
    }

    function getCompleteFileName(text, type) {
        let filename = '';
        switch (type) {
            case 'import':
                filename = getTagContent(text);
                return `${dir.import}/${filename}.html`;
                break;
            case 'layout':
                filename = getTagContent(text);
                return `${dir.layout}/${filename}.html`;
                break;
            case 'component':
                filename = text;
                return `${dir.component}/${filename}.html`;
                break;
            default:
                console.log('No type file matched.');
                break;
        }
    }

    function getTagContent(tag) {
        return tag.split("(")[1].replace(")", "");
    }

    function createFolderIfNone(dirName) {
        if (!existsSync(dirName))
            mkdirSync(dirName);

        return;
    }

    function removeKeyName(text) {
        const arrayOfText = text.split(",");
        arrayOfText.shift();
        return arrayOfText.toString().trim();
    }

} //end runSSG
runSSG(); //autoRun 1st time

//=================================
//==== LIVE RELOAD AND WATCH  =====
//=================================
const isServing = process.argv.includes('--serve');
const isVerbose = process.argv.includes('--verbose');
// if (isWatching) {
//     const live = new LiveReload($`{publicDir}`);
//     var params = {
//         watch: `${publicDir}`,
//         root: `${publicDir}`,
//         file: "index.html",
//         wait: 1000,
//         logLevel: 0,
//     };
//     LiveServer.start(params);

//     chokidar.watch('./dev').on('all', (event, path) => {
//         runSSG();
//     });
// }

if (isServing) {
    const server = await denoliver({ port: 6060, cors: true });
    console.log(server);
    const watcher = Deno.watchFs("./dev");
    for await (const event of watcher) {
        console.log("Rebuilding...");
        runSSG();
        if (isVerbose) console.log(">>>> event", event);
    }
}