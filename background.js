chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostEquals: 'jana.snowflakecomputing.com' },
          })
        ],
        actions: [ new chrome.declarativeContent.ShowPageAction() ]
      }
    ]);
  });
});

var injectScript = `

var s = document.createElement('script');
s.src = chrome.extension.getURL('draw_chart.js');
(document.head||document.documentElement).appendChild(s);
s.onload = function() {
    s.parentNode.removeChild(s);
};

`;

chrome.pageAction.onClicked.addListener(function(tab) {
  chrome.tabs.executeScript({
    code: injectScript
  });
});
