var host = browser;
var system = {
    enabled: true
}
function restoreLast(is){
    host.storage.local.set({
        systemSettings: is.systemSettings,
        lists: is.lists
    });
}





function error(error) {
    console.exception(`[System] ${error}`);
}

var whitelist = []
var fontlist = []
var library;
function globalFont(){
    for(i in library.fonts){
        if(library.fonts[i].name == fontlist[0].font){
            return [library.fonts[i].use, library.fonts[i].name];
        }
    }
}
var match = {
    whitelist: function(e,preprocessor){
        var url = e.split(":").splice(1)[0].split("?")[0];
        var value = {
            url: {
                enabled: null,
                position: null,
            },
            site: {
                enabled: null,
                position: null,
            },
        }
        for(i in whitelist){
            if(whitelist[i].type == "url" && whitelist[i].resource == url){
                if(whitelist[i].blacklist == true){
                    value.url.enabled = true;
                }
                else{
                    value.url.enabled = false; 
                }
                value.url.position = i;
                break;
            }
            else{
                continue;
            }
        }
        for(i in whitelist){
            if(whitelist[i].type == "site" && RegExp(whitelist[i].resource).test(url) == true){
                value.site.enabled = false;
                value.site.position = i;
                break;
            }
            else{
                continue;
            }
        }
    if(preprocessor == true){
        if(value.url.enabled == true){
            return true;
        }
        else if(value.url.enabled == false){
            return value.site.position;
        }
        else{
            if(value.site.enabled == false){
                return value.site.position;
            }
            else{
                return true;
            }
        }
    }
    else{
        return value;
    }
    },
    font: function(e,preprocessor){
        var url = e.split(":").splice(1)[0].split("?")[0];
        var value = {
            global: {
                ref: globalFont()[0],
                font: globalFont()[1],
                position: fontlist[0]
            },
            url: {
                font: null,
                ref: null,
                position: null,
            },
            site: {
                font: null,
                ref: null,
                position: null,
            },
        }
        for(i = 0; i < fontlist.length; i++){
            console.log(fontlist[i])
            if(fontlist[i].type == "url" && fontlist[i].resource == url){
                for(f in library.fonts){
                    if(fontlist[i].font == library.fonts[f].name){
                        value.url.ref = library.fonts[f].use;
                        value.url.font = library.fonts[f].name;
                    }
                }
                value.url.position = i;
            }
            if(fontlist[i].type == "url" && fontlist[i].font == "_inheritGlobalFont"){
                value.url.ref = globalFont()[0];
                value.url.font = "_inheritGlobalFont";
            }
            if(fontlist[i].type == "site" && RegExp(fontlist[i].resource).test(url) == true){
                for(f in library.fonts){
                    if(fontlist[i].font == library.fonts[f].name){
                        value.site.ref = library.fonts[f].use;
                        value.site.font = library.fonts[f].name;
                    }
                }
                value.site.position = i;
            }
        }
        if(preprocessor == true){
            var returnValue;
            if(value.url.font != null){
                returnValue = value.url.ref;
            }
            else if(value.site.font != null){
                returnValue = value.site.ref;
            }
            else{
                returnValue = value.global.ref;
            }
            return returnValue;
        }
        else{
            return value;
        }
    },
}
function assignLists(e){
    console.log("%c [Settings] Lists were updated", "background: grey; color: black;")
    whitelist = e.lists.whitelist;
    fontlist = e.lists.fontlist;
    library = e.library;
    console.log("[System] Status:\n\tWhitelist[",whitelist,"];\n\tFontlist[",fontlist,"];\n\tLibrary[",library,"];");
}
function getLists(){
    var gettingItem = host.storage.local.get([
        "lists", "library"
    ]);
    gettingItem.then(assignLists, error);
    return;
}
//src olde
/*var match = {
    whitelist: function(e){
        var url = e.split(":").splice(1)[0].split("?")[0];
        for(i in whitelist){
            if(whitelist[i].type == "url" && whitelist[i].resource == url){
                if(whitelist[i].blacklist == true){
                    break;
                }
                return i;
            }
            else if(whitelist[i].type == "site" && whitelist[i].resource.test(url) == true){
                return i;
            }
            else{
                continue;
            }
        }
        return true;
    },
    font: function(e){
        var url = e.split(":").splice(1)[0].split("?")[0];
        for(var i in fontlist){
            if(fontlist[i].type == "url" && fontlist[i].resource == url){
                return [fontlist[i].font,i];
            }
            else if(fontlist[i].type == "site" && fontlist[i].resource.test(url) == true){
                return [fontlist[i].font,i];
            }
            else{
                continue;
            }
        }
        return [fontlist[0].font,true]
    }
}*/





