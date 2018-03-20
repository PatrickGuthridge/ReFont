var host = browser;
//Temp betaInput
//var betaExtFont = "<div class=\"manualRemoteFont\"><br><input id=\"restoreLibrary\" type=\"button\" value=\"Restore default font library.\"><br><h2>Manual Remote Font Install</h1><p>Other remote fonts can be manually installed below:</p><label>Stylesheet URL (This must use the HTTPS protocol):</label><input id=\"betaExtUrl\"><br><label>User Font Name (This will show in the library as the font name):</label><input id=\"betaExtName\"><br><label>System Font Name (Specified by font provider):</label><input id=\"betaExtFont\"><br><label>Backup Font(s)[separated by commas]:</label><input id=\"betaExtBak\"><br><button id=\"betaExtAdd\">Add External Font</button></div>";
function restore(){
    var element = document.createElement("div");
        var restore = document.createElement("button");
        restore.className = "betaRestore";
        restore.innerText = "Restore Defaults";
    element.appendChild(restore);
    element.appendChild(document.createElement("br"));
        var refresh = document.createElement("button");
        refresh.className = "betaRefresh";
        refresh.innerText = "Refresh Extension";
    element.appendChild(refresh);
    return element;
}

var betaRestore = restore();
var uiContainer;
var currPath;
var fonts;
var googleFontSort = "alpha";
var googleFontRefine;
var prLocation;
function showFonts(){
    var element = document.createElement("div");
    element.innerHTML = "<div class=\"localFont\"><input id=\"betaInput\" placeholder=\"Search\"><span class=\"tooltiptext\">Enter a font name or URL</span><!--<button id=\"betaInputAdd\">Add local font</button><button id=\"betaInputRemove\">Remove font</button>--></div>";
    document.querySelector("#googleFonts").appendChild(element);
    document.querySelector("#betaInput").addEventListener("mouseover", function(){
        document.querySelector(".tooltiptext").classList.add("active")
    });
    document.querySelector("#betaInput").addEventListener("mouseout", function(){
        document.querySelector(".tooltiptext").classList.remove("active")
    });
    document.querySelector("#betaInput").addEventListener("input", async function(e){
        if(document.querySelector("#betaInput").value.includes("/")){
            document.querySelector(".previewFont").innerText = "@font-face{font-family: preview;src: url(" + document.querySelector("#betaInput").value + ");}"
            document.querySelector("#betaInput").style.fontFamily = "preview, sans-serif";
            document.querySelector("#localFont").children[0].innerText = e.target.value + " (external)";
            if(e.target.value != ""){
                document.querySelector("#localFont").className = "";
                document.querySelector("#localFontCheck").checked = false;
            }
            else{
                document.querySelector("#localFont").className = "hidden";
            }
        }
        else{
            document.querySelector("#betaInput").style.fontFamily = e.target.value + ", sans-serif";
            try{
                document.querySelector("#localFont").children[0].innerText = e.target.value + " (local)";
                if(e.target.value != ""){
                    document.querySelector("#localFont").className = "";
                    document.querySelector("#localFontCheck").checked = false;
                }
                else{
                    document.querySelector("#localFont").className = "hidden";
                }
                for(font of googleFontRefine){
                    console.log(e.target.value.toLowerCase(),font.id.split("-")[1].toLowerCase());
                    if(font.id.split("-")[1].toLowerCase().includes(e.target.value.toLowerCase())){
                        font.className = "";
                    }
                    else{
                        font.className = "hidden";
                    }
                }
            }
            catch(e){
                console.log("Not connected to Google Fonts.");
                document.querySelector(".tooltiptext").innerText = "Unable to connect. Check your internet connection."
            }
        }
    });
    var xhttp = new XMLHttpRequest;
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            fonts = JSON.parse(this.responseText).items;
            var all = document.createElement("div");
            all.style.paddingTop = "55px";
                var element = document.createElement("p");
                element.id = "localFont"
                element.className = "hidden";
                var text = document.createElement("a");
                var checkbox = document.createElement("input");
                checkbox.id = "localFontCheck";
                checkbox.type = "checkbox";
                element.appendChild(text);
                element.appendChild(checkbox);
            all.appendChild(element);
            for(i = 0; i < fonts.length; i++){
                var num = i + 1;
                var element = document.createElement("p");
                element.id = "googleFont-" + fonts[i].family;
                    var text = document.createElement("a");
                    text.innerText = num + ". " + fonts[i].family + " (" + fonts[i].category + ")";
                element.appendChild(text);
                    var button = document.createElement("button");
                    button.id = "expand-" + i;
                    button.innerText = "+";
                    button.addEventListener("click", expandVariants);
                element.appendChild(button);
                var variants = document.createElement("div");
                for(x = 0; x < fonts[i].variants.length; x++){
                    var variant = document.createElement("div");
                    variant.className = "variant variant-" + i + " indent";
                    variant.innerText = fonts[i].variants[x];
                    var checkbox = document.createElement("input");
                    checkbox.id = "exlib-"+ i + "-" + x;
                    checkbox.type = "checkbox";
                    variant.appendChild(checkbox);
                    variants.appendChild(variant);
                }
                element.appendChild(variants);
                all.appendChild(element);
            }
            document.querySelector("#googleFonts").appendChild(all);
            googleFontRefine = document.querySelectorAll("[id^='googleFont-']");
        }
    };
    xhttp.open("GET", "https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyACvKvkismTWoHxP1MGLzzn32EN7A5fR_4&sort=" + googleFontSort, true);
    xhttp.send(); 
}
function expandVariants(e){
    e.target.innerText = "-";
    var from = e.target.id.split("-")[1];
    var variants = document.querySelectorAll(".variant-" + from);
    for(variant of variants){
        var q = variant.style.display;
        if(q == "block"){
            variant.style.display = "";
            e.target.innerText = "+";
        }
        else{
            variant.style.display = "block";
            e.target.innerText = "-";
        }
    }
}
function addFont(e){
    var fontObject = fonts[e.target.id.split("-")[1]];
    host.storage.local.get(["library"]).then(function(e){
        var list = e.library.fonts;
        var newItem = {
            name: fontObject.family,
            type: "external",
            use: ["'" + fontObject.family + "'", fontObject.category, "sans-serif"],
            fontLocation: fontObject.files.regular.replace("http://", "https://")
        }
        list.push(newItem);
        host.storage.local.set({
            library: {fonts: list}
        });
        window.location.reload();
    });
}
function setLocation(e){
    if(e){
        switch(e.target.innerText){
            case "General":
                window.location.hash = "#/general"
                break;
            case "Library":
                window.location.hash = "#/library"
                break;
            case "Lists":
                window.location.hash = "#/lists"
                break;
        }
        window.location.reload();
    }
    currPath = window.location.hash.split("/");
    currPath.splice(0,1)
    //temp
    if(currPath[0] == "library"){
        
        document.title = "Library";
        for(child of document.querySelector("#menu").children){
            if(child.innerText == "Library"){
                child.style.background = "white";
                child.style.borderRadius = "100%";
            }
        }
        var element = document.createElement("div");
/*
            var selectorFix = document.createElement("div");
            selectorFix.class = "selectorFix";
*/
        element.innerHTML += "<div class=\"selectorFix\"><h2 class=\"lheading\">Font Library <button id=\"restoreLibrary\">Restore Default Library.</button><button id=\"exportLibrary\">Export Library.</button><button id=\"importLibrary\">Import Library.</button></h2><form id=\"installedFonts\"></form><input id=\"add\" type=\"button\" value=\"<< Add Fonts to Library\"><input id=\"rem\" type=\"button\" value=\"Remove Fonts from Library >>\"><h2 class=\"gheading\">More Fonts</h2><form id=\"googleFonts\"></form></div>";
        uiContainer.appendChild(element);
        showFonts();
        host.storage.local.get(["library"]).then(function(e){
            var list = e.library.fonts;
            var all = document.createElement("div");
            for(i = 0; i < list.length; i++){
                t = Number(i);
                if( list[i].name != ""){
                    var element = document.createElement("p");
                        var checkbox = document.createElement("input");
                        checkbox.id = "lib-"+ i;
                        checkbox.type = "checkbox";
                    element.appendChild(checkbox);
                        var name = document.createElement("a");
                        name.innerText = t + ". " + list[i].name;
                    element.appendChild(name);
                    all.appendChild(element);
                }
            }
            document.querySelector("#installedFonts").appendChild(all);
            var element = document.createElement("div");
            //element.innerHTML = betaExtFont;
            uiContainer.appendChild(element);
            document.querySelector("#restoreLibrary").addEventListener("click",function(){
                var x = window.confirm("This will restore the default font library.");
                if(x == true){
                    host.runtime.sendMessage({
                        settings: "betaNewLibrary"
                    });
                    window.location.reload();
                }
            });
            document.querySelector("#exportLibrary").addEventListener("click",function(){
                browser.storage.local.get("library").then(function(e){
                    var a = document.createElement("a"),
                    url = URL.createObjectURL(new Blob([JSON.stringify(e.library.fonts)], {type: "application/json"}));
                    window.location.assign(url);
                });
            });
            document.querySelector("#importLibrary").addEventListener("click",function(){
                    var input = document.createElement("INPUT");
                    input.setAttribute("type", "file");
                    input.setAttribute("multiple", false);
                    input.setAttribute("accept","application/json");
                    input.click();
                    input.addEventListener("input", function(e){
                        var file = e.target.files[0];
                        console.log(file);
                        if(file.type == "application/json"){
                            var content = new FileReader();
                            content.onload = function(e){
                                browser.storage.local.get("lists").then(function(t){
                                    try{
                                        var library = JSON.parse(e.target.result);
                                        console.log(library);
                                    }
                                    catch(e){
                                        window.alert("Failed to import: " + e.message);
                                        return;                                    
                                    }
                                    try{
                                        if(library[0].type != "disabled"){
                                            if(library[0].type == "global"){
                                                console.log("list");
                                                window.alert("Failed to import: Lists can't be imported as libraries.");
                                            }
                                            else{
                                                window.alert("Failed to import: Invalid fontlist.");
                                            }
                                            return;
                                        }
                                        for(font of library){
                                            if(!font.name == undefined || !font.type || !font.use){
                                                console.log(font.name,font.type,font.use);
                                                window.alert("Failed to import: Invalid library.");
                                                return;
                                            }
                                            if(font.type == "external" && !font.fontLocation){
                                                console.log("er")
                                                window.alert("Failed to import: Invalid library.");
                                                return;
                                            }
                                        }
                                    }
                                    catch(e){
                                        window.alert("Failed to import: Not a ReFont JSON file. " + e.message);
                                        return;
                                    }
                                    library.sort(function(a, b) {
                                        return a.name.localeCompare(b.name);
                                     });
                                     var fontlist = t.lists.fontlist;
                                     var conflicts = 0;
                                     for(item of fontlist){
                                         console.log(item)
                                         var count = 0;
                                         for(font of library){
                                             if(item.font == font.name || item.font == "_inheritGlobalFont"){
                                                 count++;
                                             }
                                         }
                                         if(count == 0){
                                             item.font = "";
                                             conflicts++;
                                             console.log("%c [Settings] Conflicting lists caused an item to be reset.",'background: grey; color: black');
                                         }
                                     }
                                     if(conflicts == 1){
                                         window.alert("1 conflict with the list had to be resolved in order to import the library.");
                                     }
                                     if(conflicts > 1){
                                         window.alert(conflicts + " conflicts with the list had to be resolved in order to import the library.");
                                     }
                                    browser.storage.local.set({
                                        library: {
                                            fonts: library
                                        },
                                        lists: {
                                            fontlist: fontlist
                                        }
                                    });
                                    window.location.reload();
                                });
                            }
                            content.readAsText(file);
                        }
                        else{
                            window.alert("Failed to import: Input was not a JSON file.");
                            return;
                        }
                    });
            });
            document.querySelector("#add").addEventListener("click",function(){
                document.querySelector("#add").style.cursor = "progress";
                document.body.style.cursor = "progress";
                var i = 0;
                var animation = setInterval(function(){
                    i = i + 22 - (i / 5.5);
                    var gradient = "linear-gradient(to left, rgba(0, 0, 0, 0.25) " + (i - 50) + "%, rgba(0, 0, 0, 0.5) " + (i - 5) + "%, rgba(0, 0, 0, 0.25) " + i + "%)";
                    if(i > 90){
                        document.querySelector("#add").style.cursor = "wait";
                    }
                    document.querySelector("#add").style.background = gradient;
                }, (100 / 6));
                setTimeout(function(){
                host.storage.local.get(["library","lists"]).then(function(e){
                    var list = e.library.fonts;
                    var Whitelist = e.lists.whitelist;
                    var check = e.lists.fontlist;
                    var librarySelected = [];
                    var arraySubtract = 0;
                    try{
                    document.querySelector("#add").innerText = "Loading...";
                    for(x = 0; x < fonts.length; x++){
                        var percent = x / fonts.length * 100;
                        document.querySelector("#add").style.background = "linear-gradient(to left, white " + percent + "%, grey " + percent + "%)";
                        var boxes = document.querySelectorAll("[id^='exlib-" + x + "-']");
                        for(box of boxes){
                            if(box.checked == true){
                                librarySelected.push(box);
                                arraySubtract++;
                            }
                        }
                    }
                    for(font of librarySelected){
                        var fontNumber = font.id.split("-")[1];
                        var variantNumber = font.id.split("-")[2];
                        var fontName = fonts[fontNumber].family;
                        var variantName = fonts[fontNumber].variants[variantNumber];
                        var newItem = {
                            name: fontName + " " + variantName,
                            type: "external",
                            use: ["'" + fontName + variantName + "'", fonts[fontNumber].category],
                            fontLocation: fonts[fontNumber].files[variantName].replace("http://","https://")
                        }
                        list.push(newItem);
                    }
                    if(document.querySelector("#betaInput").value != "" && !document.querySelector("#betaInput").value.includes(",") && document.querySelector("#localFontCheck").checked == true){
                        if(document.querySelector("#betaInput").value.includes("/")){
                            var fontName = document.querySelector("#betaInput").value.split("/");
                            fontName = fontName[fontName.length - 1];
                            var name = window.prompt("Enter the name of the font at - " + document.querySelector("#betaInput").value, fontName);
                            if (name != null && name != "") {
                                var newItem = {
                                    name: name,
                                    type: "external",
                                    use: ["'" + name.replace(" ","").replace(".","") + "'", "sans-serif"],
                                    fontLocation: document.querySelector("#betaInput").value.replace("http://","https://")
                                }
                                list.push(newItem);
                            }
                        }
                        else{
                            var newItem = {
                            name: document.querySelector("#betaInput").value,
                            type: "local",
                            use: [document.querySelector("#betaInput").value, "sans-serif"]
                            }
                            list.push(newItem);
                        }
                    }
                    else if(document.querySelector("#betaInput").value.includes(",")){
                        window.alert("Invalid Font Name, cannot contain ' , ' symbol.");
                    }
                    }
                    catch(e){
                        console.log("Not connected to Google Fonts.");
                        if(document.querySelector("#betaInput").value != "" && !document.querySelector("#betaInput").value.includes(",")){
                            if(document.querySelector("#betaInput").value.includes("/")){
                                var fontName = document.querySelector("#betaInput").value.split("/");
                                fontName = fontName[fontName.length - 1];
                                var name = window.prompt("Enter the name of the font at - " + document.querySelector("#betaInput").value, fontName);
                                if (name != null && name != "") {
                                    var newItem = {
                                        name: name,
                                        type: "external",
                                        use: ["'" + name.replace(" ","").replace(".","") + "'", "sans-serif"],
                                        fontLocation: document.querySelector("#betaInput").value.replace("http://","https://")
                                    }
                                    list.push(newItem);
                                }
                            }
                            else{
                                var newItem = {
                                name: document.querySelector("#betaInput").value,
                                type: "local",
                                use: [document.querySelector("#betaInput").value, "sans-serif"]
                                }
                                list.push(newItem);
                            }
                        }
                        else if(document.querySelector("#betaInput").value.includes(",")){
                            window.alert("Invalid Font Name, cannot contain ' , ' symbol.");
                        }
                    }
                    list.sort(function(a, b) {
                        return a.name.localeCompare(b.name);
                     });
                    host.storage.local.set({
                        library: {fonts: list},
                        lists: {fontlist: check, whitelist: Whitelist}
                    });
                    window.location.reload();
                });
                /*host.storage.local.get(["library"]).then(function(e){
                    var list = e.library.fonts;
                    if(document.querySelector("#betaInput").value == ""){
                        window.location.reload();
                        return;
                    }
                    if(document.querySelector("#betaInput").value.includes(",")){
                        window.alert("Invalid Font Name, cannot contain ' , ' symbol.");
                        window.location.reload();
                        return;
                    }
                    var newItem = {
                        name: document.querySelector("#betaInput").value,
                        type: "local",
                        use: [document.querySelector("#betaInput").value]
                    }
                    list.push(newItem);
                    console.log(list)
                    host.storage.local.set({
                        library: {fonts: list}
                    });
                    window.location.reload();
                });*/
            }, 250);
            });
            document.querySelector("#rem").addEventListener("click",function(){
                document.querySelector("#rem").style.cursor = "progress";
                document.body.style.cursor = "progress";
                var i = 0;
                var animation = setInterval(function(){
                    i = i + 20 - (i / 7);
                    var gradient = "linear-gradient(to right, rgba(0, 0, 0, 0.25) " + (i - 50) + "%, rgba(0, 0, 0, 0.5) " + (i - 5) + "%, rgba(0, 0, 0, 0.25) " + i + "%)";
                    console.log(gradient)
                    document.querySelector("#rem").style.background = gradient;
                }, (100 / 6));
                setTimeout(function(){
                host.storage.local.get(["library","lists"]).then(function(e){
                    var list = e.library.fonts;
                    var Whitelist = e.lists.whitelist;
                    var check = e.lists.fontlist;
                    var librarySelected = [];
                    var arraySubtract = 0;
                    for(x = 1; x < list.length; x++){
                        var elementName = "#lib-" + x;
                        if(document.querySelector(elementName).checked == true){
                            librarySelected.push(x);
                            arraySubtract++;
                        }
                    }
                    for(i in librarySelected){
                        var fontFocus = list[librarySelected[i]].name;
                        for(i = 0; i < list.length; i++){
                            if(list[i].name == fontFocus){
                                list.splice(i,1);
                                for(i = 0; i < librarySelected.length; i++){
                                    librarySelected[i]--;
                                }
                            }
                        }
                        for(i = 0; i < check.length; i++){
                            if(check[i].font == fontFocus){
                                if(i != 0){
                                    check.splice(i,1);
                                }
                                else{
                                    check[i].font = ""
                                }
                            }
                        }
                    }
                    host.storage.local.set({
                        library: {fonts: list},
                        lists: {fontlist: check, whitelist: Whitelist}
                    });
                    window.location.reload();
                });
            }, 190);
            });
            /*document.querySelector("#betaExtAdd").addEventListener("click",function(){
                host.storage.local.get(["library"]).then(function(e){
                    var list = e.library.fonts;
                    if(document.querySelector("#betaExtUrl").value == ""){
                        return;
                    }
                    console.log("w");
                    var newItem = {
                        name: document.querySelector("#betaExtName").value,
                        type: "external",
                        use: [document.querySelector("#betaExtFont").value, document.querySelector("#betaExtBak").value],
                        location: document.querySelector("#betaExtUrl").value
                    }
                    list.push(newItem);
                    console.log(list)
                    host.storage.local.set({
                        library: {fonts: list}
                    });
                    window.location.reload();
                });
            });*/
        });
    }
    else if(currPath[0] == "lists"){
        document.title = "Lists";
        for(child of document.querySelector("#menu").children){
            if(child.innerText == "Lists"){
                child.style.background = "white";
                child.style.borderRadius = "100%";
            }
        }
        var element = document.createElement("div");
        element.innerHTML = "<h2>Lists management: <button id=\"restoreLists\">Restore default lists</button><button id=\"exportLists\">Export Lists</button><button id=\"importLists\">Import Lists</button></h2><br><p>Lists control what fonts are applied by ReFont to specific sites and pages.</p><p>In future updates, you will be able to edit the list on this page.</p><p>It can also be manually edited using JSON after exporting.</p>";
        uiContainer.appendChild(element);
        document.querySelector("#exportLists").addEventListener("click",function(){
            browser.storage.local.get("lists").then(function(e){
                var a = document.createElement("a"),
                url = URL.createObjectURL(new Blob([JSON.stringify(e.lists.fontlist)], {type: "application/json"}));
                window.location.assign(url);
            });
        });
        document.querySelector("#importLists").addEventListener("click",function(){
            browser.storage.local.get("library").then(function(e){
                var input = document.createElement("INPUT");
                input.setAttribute("type", "file");
                input.setAttribute("multiple", false);
                input.setAttribute("accept","application/json");
                input.click();
                input.addEventListener("input", function(e){
                    var file = e.target.files[0];
                    console.log(file);
                    if(file.type == "application/json"){
                        var content = new FileReader();
                        content.onload = function(e){
                            browser.storage.local.get("library").then(function(t){
                                try{
                                    var fontlist = JSON.parse(e.target.result);
                                    console.log(fontlist);
                                }
                                catch(e){
                                    window.alert("Failed to import: " + e.message);
                                    return;                                    
                                }
                                try{
                                    if(fontlist[0].type != "global"){
                                        console.log("er")
                                        if(fontlist[0].type == "disabled"){
                                            console.log("library");
                                            window.alert("Failed to import: Libraries can't be imported as lists.");
                                        }
                                        else{
                                            window.alert("Failed to import: Invalid fontlist.");
                                        }
                                        return;
                                    }
                                    for(item of fontlist){
                                        if(!item.type || !item.font){
                                            console.log(item.type,item.font);
                                            window.alert("Failed to import: Invalid fontlist.");
                                            return;
                                        }
                                    }
                                }
                                catch(e){
                                    console.exception(e)
                                    window.alert("Failed to import: Not a ReFont JSON file. " + e.message);
                                    return;
                                }
                                var library = t.library.fonts;
                                var conflicts = 0;
                                for(item of fontlist){
                                    console.log(item)
                                    var count = 0;
                                    for(font of library){
                                        if(item.font == font.name || item.font == "_inheritGlobalFont"){
                                            count++;
                                        }
                                    }
                                    if(count == 0){
                                        item.font = "";
                                        conflicts++;
                                        console.log("%c [Settings] Conflicting lists caused an item to be reset.",'background: grey; color: black');
                                    }
                                }
                                
                                if(conflicts == 1){
                                    window.alert("1 conflict with the library had to be resolved in order to import the list.");
                                }
                                if(conflicts > 1){
                                    window.alert(conflicts + " conflicts with the library had to be resolved in order to import the list.");
                                }
                                browser.storage.local.set({
                                    lists: {
                                        fontlist: fontlist
                                    }
                                });
                                window.location.reload();
                            });
                        }
                        content.readAsText(file);
                    }
                    else{
                        window.alert("Failed to import: Input was not a JSON file.");
                        return;
                    }
                });
            });
        });
        document.querySelector("#restoreLists").addEventListener("click",function(){
            var x = window.confirm("This will restore the default list.");
            if(x == true){
                host.runtime.sendMessage({
                    settings: "betaNewFontlist"
                });
                window.location.reload();
            }
        });
    }
    else if(currPath[0] == "viewChangelog"){
        var animation = new Image();
        animation.src = "loading.gif";
        document.body.appendChild(animation);
        setTimeout(function(){
            window.location.replace("changelog.refont#v" + browser.runtime.getManifest().version.replace(".","-"));
        }, 275);
    }
    else{
        document.title = "General";
        for(child of document.querySelector("#menu").children){
            if(child.innerText == "General"){
                child.style.background = "white";
                child.style.borderRadius = "100%";
            }
        }
        
        var element = document.createElement("h2");
        element.innerText = "Extension Management:";
        uiContainer.appendChild(element);

        var element = document.createElement("div");
        element.appendChild(document.createElement("br"));
        element.appendChild(betaRestore);
        uiContainer.appendChild(element)
        document.querySelector(".betaRestore").addEventListener("click",function(){
             var x = window.confirm("Restore extensiondefaults:\nThis will restore all default settings, clear the whitelist and remove all downloaded fonts.\nThis can solve problems you may be experiencing with the exension.\nThe extension will be completely reloaded.\nAre you sure you want to continue?");
             if(x == true){
                host.runtime.sendMessage({
                    settings: "betaRestore"
                });
             }
        });
        document.querySelector(".betaRefresh").addEventListener("click",function(){
            var x = window.confirm("Refresh Extension?");
            if(x == true){
               host.runtime.sendMessage({
                   settings: "betaRefresh"
               });
            }
        });
        var element = document.createElement("div");
        element.innerHTML = "<br><button id=\"backupExt\">Backup Extension</button><br><button id=\"restoreExt\">Restore Extension</button><br><br><button id=\"viewChangelog\">View Changelog</button>";
        uiContainer.appendChild(element);
        document.querySelector("#backupExt").addEventListener("click",function(){
            browser.storage.local.get(["library","lists","systemSettings","browserAction"]).then(function(e){
                var a = document.createElement("a");
                var extension = {
                    library: e.library,
                    lists: e.lists,
                    systemSettings: e.systemSettings,
                    browserAction: e.browserAction
                };
                url = URL.createObjectURL(new Blob([JSON.stringify(extension)], {type: "application/json"}));
                window.location.assign(url);
            });
        });
    document.querySelector("#restoreExt").addEventListener("click",function(){
        browser.storage.local.get(["library","lists","systemSettings","browserAction"]).then(function(e){
            var input = document.createElement("INPUT");
            input.setAttribute("type", "file");
            input.setAttribute("multiple", false);
            input.setAttribute("accept","application/json");
            input.click();
            input.addEventListener("input", function(e){
                var file = e.target.files[0];
                console.log(file);
                if(file.type == "application/json"){
                    var content = new FileReader();
                    content.onload = function(e){
                        try{
                            var backup = JSON.parse(e.target.result);
                            console.log(backup);
                            var library = backup.library;
                            var lists = backup.lists;
                            var systemSettings = backup.systemSettings;
                            var browserAction = backup.browserAction;
                        }
                        catch(e){
                            window.alert("Failed to import: " + e.message);
                            return;                                    
                        }
                        browser.storage.local.set({
                            library: library,
                            lists: lists,
                            systemSettings: systemSettings,
                            browserAction: browserAction
                        });
                        window.location.reload();
                    }
                    content.readAsText(file);
                }
                else{
                    window.alert("Failed to import: Input was not a JSON file.");
                    return;
                }
            });
        });
    });
    document.querySelector("#viewChangelog").addEventListener("click", function(){
        window.location.assign("mgmt.refont#/viewChangelog");
        window.location.reload();
    });
    }
    resize();
}
function resize(){
    try{
    //feedback
        
        if(window.innerWidth < 325){
            document.querySelector(".feedback").style.display = "none";
        }
        else if(window.innerWidth < 800){
            document.querySelector(".feedback").style.display = "";
            document.querySelector(".feedback").innerHTML = "<a href=\"https://addons.mozilla.org/en-US/firefox/addon/refont/reviews/\">Send feedback.</a>";
        }
        else{
            document.querySelector(".feedback").style.display = "";
            document.querySelector(".feedback").innerHTML = "Enjoying ReFont? Have a suggestion? Found a bug? <a href=\"https://addons.mozilla.org/en-US/firefox/addon/refont/reviews/\">Send feedback.</a>";
        }
    //add / remove lib
        if(window.innerWidth <= 640){
            document.querySelector("#add").value = "+";
            document.querySelector("#rem").value = "-";
            document.querySelector("#add").style.width = "auto";
            document.querySelector("#rem").style.width = "auto";
        }
        else if(window.innerWidth <= 1024){
            document.querySelector("#add").value = "Add fonts";
            document.querySelector("#rem").value = "Remove fonts";
            document.querySelector("#add").style.width = "auto";
            document.querySelector("#rem").style.width = "auto";
        }
        else{
            document.querySelector("#add").value = "<< Add Fonts to Library";
            document.querySelector("#rem").value = "Remove Fonts from Library >>";
            document.querySelector("#add").style.width = "";
            document.querySelector("#rem").style.width = "";
        }
    //lib buttons
        if(window.innerWidth <= 425){
            var squishQueue = document.querySelector(".lheading");
            if(squishQueue.children[0].tagName != "BR"){
                squishQueue.insertBefore(document.createElement("br"), squishQueue.children[0]);
            }
            if(squishQueue.children[2].tagName != "BR"){
                squishQueue.insertBefore(document.createElement("br"), squishQueue.children[2]);
            }
            if(squishQueue.children[4].tagName != "BR"){
                squishQueue.insertBefore(document.createElement("br"), squishQueue.children[4]);
            }
            document.querySelector("#googleFonts").style.top = "170px";
            document.querySelector("#installedFonts").style.top = "170px";
        }
        else if(window.innerWidth <= 725){
            var squishQueue = document.querySelector(".lheading");
            if(squishQueue.children[0].tagName != "BR"){
                squishQueue.insertBefore(document.createElement("br"), squishQueue.children[0]);
            }
            if(squishQueue.children[2].tagName == "BR"){
                squishQueue.removeChild(squishQueue.children[2]);
            }
            if(squishQueue.children[3].tagName == "BR"){
                squishQueue.removeChild(squishQueue.children[3]);
            }
            document.querySelector("#googleFonts").style.top = "110px";
            document.querySelector("#installedFonts").style.top = "110px";
        }
        else{
            var squishQueue = document.querySelector(".lheading");
            if(squishQueue.children[0].tagName == "BR"){
                squishQueue.removeChild(squishQueue.children[0]);
            }
            try{
                if(squishQueue.children[2].tagName == "BR"){
                    squishQueue.removeChild(squishQueue.children[2]);
                }
                if(squishQueue.children[3].tagName == "BR"){
                    squishQueue.removeChild(squishQueue.children[3]);
                }
            }
            catch(e){
            }
            document.querySelector("#googleFonts").style.top = "75px";
            document.querySelector("#installedFonts").style.top = "75px";
        }
    //edges
        if(window.innerWidth <= 725){
            document.querySelector("#googleFonts").style.right = "0px";
            document.querySelector("#installedFonts").style.left = "0px";
            document.querySelector(".gheading").style.right = "0px";
            document.querySelector(".lheading").style.left = "0px";
            document.querySelector("#googleFonts").classList.add("small");
            document.querySelector("#installedFonts").classList.add("small");
            document.querySelector(".tooltiptext").style.fontSize = "8px";
        }
        else{
            document.querySelector("#googleFonts").style.right = "";
            document.querySelector("#installedFonts").style.left = "";
            document.querySelector(".gheading").style.right = "";
            document.querySelector(".lheading").style.left = "";
            document.querySelector("#googleFonts").classList.remove("small");
            document.querySelector("#installedFonts").classList.remove("small");
            document.querySelector(".tooltiptext").style.fontSize = "";
        }
    }
    catch(e){
        return;
    }
}
function prepareDocument(e){
    document.body.innerHTML = "";
    var prepare = document.createElement("div");
    prepare.id = "managementUI";
        var menu = document.createElement("div");
        menu.id = "menu";
            var general = document.createElement("button");
            general.innerText = "General";
            general.addEventListener("click", setLocation);
            var library = document.createElement("button");
            library.innerText = "Library";
            library.addEventListener("click", setLocation);
            var lists = document.createElement("button");
            lists.innerText = "Lists";
            lists.addEventListener("click", setLocation);
        menu.appendChild(general);
        menu.appendChild(library);
        menu.appendChild(lists);
        prepare.appendChild(menu);
    document.body.appendChild(prepare);
    uiContainer = document.querySelector("#managementUI");
    var element = document.createElement("p");
    element.className = "feedback";
    element.innerHTML = "Enjoying ReFont? Have a suggestion? Found a bug? <a href=\"https://addons.mozilla.org/en-US/firefox/addon/refont/reviews/\">Send feedback!</a>";
    uiContainer.appendChild(element);
    setLocation();
    window.addEventListener("resize", resize);
}
window.addEventListener("load", prepareDocument);