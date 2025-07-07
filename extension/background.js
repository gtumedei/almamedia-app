console.log("SW loaded")

console.log(chrome.runtime.onMessage.addListener)

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received")

  // Show the action icon for the tab that the sender (content script) was on
  if (sender.tab && sender.tab.id) {
    console.log("Enabling sender tab")
    chrome.action.enable(sender.tab.id)
  }

  // Return nothing to let the connection be cleaned up
  sendResponse({})
})

console.log("Listener registered")
