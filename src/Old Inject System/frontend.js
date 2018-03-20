function error(error) {
    extLog(` ${error}`,"err");
  }
  function handleFontResponse(message) {
    if(message == "whitelisted" || message == "disabled"){
      if(curr.pre != true){
        extLog("[Front End] - Was not refonted -");
        return;
      }
      else{
        curr.font = "";
      }
    }
    else{
      curr.font = message.font;
      curr.fontLocation = message.fontLocation;
    }
    reFont();
  }
  function getFontData() {
    var data = browser.runtime.sendMessage({
      reFont: "_"
    });
    data.then(handleFontResponse, error);  
  }
    function extLog(log,type){
    var data = browser.runtime.sendMessage({
        messageType: type,
        message: log
      });
      data.then(null, error);  
    }


function backgroundHandler(request, sender, sendResponse){
    getFontData();
    sendResponse(null);
}
browser.runtime.onMessage.addListener(backgroundHandler);


function reFont(){
  if(curr.font == ""){
    extLog("[Front End] - Was not refonted -");
  }
  curr.pre = true;
  onDocumentChange.disconnect();
  try{
    document.querySelector("#fontLocation").outerHTML = "";
  }
  catch(e){}
  if(curr.fontLocation != null){
    //document.head.innerHTML += "<link id=\"fontLocation\" rel=\"stylesheet\" href=\"" + curr.fontLocation + "\">";
  }
  console.log("h");
  e = document.body.querySelectorAll("*")
  for(i = 0; i < e.length; i++){
      e[i].style.fontFamily = curr.font;
  }
  extLog(curr.font,"reFonted")
  onDocumentChange.observe(curr.element.doc, check0);
}

var check0 = {subtree: true, childList: true};
var onDocumentChange = new MutationObserver(reFont);
var curr = {
  element: {
      doc: document.body,
  },
  font: "",
  fontLocation: null,
  pre: false 
}
getFontData();
