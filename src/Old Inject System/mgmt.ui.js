var host = browser;
//Temp
var betaNote = "<a>Author's note: In this beta version, the UI is incomplete. Thank you for you patience.</a>"
var betaComingSoon = "<p>This page is coming soon.</p>"
var betaLinks = "<p>More fonts will soon available for direct install from:</p><a href=\"https://fonts.google.com\">Google Fonts</a><p></p><p>External Fonts can be installed below:</p><br><label>Stylesheet URL:</label><input id=\"betaExtUrl\"><br><label>User Font Name:</label><input id=\"betaExtName\"><br><label>System Font Name:</label><input id=\"betaExtFont\"><br><label>Backup Font(s)[separated by commas]:</label><input id=\"betaExtBak\"><br><button id=\"betaExtAdd\">Add External Font</button><p>Fonts on your system can still be added to the list below:</p><br><label>Type font name</label><input id=\"betaInput\"></input><button id=\"betaInputAdd\">Add local font</button><button id=\"betaInputRemove\">Remove font</button>";
var betaRestoreDefaults = "<br><button class=\"betaRestore\">Restore Defaults</button><br><button class=\"betaRefresh\">Refresh Extension</button>";

var uiContainer;
var currPath;
function setLocation(){
    currPath = window.location.hash.split("/");
    currPath.splice(0,1)
    //temp
    if(currPath[1] == "getFonts"){
        uiContainer.innerHTML = betaNote + betaLinks;
        host.storage.local.get(["library"]).then(function(e){
            var list = e.library.fonts;
            for(i in list){
                t = Number(i);
                if( list[i].name != ""){
                    uiContainer.innerHTML += "<p>" + t + ". " + list[i].name + "</p>";
                }
            }
            document.querySelector("#betaInputAdd").addEventListener("click",function(){
                host.storage.local.get(["library"]).then(function(e){
                    var list = e.library.fonts;
                    if(document.querySelector("#betaInput").value == ""){
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
                });
            });
            document.querySelector("#betaInputRemove").addEventListener("click",function(){
                host.storage.local.get(["library","lists"]).then(function(e){
                    var list = e.library.fonts;
                    var Whitelist = e.lists.whitelist;
                    var check = e.lists.fontlist;
                    if(document.querySelector("#betaInput").value == ""){
                        return;
                    }
                    for(i in list){
                        if(list[i].name == document.querySelector("#betaInput").value && document.querySelector("#betaInput").value != "Sans Serif"){
                            list.splice(i,1);
                        }
                    }
                    for(i in check){
                        if(check[i].font == document.querySelector("#betaInput").value){
                            if(i != 0){
                                check.splice(i,1);
                            }
                            else{
                                check[i].font = "Sans Serif"
                            }
                        }
                    }
                    console.log(list,check)
                    console.log("e")
                    host.storage.local.set({
                        library: {fonts: list},
                        lists: {fontlist: check, whitelist: Whitelist}
                    });
                    window.location.reload();
                });
            });
            document.querySelector("#betaExtAdd").addEventListener("click",function(){
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
            });
        });
    }
    else{
        uiContainer.innerHTML = betaNote + betaComingSoon + betaRestoreDefaults;
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
    }
}
function prepareDocument(e){
    document.body.innerHTML = "<div id=\"managementUI\"></div>";
    uiContainer = document.querySelector("#managementUI");
    setLocation();
}
window.onload = prepareDocument;