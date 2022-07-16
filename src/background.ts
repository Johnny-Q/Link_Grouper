const PARSE_KEYWORDS = false;

const tabIDToKeyword: {
    [id: number]: string[]
} = {}
const tabIDToSearch: {
    [id: number]: string
} = {}
const linksBySearch: {
    [search: string]: {
        "created": number,
        "links": string[]
    }
} = {}
chrome.runtime.onInstalled.addListener(() => {
    //run code on installation
})

chrome.tabs.onCreated.addListener(function (tab) {
    console.log(tab.openerTabId)
    console.log(tab.pendingUrl);
    const opener_id = tab.openerTabId ?? -1;
    if (opener_id != -1) { //opener tab still exists
        const search = tabIDToSearch[opener_id] ?? "";
        if (search) {
            if (linksBySearch[search]) {
                //check if the link already exists
                if (!linksBySearch[search].links.includes(tab.pendingUrl as string)) {
                    linksBySearch[search].links.push(tab.pendingUrl as string);
                }
            } else {
                linksBySearch[search] = {
                    created: Date.now(),
                    links: [tab.pendingUrl as string]
                };
            }
        }

        if (PARSE_KEYWORDS) {
            const keywords = tabIDToKeyword[opener_id];
        }

        console.log(linksBySearch);
    }
})
/* front end modifications */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.src == "frontend") {
        console.log("message received from frontend");
        if (request.type == "get linksBySearch") {
            for (let [search, data] of Object.entries(linksBySearch)) {
                let del = false;
                //delete the group if it's been there for more than 1 day
                if (Date.now() - data.created >= (1000 * 60 * 60 * 24)) {
                    del = true;
                } else if (linksBySearch[search].links.length == 0) {
                    del = true;
                }
                if(del){
                    delete linksBySearch[search];
                }
            }
            sendResponse(linksBySearch);
        } else if (request.type == "delete search") {
            delete linksBySearch[request.args[0]];
            sendResponse(linksBySearch)
        } else if (request.type == "delete link") {
            linksBySearch[request.args[0]].links = linksBySearch[request.args[0]].links.filter((link) => {
                return link != request.args[1];
            })
            sendResponse(linksBySearch)
        }
    }
})
/* receive searches */
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.src == "search_tab") {
            if (request.type == "search") {
                if (sender.tab) {
                    console.log("Search made on tab with id: " + sender.tab.id);
                    console.log(request.search);

                    const tab_id = sender.tab?.id ?? -1;
                    if (tab_id != -1) {
                        tabIDToSearch[tab_id] = request.search;
                    }

                    if (PARSE_KEYWORDS) {
                        fetch("https://api.openai.com/v1/completions", {
                            "method": "POST",
                            "headers": {
                                "Content-Type": "application/json",
                                "Authorization": "Bearer ${OPEN_AI_KEY"
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
                            response.json().then((json) => {
                                console.log(json);

                                let keywords: string[] = json.choices[0].text.trim().split(",");
                                console.log(keywords);
                                if (tab_id != -1) {
                                    tabIDToKeyword[tab_id] = keywords;
                                }
                                sendResponse(json);
                            })
                        })
                        return true;
                    }

                    sendResponse("done");
                }
            }
        }
    }
);
