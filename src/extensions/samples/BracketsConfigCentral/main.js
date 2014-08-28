/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, brackets, window, $, Mustache, navigator */

define(function (require, exports, module) {
    "use strict";
    
    // Brackets modules
    var FileUtils                   = brackets.getModule("file/FileUtils"),
        ExtensionUtils              = brackets.getModule("utils/ExtensionUtils"),
        DocumentManager             = brackets.getModule("document/DocumentManager"),
        MainViewFactory             = brackets.getModule("view/MainViewFactory"),
        ConfigViewContent           = require("text!htmlContent/Config.html");
        
    /* our module object */
    var _module = module;
    
    /* @type {Object.<string, ConfigView>} List of open views */
    var _viewers = {};
    
    function ConfigView(doc, $container) {
        this.$container = $container;
        this.doc = doc;
        this.json = JSON.parse(this.doc.getText());
        this.$view = $(Mustache.render(ConfigViewContent, this.json));
        this.$view.css({
            "background-image": "url(file://" + FileUtils.getNativeModuleDirectoryPath(_module) + "/htmlContent/logo-sm.png)",
            "background-position": "bottom right",
            "background-repeat": "no-repeat"
        });
        $container.append(this.$view);
        _viewers[doc.file.fullPath] = this;
    }
    
    /* 
     * Retrieves the file object for this view
     * return {!File} the file object for this view
     */
    ConfigView.prototype.getFile = function () {
        return this.doc.file;
    };
    
    /* 
     * Shows/Hides the view
     * @param {boolean} visible - true to show, false to hide
     */
    ConfigView.prototype.setVisible = function (visible) {
        this.$view.css("display", (!!visible) ? "block" : "none");
    };
    
    /* 
     * Updates the layout of the view
     */
    ConfigView.prototype.updateLayout = function () {
    };

    /* 
     * Destroys the view
     */
    ConfigView.prototype.destroy = function () {
        delete _viewers[this.doc.file.fullPath];
        this.$view.remove();
    };
    
    /* 
     * Determines if the view has focus
     * @return {boolean} true if the view has focus, false if not
     */
    ConfigView.prototype.hasFocus = function () {
        return this.$view.has(":focus");
    };

    /* 
     * Determines if a child of the view has focus
     * @return {boolean} true if the view has focus, false if not
     */
    ConfigView.prototype.childHasFocus = function () {
        // we have no children to receive focus
        return false;
    };
    
    /* 
     * Gives focus to the view
     */
    ConfigView.prototype.focus = function () {
        this.$view.focus();
    };

    /* 
     * Required interface - does nothing 
     * @returns {undefined}
     */
    ConfigView.prototype.getScrollPos = function () {
    };

    /* 
     * Required interface - does nothing 
     */
    ConfigView.prototype.adjustScrollPos = function () {
    };
    
    /* 
     * Required interface - does nothing 
     */
    ConfigView.prototype.getViewState = function () {
    };

    /* 
     * Required interface - does nothing 
     * @returns {undefined}
     */
    ConfigView.prototype.restoreViewState = function () {
    };
    
    /* 
     * Reparents the view 
     * @param {!jQuery} $container - the new parent
     */
    ConfigView.prototype.switchContainers = function ($container) {
        this.$view.detach().appendTo($container);
        this.$container = $container;
    };
    
    /* 
     * Retrieves the parent container
     * @return {!jQuery} parent
     */
    ConfigView.prototype.getContainer = function () {
        return this.$container;
    };
    
    /* 
     * Creates a view of a file (.brackets.json)
     * @param {!File} file - the file to create a view for
     * @param {!Pane} pane - the pane where to create the view
     * @private
     */
    function _createConfigViewOf(file, pane) {
        var result = new $.Deferred();
        
        DocumentManager.getDocumentForPath(file.fullPath)
            .done(function (doc) {
                var view = new ConfigView(doc, pane.$el);
                pane.addView(view, true);
                result.resolve(doc.file);
            })
            .fail(function (fileError) {
                result.reject(fileError);
            });
        
        return result.promise();
    }
    
    /* 
     *  Create a view factory that can create views for the file 
     *  `.brackets.json` in a project's root folder.
     */
    var configViewFactory = {
        canOpenFile: function (fullPath) {
            var filename = fullPath.substr(fullPath.lastIndexOf("/") + 1);
            return (filename.toLowerCase() === ".brackets.json");
        },
        openFile: function (file, pane) {
            return _createConfigViewOf(file, pane);
        }
    };
    
    /* load styles used by our template */
    ExtensionUtils.loadStyleSheet(module, "styles/styles.css");
    MainViewFactory.registerViewFactory(configViewFactory);
});