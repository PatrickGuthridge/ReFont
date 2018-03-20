var curr = {
  exec: "!"
}
function extLog(log,type){
  var data = browser.runtime.sendMessage({
    messageType: type,
    message: log
  });
  data.then(null, error);  
}
function error(error) {
  extLog(` ${error}`,"err");
}
  function handleFontResponse(message) {
    if(message == "whitelisted" || message == "disabled"){
      return;
    }
    curr.exec = message.exec;
  }
  function getFontData(){
    var data = browser.runtime.sendMessage({
      reFont: curr.exec
    });
    data.then(handleFontResponse, error);  
  }
  getFontData();
function backgroundHandler(request, sender, sendResponse){
    getFontData();
    sendResponse(null);
}
browser.runtime.onMessage.addListener(backgroundHandler);
