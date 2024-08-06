// link_checker.js

function checkLinkPattern() {
    const pathSegments = window.location.pathname.split('/').filter(segment => segment.length > 0);

    if (pathSegments.length === 1 && /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/.test(pathSegments[0])) {
        console.log("MeetMan: Valid Google Meet link pattern detected. Injecting main script.");
        injectMainScript();
    } else {
        console.log("MeetMan: Not a valid Google Meet link pattern. Extension will not activate.");
    }
}

function injectMainScript() {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('content.js');
    script.onload = function () {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
}

// Run the check when the page loads
checkLinkPattern();