/**
 * Copyright (C) 2015 Wasabeef
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const editorElement = document.querySelector('trix-editor');
const editor = editorElement.editor;
const RE = {
    editor,
};

RE.onChange = function() {
    RE.sendInputCallback();
};

// Not universally supported, but seems to work in iOS 7 and 8
// document.addEventListener('selectionchange', function() {
//     RE.backuprange();
// });

//looks specifically for a Range selection and not a Caret selection
RE.rangeSelectionExists = function() {
    //!! coerces a null to bool
    const sel = document.getSelection();
    if (sel && sel.type == 'Range') {
        return true;
    }
    return false;
};

RE.rangeOrCaretSelectionExists = function() {
    //!! coerces a null to bool
    const sel = document.getSelection();
    if (sel && (sel.type == 'Range' || sel.type == 'Caret')) {
        return true;
    }
    return false;
};

//RE.editor.addEventListener('input', function() {
//    RE.updatePlaceholder();
//    RE.backuprange();
//    RE.sendInputCallback();
//});
//
//RE.editor.addEventListener('focus', function() {
//    RE.backuprange();
//    RE.callback('focus');
//});
//
//RE.editor.addEventListener('blur', function() {
//    RE.callback('blur');
//});

RE.customAction = function(action) {
    RE.callback('action/' + action);
};

RE.callbackQueue = [];
RE.runCallbackQueue = function() {
    if (RE.callbackQueue.length === 0) {
        return;
    }

    setTimeout(function() {
        window.location.href = 're-callback://';
    }, 0);
};

RE.getCommandQueue = function() {
    let commands = JSON.stringify(RE.callbackQueue);
    RE.callbackQueue = [];
    return commands;
};

// Tells the editor that the contents have changed, user input action
RE.sendInputCallback = function() {
    RE.callback('input');
};

RE.callback = function(method) {
    RE.callbackQueue.push(method);
    RE.runCallbackQueue();
};

RE.setHtml = function(html) {
    editor.loadHTML(html);
};

RE.insertHTML = function(html) {
    editor.insertHTML(html);
};

RE.getHtml = function() {
    return editorElement.value;
};

RE.getText = function() {
    return editorElement.innerText;
};

RE.setBaseTextColor = function(color) {
    RE.editor.style.color = color;
};

RE.setPlaceholderText = function(text) {
    RE.editor.element.setAttribute('placeholder', text);
};

RE.updatePlaceholder = function() {
    RE.setPlaceholderText(RE.editor.element.getAttribute('placeholder'));
    RE.editor.e.fire('change.placeholder');
};

RE.removeFormat = function() {
    RE.command('removeFormat');
};

RE.setFontSize = function(size) {
    RE.editor.style.fontSize = size;
};

RE.setBackgroundColor = function(color) {
    RE.editor.style.backgroundColor = color;
};

RE.setHeight = function(size) {
    RE.editor.style.height = size;
};

RE.undo = function() {
    RE.command('undo');
};

RE.redo = function() {
    RE.command('redo');
};

RE.setBold = function() {
    RE.command('bold')
};

RE.setItalic = function() {
    RE.command('italic');
};

RE.setSubscript = function() {
    RE.command('subscript');
};

RE.setSuperscript = function() {
    RE.command('superscript');
};

RE.setStrikeThrough = function() {
    RE.command('strikeThrough');
};

RE.setUnderline = function() {
    RE.command('underline');
};

RE.setTextColor = function(color) {
    if (!color) {
        RE.backuprange();
        
        const node = RE.currentSelection.node;
        if (node) {
            node.style.color = null;
            RE.sendInputCallback();
        }
        return;
    }
    
    RE.restorerange();
    RE.command('foreColor', color);
};

RE.setTextBackgroundColor = function(color) {
    if (!color) {
        RE.backuprange();
        
        const node = RE.currentSelection.node;
        if (node) {
            node.style.backgroundColor = null;
            RE.sendInputCallback();
        }
        return;
    }
    
    RE.command('bgColor', color);
};

RE.setHeading = function(heading) {
    RE.command('heading', parseInt(heading, 10));
};

RE.setIndent = function() {
    RE.command('indent');
};

RE.setOutdent = function() {
    RE.command('outdent');
};

RE.setOrderedList = function() {
    RE.command('insertOrderedList');
};

RE.setUnorderedList = function() {
    RE.command('insertUnorderedList');
};

RE.setJustifyLeft = function() {
    RE.command('justifyLeft');
};

RE.setJustifyCenter = function() {
    RE.command('justifyCenter');
};

RE.setJustifyRight = function() {
    RE.command('justifyRight');
};
//
//RE.getLineHeight = function() {
//    return RE.editor.style.lineHeight;
//};
//
//RE.setLineHeight = function(height) {
//    RE.editor.style.lineHeight = height;
//};

RE.insertImage = function(url, alt) {
    const img = document.createElement('img');
    img.setAttribute('src', url);
    img.setAttribute('alt', alt);
    img.onload = RE.updateHeight;

    RE.insertHTML(img.outerHTML);
    RE.sendInputCallback();
};

RE.setBlockquote = function() {
    RE.command('formatBlock', '<blockquote>');
};

RE.insertLink = function(url, title) {
    const sel = document.getSelection();
    if (sel.toString().length !== 0) {
        if (sel.rangeCount) {
            let el = document.createElement('a');
            el.setAttribute('href', url);
            el.setAttribute('title', title);

            let range = sel.getRangeAt(0).cloneRange();
            range.surroundContents(el);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }
    
    RE.sendInputCallback();
};

RE.command = function (cmd, value) {
    const e = RE.editor;
    switch (cmd) {
        case 'indent':
            e.increaseNestingLevel();
            return;
            
        case 'outdent':
            e.decreaseNestingLevel();
            return;
            
        case 'undo':
            e.undo();
            return;
            
        case 'redo':
            e.redo();
            return;
            
        case 'strikeThrough':
            cmd = 'strike';
            break;

        case 'bgColor':
            return;

        case 'foreColor':
            return;

        case 'insertOrderedList':
            cmd = 'number';
            break;

        case 'insertUnorderedList':
            cmd = 'bullet';
            break;

        case '':
            return;
    }
    
    // toggle the attribute
    if (e.attributeIsActive(cmd)) {
        e.deactivateAttribute(cmd);
    } else {
        e.activateAttribute(cmd);
    }
};

RE.backuprange = function() {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) {
        return;
    }
    
    let node = selection.anchorNode;
    if (node.nodeType === 3) {
        // use the parent, if text node
        node = node.parentNode;
    }
    
    const range = selection.getRangeAt(0);
    RE.currentSelection = {
        startContainer: range.startContainer,
        startOffset: range.startOffset,
        endContainer: range.endContainer,
        endOffset: range.endOffset,
        node,
    };
};

RE.addRangeToSelection = function(selection, range) {
    if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
    }
};

// Programatically select a DOM element
RE.selectElementContents = function(el) {
    let range = document.createRange();
    range.selectNodeContents(el);
    let sel = window.getSelection();
    // this.createSelectionFromRange sel, range
    RE.addRangeToSelection(sel, range);
};

RE.restorerange = function() {
    let selection = window.getSelection();
    selection.removeAllRanges();
    let range = document.createRange();
    range.setStart(RE.currentSelection.startContainer, RE.currentSelection.startOffset);
    range.setEnd(RE.currentSelection.endContainer, RE.currentSelection.endOffset);
    selection.addRange(range);
};

RE.focus = function() {
    let range = document.createRange();
    range.selectNodeContents(RE.editor);
    range.collapse(false);
    let selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    RE.editor.focus();
};

RE.focusAtPoint = function(x, y) {
    const range = document.caretRangeFromPoint(x, y) || document.createRange();
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    RE.editor.focus();
};

RE.blurFocus = function() {
    RE.editor.blur();
};

/**
Recursively search element ancestors to find a element nodeName e.g. A
**/
const _findNodeByNameInContainer = function(element, nodeName, rootElementId) {
    if (element.nodeName == nodeName) {
        return element;
    } else {
        if (element.id === rootElementId) {
            return null;
        }
        _findNodeByNameInContainer(element.parentElement, nodeName, rootElementId);
    }
};

const isAnchorNode = function(node) {
    return ('A' == node.nodeName);
};

RE.getAnchorTagsInNode = function(node) {
    let links = [];

    while (node.nextSibling !== null && node.nextSibling !== undefined) {
        node = node.nextSibling;
        if (isAnchorNode(node)) {
            links.push(node.getAttribute('href'));
        }
    }
    return links;
};

RE.countAnchorTagsInNode = function(node) {
    return RE.getAnchorTagsInNode(node).length;
};

/**
 * If the current selection's parent is an anchor tag, get the href.
 * @returns {string}
 */
RE.getSelectedHref = function() {
    let href = '';
    let sel = window.getSelection();
    if (!RE.rangeOrCaretSelectionExists()) {
        return null;
    }

    let tags = RE.getAnchorTagsInNode(sel.anchorNode);
    //if more than one link is there, return null
    if (tags.length > 1) {
        return null;
    } else if (tags.length == 1) {
        href = tags[0];
    } else {
        let node = _findNodeByNameInContainer(sel.anchorNode.parentElement, 'A', 'editor');
        href = node.href;
    }

    return href || null;
};

window.onload = function() {
    RE.callback('ready');
    
    // register events
    editorElement.addEventListener('trix-change', function() {
        RE.onChange();
    });
};

