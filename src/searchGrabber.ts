let search_input = document.querySelector("input.gsfi") as HTMLInputElement;

chrome.runtime.sendMessage({ search: search_input.value }, function (response) {
    console.log(response.keywords);
});