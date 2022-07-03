chrome.runtime.onInstalled.addListener(() => {
    //run code on installation
})

chrome.tabs.onCreated.addListener(function (tab){
    console.log(tab.openerTabId)
})

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        console.log(request.search);
        //make request to openai
        sendResponse("done");
        // return true;
    }
);