'use strict';

/*!
* apngtest
*   github.com/premasagar/mishmash/tree/master/apngtest/
*
*   Original: Elijah Grey's http://eligrey.com/blog/post/apng-feature-detection/
*   Modified by Premasagar Rose, http://dharmafly.com
*
*//*
    detects browser support for Animated PNG images (APNG)

    notes
        requires a callback that will be passed either true, false or null (the value will be null if the browser doesn't support the requirements for the test - i.e. dataURIs and Canvas)
        
        APNG is supported in Firefox 3 and Opera 9.5 (as of 2010-06-12)

*/

function apngtest(callback){
    var document = this.document,
    canvas = document.createElement('canvas'),
    apngSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACGFjVEwAAAABAAAAAcMq2TYAAAANSURBVAiZY2BgYPgPAAEEAQB9ssjfAAAAGmZjVEwAAAAAAAAAAQAAAAEAAAAAAAAAAAD6A+gBAbNU+2sAAAARZmRBVAAAAAEImWNgYGBgAAAABQAB6MzFdgAAAABJRU5ErkJggg==',
    canvasContext, img;
    
    if (canvas.getContext){
        canvasContext = canvas.getContext('2d');
        img = document.createElement('img');
        img.src = apngSrc;
        img.onload = img.onerror = function(){
            if (img.width === 1 && img.height === 1){
                canvasContext.drawImage(img, 0, 0);
                callback(canvasContext.getImageData(0, 0, 1, 1).data[3] === 0); // true if APNG is supported
            }
            else { // browser doesn't support dataURIs
                callback(null);
            }
        };
    }
    else { // browser doesn't support canvas
        callback(null);
    }
}
