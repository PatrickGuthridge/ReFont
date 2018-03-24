var curr = {
  exec: "!",
  last: [null]
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
    if(message.exec){
      console.log(curr.exec)
      curr.exec = message.exec;
    }
    if(message.last){
      curr.last = message.last;
      console.log(curr.last)
    }
  }
  function getFontData(){
    var data = browser.runtime.sendMessage({
      reFont: curr.exec,
      last: curr.last
    });
    data.then(handleFontResponse, error);  
  }
  getFontData();
function backgroundHandler(request, sender, sendResponse){
    getFontData();
    sendResponse(null);
}
browser.runtime.onMessage.addListener(backgroundHandler);
