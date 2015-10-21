/* Module for manipulating front end. */

function loadfile(filename, filetype){
    if (filetype=="js"){ //filename is a external JavaScript file
        var fileref=document.createElement('script')
        fileref.setAttribute("type","text/javascript")
        fileref.setAttribute("src", filename)
    }
    else if (filetype=="css"){ //filename is an external CSS file
        var fileref=document.createElement("link")
        fileref.setAttribute("rel", "stylesheet")
        fileref.setAttribute("type", "text/css")
        fileref.setAttribute("href", filename)
    }
    if (typeof fileref!="undefined")
        document.getElementsByTagName("head")[0].appendChild(fileref)
}

/* Tell nathan we don't need to do this because of "meteor add twbs:bootstrap" */

// loadfile("https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css", "css");
// loadfile("https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js", "js");
// loadfile("https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js", "js");