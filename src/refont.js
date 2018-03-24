var host = browser;
var browserActionLastMessage;
var system = {
    enabled: true
}
function restoreLast(is){
    host.storage.local.set({
        systemSettings: is.systemSettings,
        lists: is.lists
    });
}
function hostURL(e){
    return browser.runtime.getURL(e);
}
function error(error) {
    //debug
}

var fontlist = [];
var library;
function globalFont(){
    for(i in library.fonts){
        if(library.fonts[i].name == fontlist[0].font){
            return [library.fonts[i].use, library.fonts[i].name,library.fonts[i].weight];
        }
    }
}
var match = function(e,preprocessor){
        var url = e.split(":").splice(1)[0].split("?")[0];
        var global = globalFont();
        var value = {
            global: {
                ref: global[0],
                font: global[1],
                weight: global[3],
                position: 0
            },
            url: {
                font: null,
                ref: null,
                weight: "",
                position: null,
            },
            site: {
                font: null,
                ref: null,
                weight: "",
                position: null,
            },
        }
        for(i in fontlist){
            var font = fontlist[i];
            if(font.type == "url" && font.resource == url){
                for(f in library.fonts){
                    if(font.font == library.fonts[f].name){
                        value.url.ref = library.fonts[f].use;
                        value.url.font = library.fonts[f].name;
                        value.url.weight = library.fonts[f].weight;
                    }
                }
                value.url.position = i;
            }
            if(font.type == "url" && font.font == "_inheritGlobalFont"){
                value.url.ref = global[0];
                value.url.font = "_inheritGlobalFont";
                value.url.weight = global[3];
                value.url.position = i;
            }
            else if(font.type == "site" && RegExp(font.resource).test(url) == true){
                for(f in library.fonts){
                    if(font.font == library.fonts[f].name){
                        value.site.ref = library.fonts[f].use;
                        value.site.font = library.fonts[f].name;
                        value.site.weight = library.fonts[f].weight;
                    }
                }
                value.site.position = i;
            }
        }
        if(preprocessor == true){
            var returnValue;
            if(value.url.font != null){
                returnValue = [value.url.ref,value.url.weight];
            }
            else if(value.site.font != null){
                returnValue = [value.site.ref,value.site.weight];
            }
            else{
                returnValue = [value.global.ref,value.global.weight];
            }
            console.log(returnValue)
            return {
                f: returnValue[0],
                w: returnValue[1]
            }
            ;
        }
        else{
            return value;
        }
}
function assignLists(e){
    console.log("%c [Settings] Lists were updated", "background: grey; color: black;");
    whitelist = e.lists.whitelist;
    fontlist = e.lists.fontlist;
    library = e.library;
    console.log("[System] Status:\n\tFontlist[",fontlist,"];\n\tLibrary[",library,"];");
}
function getLists(e){
    var gettingItem = host.storage.local.get([
        "lists", "library"
    ]);
    gettingItem.then(assignLists, error);
    return;
}
function restoreDefaults(e){
if(e == "library"){
    host.storage.local.set({
        library: {
            fonts: [
                {
                    name: "",
                    type: "disabled",
                    use: [""],
                    weight: ""
                },
                {
                    name: "Cursive",
                    type: "preinstalled",
                    use: ["cursive"],
                    weight: "normal"
    
                },
                {
                    name: "Monospace",
                    type: "preinstalled",
                    use: ["monospace"],
                    weight: "normal"
                },
                {
                    name: "Sans Serif",
                    type: "preinstalled",
                    use: ["sans-serif"],
                    weight: "normal"
                },
                {
                    name: "Script",
                    type: "preinstalled",
                    use: ["script"],
                    weight: "normal"
                },
                {
                    name: "Serif",
                    type: "preinstalled",
                    use: ["serif"],
                    weight: "normal"
                }
            ]
        }
    });
    console.log("%c [Settings] Created new font library.",'background: grey; color: black');
    var getting = host.storage.local.get([
        "lists", "library"
    ]);
    getting.then(function(e){
        var fontlist = e.lists.fontlist;
        var library = e.library.fonts;
        for(item of fontlist){
            var count = 0;
            for(font of library){
                if(item.font == font.name || item.font == "_inheritGlobalFont"){
                    count++;
                }
            }
            if(count == 0){
                item.font = "";
                console.log("%c [Settings] Conflicting lists caused an item to be reset.",'background: grey; color: black');
            }
        }
        host.storage.local.set({
            lists: {
                fontlist: fontlist
            }
        });
        }, error);
        return;
}
if(e == "lists"){
    host.storage.local.set({
        lists: {
            fontlist: [
                {
                    type: "global",
                    font: ""
                },
            ]
        }
    });
    console.log("% c[Settings] Created new fontlist.",'background: grey; color: black');
    return;
}
host.storage.local.set({
    lastVersion: browser.runtime.getManifest().version,
    systemSettings: {
      enabled: true,
    },
    browserAction: {
        more: "Show Less"
    },
    lists: {
        fontlist: [
            {
                type: "global",
                font: ""
            },
        ]
    },
    library: {
        fonts: [
            {
                name: "",
                type: "disabled",
                use: [""],
                weight: ""
            },
            {
                name: "Cursive",
                type: "preinstalled",
                use: ["cursive"],
                weight: "normal"

            },
            {
                name: "Monospace",
                type: "preinstalled",
                use: ["monospace"],
                weight: "normal"
            },
            {
                name: "Sans Serif",
                type: "preinstalled",
                use: ["sans-serif"],
                weight: "normal"
            },
            {
                name: "Script",
                type: "preinstalled",
                use: ["script"],
                weight: "normal"
            },
            {
                name: "Serif",
                type: "preinstalled",
                use: ["serif"],
                weight: "normal"
            }
        ]
    }
});
console.log("%c[System] Created new settings lists.",'background: black');
}
function frontEndHandler(request, sender, sendResponse) {
    if(request.reFont){
        console.log("");
        console.log("%c[System] Preparing Data for: '" + sender.url + "'",'color: lightblue');
            var sendFont = match(sender.url,true);
            var fontCode = "";
            var externalFont = null;
            for(i = 0; i < library.fonts.length; i++){
                if(library.fonts[i].use == sendFont.f && library.fonts[i].location){
                    console.log("%c[System] Matched Font for '" + sendFont.f[0] + "' to '" + library.fonts[i].location + "'",'color: lightblue');
                    externalFont = library.fonts[i].location;
                    fontCode += "@import url('" + externalFont + "');";
                }
                if(library.fonts[i].use == sendFont.f && library.fonts[i].fontLocation){
                    console.log("%c[System] Matched Font for '" + sendFont.f[0] + "' to '" + library.fonts[i].fontLocation + "'",'color: lightblue');
                    externalFont = library.fonts[i].fontLocation;
                    fontCode += "@font-face{font-family: " + library.fonts[i].use[0] + ";src: url(" + externalFont + ");}";
                }
            }
            fontCode += "*{font-family: " + sendFont.f + ", fontAwesome !important;}";
            console.log(sendFont.w)
            console.log("%c[System] Exec " + fontCode,'background: black; color: blue');
            if(system.enabled == true){
                host.tabs.insertCSS(
                    sender.tab.id,
                    {
                        code: fontCode,
                        runAt: "document_start",
                        allFrames: true
                    }
                );
                sendResponse({
                    exec: fontCode
                });
            }
        if(system.enabled == false){
            console.log("%c[System] Not modified - " + sender.url,'color: red')
            sendResponse("disabled");
        }
        else{
            console.log("%c[System] Modified - " + sender.url, 'color: green;');
        }
        console.log("");
        if((request.reFont != fontCode && request.reFont != "!") || system.enabled == false){
            console.log("%c[System] Removed CSS Junk",'color: darkred')
            host.tabs.removeCSS(
                sender.tab.id,
                {
                    code: request.reFont,
                    allFrames: true
                }
            );
        }
    }
    if(request.checkList){
        var x = host.tabs.query({
            currentWindow: true,
            active: true
        })
        x.then(function(tabs){
            console.log("%c[System] Preparing Data for Browser Action.",'color: white; background: black');
            browserActionLastMessage = tabs[0].url;
            var f = match(tabs[0].url);
            host.runtime.sendMessage({font: f, curr: tabs[0].url})
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
                url = "#/general";
                break;
            case "whitelist":
                url = "#/whitelistManagement";
                break;
            case "font":
                url = "#/fontManagement";
                break;
            case "getFonts":
                url = "#/library";
                break;
            case "changelog":
                url = "#/viewChangelog"
                break;
        }
        var creating = host.tabs.create({
            url:"mgmt.refont" + url
        });
    }
    //beta UI 
    if(request.settings == "betaRestore"){
        restoreDefaults();
    }
    if(request.settings == "betaRefresh"){
        host.runtime.reload();
    }
    if(request.settings == "betaNewLibrary"){
        var sync = restoreDefaults("library");
    }
    if(request.settings == "betaNewFontlist"){
        var sync = restoreDefaults("lists");
    }
    else{
        return;
    }
}
function frontEnd(tabs){
        for (let tab of tabs) {
            host.tabs.sendMessage(tab.id,"msg");
        }
        switch(system.enabled){
            case true:
                console.warn("%c [System] Enabled ", "color: green; background: black;");
                browser.browserAction.setIcon({
                    path: {
                        128: "Pict128.png",
                        64: "Pict64.png"
                    }
                });
                break;
            case false:
                console.warn("%c [System] Disabled ", "color: red; background: black;");
                browser.browserAction.setIcon({
                    path: {
                        128: "Pict128d.png",
                        64: "Pict64d.png"
                    }
                });
                break;
        }
        
}
function sysInfo(e){
    console.log(e)
    if(e.lists){
        console.log("getLists")
        getLists(e);
    }
    if(e.systemSettings){
        console.log("system")
        var getting = host.storage.local.get(
            "systemSettings"
        );
        getting.then(function(e){
            system = e.systemSettings;
            host.tabs.query({}).then(frontEnd,error);
        }, error);
        return;
    }
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
        console.log("%c[System] Restored settings from previous session.",'color: white; background: black');
    }
}, function(error){console.exception(`${error}`)});

browser.tabs.onUpdated.addListener(function(id,change,e){
    host.tabs.query({
        currentWindow: true,
        active: true
    }).then(function(activeTab){
        if(activeTab[0].id == e.id){
            browser.tabs.get(e.id).then(function(tab){
                if(browserActionLastMessage != tab.url){
                    browserActionLastMessage = tab.url;
                    browser.runtime.sendMessage({
                        tabChange: " "
                    });
                    console.log("[System] Tab change was sent.")
                }
            });
        }
        else{
            console.log("[System] Tab change was not sent.")
        }
    });
});
browser.tabs.onHighlighted.addListener(function(e){
    browser.runtime.sendMessage({
        tabChange: " "
    });
});