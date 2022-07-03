chrome.runtime.onInstalled.addListener(()=>{
    //run code on installation
})

chrome.tabs.onCreated.addListener(()=>{
    console.log("tab created")
})