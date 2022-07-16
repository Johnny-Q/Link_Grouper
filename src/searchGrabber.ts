// grabs the search bar item
//TODO add check if it's YouTube, google, or duckduckgo (parse link)
console.log("injected");
const link_grouper_params = new URLSearchParams(window.location.search);
let link_grouper_search = "";
const keys = ["q", "search_query"];
for(let i = 0;i < keys.length; i++){
    if(link_grouper_params.get(keys[i])){
        link_grouper_search = link_grouper_params.get(keys[i]) as string;
        break;
    }
}
if (link_grouper_search) {
    chrome.runtime.sendMessage({ src: "search_tab", type: "search", search: link_grouper_search }, function (response) {
        console.log(response.keywords);
    });
}