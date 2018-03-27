var curr = {
  exec: "!",
  last: [null,"normal"]
}
function error(error) {
  setTimeout(function(){
    getFontData();
    console.log("e")
  }, 100)
}
  function handleFontResponse(message) {
    if(message.exec){
      curr.exec = message.exec;
    }
    if(message.last){
      curr.last = message.last;
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
