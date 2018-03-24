

var host = browser;
var site;
var lists;
var library;
var updates = false;
var currVersion;
if(window.location.hash != "#reload"){
  var x = document.createElement("style");
  x.innerText = "@keyframes fade {from{opacity: 0;transform: scale(0.95);}@keyframes trans{from{opacity: 0;}}"
  document.head.appendChild(x);
}
function error(log){
  var data = host.runtime.sendMessage({
      messageType: "err",
      message: log
    });
    data.then(null, error);  
  }
function openMgmt(e){
  var opening;
  switch(e.originalTarget.id){
    case "openManagement":
      opening = "mgmt";
      break;
    case "whitelistManagement":
      opening = "whitelist";
      break;
    case "fontManagement":
      opening = "getFonts";
      break;
    case "getFonts":
      opening = "getFonts";
  }
  var data = host.runtime.sendMessage({
    open: opening
  });
  data.then(function(){
    window.close();
  }, error); 
}

function preSave(e){
  document.querySelector("#browserAction").style.display = "none";
  document.querySelector("#alt").innerText = "Just a moment...";
  if(e.originalTarget.value == "_add"){
    openMgmt({
      originalTarget:{
        id: "fontManagement"
      }
    });
    return;
  }
  if(e.originalTarget.name == "globalFont"){
    lists.fontlist[0].font = e.originalTarget.value;
  }
  if(e.originalTarget.name == "siteFont"){
    var siteFont = e.originalTarget.value;
    if(site.fontlist.site.value == null){
      var newItem = {
        type: "site",
        font: siteFont,
        resource: site.name
      }
      lists.fontlist.push(newItem)
    }
    else if(siteFont == "_inheritGlobalFont"){
      lists.fontlist.splice(site.fontlist.site.edit, 1);
    }
    else if(site.fontlist.site.value != null){
      lists.fontlist[site.fontlist.site.edit].font = siteFont;
    }
  }
  if(e.originalTarget.name == "pageFont"){
    var pageFont = e.originalTarget.value;
    if(site.fontlist.page.value == null){
      var newItem = {
        type: "url",
        font: pageFont,
        resource: site.curr
      }
      lists.fontlist.push(newItem)
    }
    else if(pageFont == "_inheritSiteFont"){
      lists.fontlist.splice(site.fontlist.page.edit, 1);
    }
    else if(site.fontlist.page.value != null){
      console.log(lists.fontlist, site.fontlist.page.edit)
      lists.fontlist[site.fontlist.page.edit].font = pageFont;
    }
  }
  save(e);
}
function save(e) {
    host.storage.local.set({
      systemSettings: {
        enabled: document.querySelector("input[name='enabled']").checked,
      },
      lists: {
        fontlist: lists.fontlist
      }
    });
    if(e.target.name != "enabled"){
      window.location.hash = "reload";
      window.location.reload();
    }
    else{
      if(e.target.checked != true){
        document.querySelector("#browserAction").className = "dull";
        document.querySelector("#reFontOverlay").style.opacity = 0;
      }
      else{
        document.querySelector("#browserAction").className = "active";
        document.querySelector("#reFontOverlay").style.opacity = 1;
      }
    }
}
  function getFontData() {
    var Font;
      if(site.fontlist.page.value != null && site.fontlist.page.value != "_inheritGlobalFont"){
        for(i in library.fonts){
          if(library.fonts[i].name == site.fontlist.page.value){
            Font = library.fonts[i].use
          }
        }
      }
      else if(site.fontlist.site.value != null){
        for(i in library.fonts){
          if(library.fonts[i].name == site.fontlist.site.value){
            Font = library.fonts[i].use
          }
        }
      }
      else if(site.fontlist.global.value != null){
        for(i in library.fonts){
          if(library.fonts[i].name == site.fontlist.global.value){
            Font = library.fonts[i].use
          }
        }
      }
    document.querySelector("#reFont").style.fontFamily = Font;


  }
  function optionsToggle(e){
    if(e.target.innerText == "Show More"){
      document.body.classList.remove("lessOptions");
      document.querySelector("#siteOptions").classList.remove("lessOptions");
      document.querySelector("#pageOptions").classList.remove("lessOptions");
      document.querySelector("#lessOptionsToggle").innerText = "Show Less";
      document.querySelector(".st").innerText = "Global Font:";
      browser.storage.local.set({
        browserAction: {
          more: "Show More"
        }
      });
    }
    else if(e.target.innerText == "Show Less"){
      document.body.classList.add("lessOptions");
      document.querySelector("#siteOptions").classList.add("lessOptions");
      document.querySelector("#pageOptions").classList.add("lessOptions");
      document.querySelector("#lessOptionsToggle").innerText = "Show More";
      document.querySelector(".st").innerText = "Font:";
      browser.storage.local.set({
        browserAction: {
          more: "Show Less"
        }
      });
    }
  }
  function forTheSite(message){
    if(message.tabChange){
      window.location.reload();
    }
    if(message.font){
    console.log("%c[Front End] Recieved data for browser action",'background: white; color: purple');
    var fls = message.font;
    site = {
      curr: message.curr.split(":").splice(1)[0].split("?")[0],
      name: message.curr.split(":").splice(1)[0].split("/")[2],
      fontlist: {
        global: {
          value: fls.global.font
        },
        page: {
          value: fls.url.font,
          edit: fls.url.position
        },
        site: {
          value: fls.site.font,
          edit: fls.site.position
        }
      }
    }
    var getPref = browser.storage.local.get("browserAction");
    getPref.then(function(e){
      optionsToggle({
        target: {
          innerText: e.browserAction.more
        }
      });
    }, error);
    document.querySelector("#lessOptionsToggle").addEventListener("click", optionsToggle);
    var siteParent = "global";
    var pageParent = "site";
  for(font in library.fonts){
      var globalChoice = document.createElement("option");
      globalChoice.value = library.fonts[font].name;
      globalChoice.text = library.fonts[font].name;
      if(library.fonts[font].name == lists.fontlist[0].font){
        globalChoice.selected = true;
      }
      if(globalChoice.value != ""){
        document.querySelector("[name='globalFont']").add(globalChoice);
      }
  }
  var globalChoice = document.createElement("option");
  globalChoice.value = "_add";
  globalChoice.text = "Add More Fonts...";
  document.querySelector("[name='globalFont']").add(globalChoice);
  for(font in library.fonts){
    var siteChoice = document.createElement("option");
    siteChoice.value = library.fonts[font].name;
    siteChoice.text = library.fonts[font].name;
    if(library.fonts[font].name == site.fontlist.site.value){
      siteChoice.selected = true;
      siteParent = null;
    }
    else if(site.fontlist.site.value == "_inheritGlobalFont"){
      siteParent = "global"
    }
    if(siteChoice.value != ""){
      document.querySelector("[name='siteFont']").add(siteChoice);
    }
  }
  var siteChoice = document.createElement("option");
  siteChoice.value = "_add";
  siteChoice.text = "Add More Fonts...";
  document.querySelector("[name='siteFont']").add(siteChoice);
  for(font in library.fonts){
    var pageChoice = document.createElement("option");
    pageChoice.value = library.fonts[font].name;
    pageChoice.text = library.fonts[font].name;
    if(library.fonts[font].name == site.fontlist.page.value){
      pageChoice.selected = true;
      pageParent = null;
    }
    else if(site.fontlist.page.value == "_inheritGlobalFont"){
      pageParent = "global"
    }
    else if(site.fontlist.page.value == "_inheritSiteFont"){
      pageParent = "site"
    }
    if(pageChoice.value != ""){
      document.querySelector("[name='pageFont']").add(pageChoice);
    }
  }
  var pageChoice = document.createElement("option");
  pageChoice.value = "_add";
  pageChoice.text = "Add More Fonts...";
  document.querySelector("[name='pageFont']").add(pageChoice);
  switch(siteParent){
    case "global":
      document.querySelector("[name='siteFont']").children[1].selected = true;
      break;
    case null:
      break;
  }
  switch(pageParent){
    case "global":
      document.querySelector("[name='pageFont']").children[1].selected = true;
      break;
    case "site":
      document.querySelector("[name='pageFont']").children[2].selected = true;
      break;
    case null:
      break;
  }

  browser.storage.local.get("lastVersion").then(function(e){
    currVersion = browser.runtime.getManifest().version;
    if(e.lastVersion != currVersion){
        console.log("[System] Was updated to", currVersion);
        browser.storage.local.set({
            lastVersion: currVersion
        });
        document.querySelector("#messages").innerText = "Just updated to v" + currVersion;
        document.querySelector("#messages").style.opacity = 1;
        document.querySelector("#messages").addEventListener("mouseover", function(){
            document.querySelector("#messages").innerText = "View Changelog...";
        });
        document.querySelector("#messages").addEventListener("mouseout", function(){
            document.querySelector("#messages").innerText = "Just updated to v" + currVersion;
        });
        document.querySelector("#messages").addEventListener("click", function(){
            browser.runtime.sendMessage({
                open: "changelog"
            });
            window.close();
        });
        updates = true;
    }
  });
  document.querySelector("#openManagement").addEventListener("mouseover", function(){
    document.querySelector("#messages").innerText = "More Settings";
    document.querySelector("#messages").style.opacity = 1;
});
document.querySelector("#openManagement").addEventListener("mouseout", function(){
    if(updates != true){
        document.querySelector("#messages").style.opacity = 0;
    }
    else{
      document.querySelector("#messages").innerText = "Just updated to v" + currVersion;
    }
});
document.querySelector("#getFonts").addEventListener("mouseover", function(){
    document.querySelector("#messages").innerText = "Add More Fonts";
    document.querySelector("#messages").style.opacity = 1;
});
document.querySelector("#getFonts").addEventListener("mouseout", function(){
  if(updates != true){
      document.querySelector("#messages").style.opacity = 0;
  }
  else{
    document.querySelector("#messages").innerText = "Just updated to v" + currVersion;
  }
});
    document.querySelector("#browserAction").style.display = "";
    document.querySelector("#alt").innerText = "";
    console.log("[Front End] Data Object:",site); 
    var error = document.createElement("h3");
    if(site.name == undefined){
          error.innerText = ":(\nRefont can't modify this page.";
    }
    else if(site.name.includes(".") != true && site.name != "localhost"){
          error.innerText = ":( Oops.\nReFont can only be used on pages with regular URLs.";
    }
    else if(site.name == "addons.mozilla.org"){
      error.innerText = "For security reasons, ReFont can't modify addons.mozilla.org";
    }
    else{
      getFontData();
      return;
    }

    document.querySelector("#reFontOverlay").style.display = "none";
    document.body.classList.add("alt");
    document.querySelector("#browserAction").outerHTML = "";
    document.querySelector("#alt").appendChild(error);
  }
  }
  function restore() {
    document.querySelector("#browserAction").style.display = "none";
    document.querySelector("#alt").innerText = "Loading";
    host.storage.local.get([
      "lists", "library"
    ]).then(function(e){
      lists = e.lists;
      library = e.library;
    });

    document.querySelector("#content").addEventListener("change", preSave);
    function setCurrentChoice(result) {
      document.querySelector("input[name='enabled']").checked = result.systemSettings.enabled;
      if(result.systemSettings.enabled != true){
        document.querySelector("#browserAction").className = "dull";
        document.querySelector("#reFontOverlay").style.opacity = 0;
      }
      else{
        document.querySelector("#browserAction").className = "active";
      }
    }
    document.querySelector("#openManagement").addEventListener("click", openMgmt);
    //document.querySelector("#whitelistManagement").addEventListener("click", openMgmt);
    //document.querySelector("#fontManagement").addEventListener("click", openMgmt);
    document.querySelector("#getFonts").addEventListener("click", openMgmt);
    function onError(error) {
      console.log(`Error: ${error}`);
    }
    var data = host.runtime.sendMessage({
      checkList: "_"
    });
    data.then(null, error);
    var getting = host.storage.local.get(["systemSettings"]);
    getting.then(setCurrentChoice, onError);
    
  }
document.addEventListener("DOMContentLoaded", restore);
host.runtime.onMessage.addListener(forTheSite);