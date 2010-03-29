'use strict';

/*!
* !important
*   github.com/premasagar/mishmash/tree/master/important/
*
*//*
    css !important manipulator (native JS + jQuery plugin)

    by Premasagar Rose
        dharmafly.com

    license
        opensource.org/licenses/mit-license.php
        
    v0.1

*//*
    creates methods
        jQuery(elem).important(method, [args])
        jQuery.important.noConflict
    
    overrides native jQuery methods for css(), width(), height(), animate(), show() and hide(), allowing an optional last argument of boolean true, to pass the request through the !important function
    
    use jQuery.important.noConflict() to revert back to the native jQuery methods, and returns the overriding methods
    
    reference
        http://www.w3.org/TR/CSS2/syndata.html#tokenization

*/
(function($){

    // create CSS text from property & value, optionally inserting it into the supplied CSS rule
    // e.g. declaration('width', '50%', 'margin:2em; width:auto;');
    function cssDeclaration(property, value, rules){ // if value === null, then remove from style; if style then merge with that
    
        // return a regular expression of a declaration, with the backreferences as the CSS property and the value
        function regexDeclaration(property){
            return new RegExp('(' + property + ')\\s*:\\s*([^;]*(?:;|$))', 'i');
        }
        function find(property, rules){
            return rules.match(regexDeclaration(property));
        }
    
        var oldDeclaration, newDeclaration, makeImportant;
        
        rules = rules || '';
        oldDeclaration = find(property, rules);
            
        if (value === null){
            newDeclaration = '';
        }
        else if (typeof value === 'string'){
            newDeclaration = property + ':' + value + ' !important;';
        }
        
        if (oldDeclaration){
            if (typeof value === 'boolean'){
                makeImportant = value;
                newDeclaration = $.important(property + ':' + oldDeclaration[2], makeImportant);
            }
            
            rules = rules.replace(oldDeclaration[0], newDeclaration);
        }
        
        else if (typeof newDeclaration !== 'undefined'){
            rules = $.trim(rules);
            if (rules !== ''){
	            if (rules.slice(-1) !== ';'){
		            rules += ';';
	            }
	            rules += ' ';
            }
            rules += newDeclaration;
        }
        return rules;
    }
    
    
    // Native JS function for inserting !important rules into an element
    // Not required when jQuery(elem).important is available
    /*
    function insertDeclaration(elem, property, value){
        return elem.setAttribute('style', cssDeclaration(property, value, elem.getAttribute('style')));
    }
    */
    
    
    // Add !important to the end of CSS rules, except to those that already have it
    function toImportant(rulesets, makeImportant){
        // Cache regular expression
        var re = toImportant.re;
        if (!re){
            re = toImportant.re =
                /\s*(! ?important)?[\s\r\t\n]*;/g;
                // TODO: Make this regexp handle missing semicolons at the end of a ruleset
        }
        if (makeImportant === false){
            return rulesets.replace(re, ';');
        }
        return rulesets.replace(re, function($0, $1){
            return $1 ? $0 : ' !important;';
        });
    }
    
    function htmlStylesToImportant(html, makeImportant){
        // Cache regular expression
        var re = htmlStylesToImportant.re;
        if (!re){
            re = htmlStylesToImportant.re =
                /(?=<style[^>]*>)([\w\W]*?)(?=<\/style>)/g;
        }
        return html.replace(re, function($0, rulesets){
            return toImportant(rulesets, makeImportant);
        });
    }
    
    // **
    
    var
        important = false,
        original = {},
        controller = {},
        replacement = $.each(
	        {
	            css:
                    function(property, value){
	                    var
	                        rulesHash = {},
	                        elem = $(this),
	                        rules = elem.attr('style');
	
	                    // Create object, if arg is a string
	                    if (typeof property === 'string'){
		                    rulesHash[property] = value;
	                    }
	                    else if (typeof property === 'object'){
	                        rulesHash = property;
	                    }
	                    else {
	                        return elem;
	                    }
	                    $.each(rulesHash, function(property, value){
	                        rules = cssDeclaration(property, value, rules);
	                    });
	                    return elem.attr('style', rules);
                    }
                    
                    // TODO: other methods to be supported
                    /*,
	            
	                width: function(){},
	                height: function(){},
	                show: function(){},
	                hide: function(){},
	                animate: function(){}
	                */
	        },
	        
	        function(method, fn){
	            original[method] = $.fn[method];
	            fn.overridden = true; // for detecting replacementn state
	        
	            controller[method] = function(){
	                var
	                    args = $.makeArray(arguments),
	                    lastArg = args[args.length-1],
	                    elem = $(this);
	                
	                // boolean true passed as the last argument
	                if (lastArg === true){
	                    return fn.apply(elem, args.slice(0,-1));
	                }
	                // $.important() === true && boolean false not passed
	                else if (important && lastArg !== false){
	                    return fn.apply(elem, args);
	                }
	                // apply original, native jQuery method
	                original[method].apply(elem, args);
	            };
	        }
	    );
	
	// Override the native jQuery methods with new methods
	$.extend($.fn, controller);
	    
	
	// jQuery(elem).important()
	$.fn.important = function(method){
        var
            elem = $(this),
            args = $.makeArray(arguments).concat(true),
            property, makeImportant;
        
        // .css() is the default method, e.g. $(elem).important({border:'1px solid red'});
        if (typeof method === 'undefined' || typeof method === 'boolean'){
            return elem.attr(
                'style',
                $.important(elem.attr('style'), method)
            );
        }
        else if (typeof method === 'object'){
            args.unshift('css');
            return elem.important.apply(this, args);
        }
        else if (typeof method === 'string'){
            if ($.isFunction(controller[method])){
                args = args.slice(1);
                controller[method].apply(elem, args);
            }
            // switch the !important statement on or off for a particular property in an element's inline styles - but instead of elem.css(property), they should directly look in the style attribute
            // e.g. $(elem).important('padding');
            // e.g. $(elem).important('padding', false);
            else if (typeof args[1] === 'undefined' || typeof args[1] === 'boolean'){
                property = method;
                makeImportant = (args[1] !== false);
                
                elem.attr('style', cssDeclaration(property, makeImportant, elem.attr('style')));
            }
        }
               
        return elem;
    };
    
    
    // jQuery.important
    
    // TODO:
    /*
    $.important('margin:0', 'padding:0; margin:auto;');
    
    */
    $.important = $.extend(
        function(){
            var
                args = $.makeArray(arguments),
                makeImportant;
            
            if (typeof args[0] === 'string'){
                if (typeof args[1] === 'undefined' || typeof args[1] === 'boolean'){
                    makeImportant = (args[1] !== false);
                    
                    return (/<\w+.*>/).test(args[0]) ?
                         htmlStylesToImportant(args[0], makeImportant) :
                         toImportant(args[0], makeImportant);
                }
            }
            
            else if (typeof args[0] === 'boolean'){
                important = args[0];
            }
            
            return important;
        },
        {
            // release native jQuery methods back to their original versions and return overriding methods
            noConflict: function(){
                $.each(original, function(method, fn){
                    $.fn[method] = fn;
                });
                return replacement;
            },
            
            declaration: cssDeclaration
        }
    );
}(jQuery));
