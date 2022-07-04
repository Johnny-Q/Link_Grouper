chrome.runtime.onInstalled.addListener(() => {
    //run code on installation
})

chrome.tabs.onCreated.addListener(function (tab) {
    console.log(tab.openerTabId)
})

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (sender.tab) {
            console.log("Search made on tab with id: " + sender.tab.id);
            console.log(request.search);
            fetch("https://api.openai.com/v1/completions", {
                "method":"POST",
                "headers": {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer OPENAIKEY"
                },
                "body": JSON.stringify({
                    "model": "text-davinci-002",
                    "prompt": `Extract keywords from this text:\n\n${request.search}\n`,
                    "temperature": 0.3,
                    "max_tokens": 60,
                    "top_p": 1.0,
                    "frequency_penalty": 0.8,
                    "presence_penalty": 0.0
                })
            }).then((response) => {
                response.json().then((json)=>{
                    console.log(json);
                    let keywords: string = json.choices[0].text.trim().split(",");
                    console.log (keywords);
                    sendResponse(json);
                })
            })
            return true;
        } else {
            sendResponse("not from content script");
        }
    }
);