function restoreDefaults(){
host.storage.local.set({
    systemSettings: {
      enabled: true,
    },
    lists: {
        whitelist: [
            {
                type: "default",
                resource: ""
            },
            {
                type: "site",
                resource: "fonts.google.com"
            }
        ],
        fontlist: [
            {
                type: "global",
                font: "Sans Serif"
            },
        ]
    },
    library: {
        fonts: [
            {
                name: "",
                type: "disabled",
                use: [""]
            },
            {
                name: "Monospace",
                type: "preinstalled",
                use: ["Monospace"]
            },
            {
                name: "Sans Serif",
                type: "preinstalled",
                use: ["sans-serif"]
            },
            {
                name: "Serif",
                type: "preinstalled",
                use: ["Serif"]
            }
        ]
    }
});
console.log("[System] Created new settings lists.");
host.runtime.reload();
}
function frontEndHandler(request, sender, sendResponse) {
    if(request.reFont){
        console.log(sender)
        console.log("[System] Preparing Data for: '" + sender.url + "'");
        var whitelistQ = match.whitelist(sender.url,true)
        var sendFont = match.font(sender.url,true);
        var externalFont = null;
        for(i = 0; i < library.fonts.length; i++){
            if(library.fonts[i].use === sendFont && library.fonts[i].location){
                console.log("[System] Matched External Font for'" + sendFont + "' to '" + library.fonts[i].location + "'");
                externalFont = "@import url('" + library.fonts[i].location + "');";
                host.tabs.insertCSS(sender.tab.id,{code: externalFont});
            }
        }
        if(whitelistQ === true && system.enabled == true){
            console.log("[System] Exec\t",sendFont)
            sendResponse({
                font: sendFont,
                fontLocation: externalFont
            });
        }
        else if(system.enabled == true){
            console.log("[System] Whitelisted Page: '" + sender.url + "' was not refonted.")
            sendResponse("whitelisted");
        }
        else{
            console.log("[System] Refont Disabled: '" + sender.url + "' was not refonted.")
            sendResponse("disabled");
        }
    }
    if(request.checkList){
        console.warn("[Front End] Browser action was opened.")
        var x = host.tabs.query({
            currentWindow: true,
            active: true
        })
        x.then(function(tabs){
            console.log("[System] Preparing Data for Browser Action.")
            var w = match.whitelist(tabs[0].url,false);
            var f = match.font(tabs[0].url);
            host.runtime.sendMessage({font: f, whitelist: w, curr: tabs[0].url})
        });
        sendResponse(null);
    }
    if(request.message){
        if(request.messageType == "reFonted"){
            console.log("[System] reFonted: '" + sender.url + "' to","'" + request.message + "'");
        }
        else if(request.messageType == "err"){
            console.exception("[Front End]" + request.message)
        }
        else{
            console.log(request.message);
        }
    }
    if(request.open){
        var url;
        switch(request.open){
            case "mgmt":
                url = "#/options";
                break;
            case "whitelist":
                url = "#/whitelistManagement";
            case "font":
                url = "#/fontManagement";
            case "getFonts":
                url = "#/fontManagement/getFonts"
        }
        var creating = host.tabs.create({
            url:"mgmt.refont" + url
        });
    }
    if(request.settings == "betaRestore"){
        //beta UI 
        restoreDefaults();
    }
    if(request.settings == "betaRefresh"){
        //beta UI 
        host.runtime.reload();
    }
    else{
        return;
    }
}
function frontEnd(tabs){
        console.log("%c [Settings] System was updated.", "background: grey; color: black;")
        for (let tab of tabs) {
            host.tabs.sendMessage(tab.id,"msg");
        }
        switch(system.enabled){
            case true:
                console.warn("%c [System] Enabled ", "color: green; background: black;")
                break;
            case false:
                console.warn("%c [System] Disabled ", "color: red; background: black;")
                break;
        }
        
}
function sysInfo(){
    getLists();
    var getting = host.storage.local.get(
        "systemSettings"
    );
    getting.then(function(e){
        system = e.systemSettings;
        host.tabs.query({}).then(frontEnd,error);
    }, error);
    return;
}
var dataExistanceQuery = host.storage.local.get([
    "lists", "systemSettings"
]);
dataExistanceQuery.then(function(value){
    host.storage.onChanged.addListener(sysInfo);
    host.runtime.onMessage.addListener(frontEndHandler);
    if(value.lists == undefined){
        restoreDefaults();
    }
    else{
        restoreLast(value);
        console.log("[System] Restored settings from previous session.");
    }
}, function(error){console.exception(`${error}`)});
