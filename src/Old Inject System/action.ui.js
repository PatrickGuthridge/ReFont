var host = browser;
var site;
var lists;
var library;
if(window.location.hash !== "#reload"){
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
  e.preventDefault();
  var opening;
  switch(e.originalTarget.id){
    case "openManagement":
      opening = "mgmt";
      break;
    case "whitelistManagement":
      opening = "whitelist";
      break;
    case "fontManagement":
      opening = "font";
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
  if(e.originalTarget.name == "globalFont"){
    lists.fontlist[0].font = document.querySelector("[name='globalFont']").value;
  }
  if(e.originalTarget.name == "siteFont"){
    var siteFont = document.querySelector("[name='siteFont']").value;
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
    var pageFont = document.querySelector("[name='pageFont']").value;
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
      lists.fontlist[site.fontlist.page.edit].font = pageFont;
    }
  }
  save();
}
function save(e) {
  /*      {
        type: "global",
        font: document.querySelector("[name='globalFont']").value
      },*/
    host.storage.local.set({
      systemSettings: {
        enabled: document.querySelector("input[name='enabled']").checked,
      },
      lists: {
        whitelist: lists.whitelist,
        fontlist: lists.fontlist
      }
    });
    window.location.hash = "reload";
    window.location.reload();
  }
  function whitelistBHandle(details){
    var pageWhitelist = document.querySelector("input[name='whitelistPage']");
    var siteWhitelist = document.querySelector("input[name='whitelistSite']");
    if(details.originalTarget.name == "whitelistPage"){
      switch(details.originalTarget.value){
        case "Remove Page from whitelist.":
          if(site.whitelist.page.value == null){
            var newProperty = {
              blacklist: true,
              type: "url",
              resource: site.curr,
            }
            lists.whitelist.push(newProperty);
          }
          else{
            lists.whitelist.splice(site.whitelist.page.edit);
          }
        break;
        case "Whitelist Page.":
          if(site.whitelist.page.value == true){
            lists.whitelist.splice(site.whitelist.page.edit);
          }
          else{
            var newProperty = {
              type: "url",
              resource: site.curr,
            }
            lists.whitelist.push(newProperty);
          }
      }
    }
    else if(details.originalTarget.name == "whitelistSite"){
      switch(details.originalTarget.value){
        case "Remove Site from whitelist.":
          lists.whitelist.splice(site.whitelist.site.edit);
          break;
        case "Whitelist Site.":
          var newProperty = {
            type: "site",
            resource: site.name,
          }
          lists.whitelist.push(newProperty);
      }
    }
    save();
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
  function forTheSite(message){
    if(message.whitelist && message.font){
    console.log("[Front End] Recieved data for browser action")
    var wls = message.whitelist
    var fls = message.font
    site = {
      curr: message.curr.split(":").splice(1)[0].split("?")[0],
      name: message.curr.split(":").splice(1)[0].split("/")[2],
      whitelist: {
        page: {
          value: wls.url.enabled,
          edit: wls.url.position
        },
        site: {
          value: wls.site.enabled,
          edit: wls.site.position
        }
      },
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
  for(font in library.fonts){
    var siteChoice = document.createElement("option");
    siteChoice.value = library.fonts[font].name;
    siteChoice.text = library.fonts[font].name;
    if(library.fonts[font].name == site.fontlist.site.value){
      siteChoice.selected = true;
      siteParent = null;
    }
    if(siteChoice.value != ""){
      document.querySelector("[name='siteFont']").add(siteChoice);
    }
  }
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
    if(pageChoice.value != ""){
      document.querySelector("[name='pageFont']").add(pageChoice);
    }
  }
  switch(pageParent){
    case "global":
      document.querySelector("[name='pageFont']").children[0].selected = true;
      break;
    case "site":
      document.querySelector("[name='pageFont']").children[1].selected = true;
      break;
    case null:
      break;
  }


    console.log("[Front End] Data Object:",site); //for dev purposes
    var pageWhitelist = document.querySelector("input[name='whitelistPage']");
    var siteWhitelist = document.querySelector("input[name='whitelistSite']");
    if(site.whitelist.site.value == false && site.whitelist.page.value == null){
      pageWhitelist.value = "Remove Page from whitelist."
      siteWhitelist.value = "Remove Site from whitelist."
    }
    else if(site.whitelist.page.value == null || site.whitelist.page.value == true){
      pageWhitelist.value = "Whitelist Page."
    }
    else{
      pageWhitelist.value = "Remove Page from whitelist."
    }
    if(site.whitelist.site.value == null){
      siteWhitelist.value = "Whitelist Site."
    }
    else{
      siteWhitelist.value = "Remove Site from whitelist."
    }
    if(site.name == undefined){
      document.querySelector("#siteOptions").outerHTML = "";
      document.querySelector("#pageOptions").outerHTML = "";
      document.querySelector("#alt").innerHTML += "<br><h3>:( Error!<p><b>Refont can't be used on this page.</b></h3></p><br>";
      document.querySelector("input[name='enabled']").disabled = true;
      document.querySelector("#gfc").innerHTML = "";
    }
    getFontData();
  }
  }
  function restore() {
    host.storage.local.get([
      "lists", "library"
    ]).then(function(e){
      lists = e.lists;
      library = e.library;
    });

    document.querySelector("#browserAction").addEventListener("change", preSave);
    function setCurrentChoice(result) {
      document.querySelector("input[name='enabled']").checked = result.systemSettings.enabled;
    }
    document.querySelector("input[name='whitelistPage']").addEventListener("click", whitelistBHandle);
    document.querySelector("input[name='whitelistSite']").addEventListener("click", whitelistBHandle);
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