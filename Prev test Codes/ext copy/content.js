let captionText = '';
let intervalId;
let lastSpeaker = '';
let startTime;

function getISTTime() {
    const now = new Date();
    const utcOffset = now.getTimezoneOffset() * 60000;
    const istOffset = 5.5 * 60 * 60000;
    const istTime = new Date(now.getTime() + utcOffset + istOffset);

    const year = istTime.getFullYear();
    const month = String(istTime.getMonth() + 1).padStart(2, '0');
    const date = String(istTime.getDate()).padStart(2, '0');
    const hours = String(istTime.getHours()).padStart(2, '0');
    const minutes = String(istTime.getMinutes()).padStart(2, '0');
    const seconds = String(istTime.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${date}-${hours}-${minutes}-${seconds}`;
}

function collectCaptionText() {
    const spans = document.querySelectorAll('div[jsname="tgaKEf"] span');
    let newText = Array.from(spans).map(span => span.textContent).join(' ');
    const speakerElement = document.querySelector('.zs7s8d.jxFHg');
    const currentSpeaker = speakerElement ? speakerElement.textContent.trim() : 'Unknown Speaker';

    if (newText && (newText !== captionText || currentSpeaker !== lastSpeaker)) {
        if (currentSpeaker !== lastSpeaker) {
            captionText += `\n\n${currentSpeaker}: `;
            lastSpeaker = currentSpeaker;
        }
        captionText += newText.trim().replace(/\*\*/g, '') + ' ';
        console.log('Bot: New caption text collected');
    }
}

async function saveCaptionToFirebase() {
    const apiUrl = 'https://meet-man-api.vercel.app/api/dump-to-firebase';

    const formData = new FormData();
    const captionBlob = new Blob([captionText], { type: 'text/plain' });
    formData.append('file', captionBlob, `meet_captions_${startTime}.txt`);

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Bot: Caption saved to Firebase:', result);
        return result;
    } catch (error) {
        console.error('Bot: Error saving caption to Firebase:', error);
        throw error;
    }
}

function downloadCaptionText() {
    const blob = new Blob([captionText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meet_captions_${startTime}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    saveCaptionToFirebase()
        .then(result => {
            console.log('Bot: Caption saved to Firebase successfully');
            updateStatus("Caption saved to Firebase");
        })
        .catch(error => {
            console.error('Bot: Failed to save caption to Firebase:', error);
            updateStatus("Failed to save caption to Firebase");
        });
}

function handleError(error) {
    if (error.message === 'Signal asynchronously disposed') {
        console.log('Bot: Detected specified error. Downloading caption text...');
        downloadCaptionText();
    }
}

async function makeApiRequest(question) {
    const apiUrl = 'https://meet-man-api.vercel.app/api/process-caption';

    const formData = new FormData();
    const captionBlob = new Blob([captionText], { type: 'text/plain' });
    formData.append('file', captionBlob, 'caption_text.txt');
    formData.append('question', question);

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Bot: API Response:', data);
        return data;
    } catch (error) {
        console.error('Bot: Error making API request:', error);
        throw error;
    }
}

async function ask(question) {
    try {
        updateStatus("Sending request to API...");
        const response = await makeApiRequest(question);
        console.log('Bot: API Response:', response);
        updateStatus("Response:");
        displayResponse(response);
        return response;
    } catch (error) {
        console.error('Bot: Error:', error);
        updateStatus("Error: " + error.message);
    }
}

let extensionDiv, statusDiv, responseDiv, questionInput, askButton, clearButton, copyButton, buttonContainer;

function createUI() {
    extensionDiv = document.createElement('div');
    extensionDiv.style.position = 'fixed';
    extensionDiv.style.top = '10px';
    extensionDiv.style.right = '10px';
    extensionDiv.style.zIndex = '9999';
    extensionDiv.style.backgroundColor = '#333333';
    extensionDiv.style.color = '#FFFFFF';
    extensionDiv.style.padding = '10px';
    extensionDiv.style.border = '1px solid #555555';
    extensionDiv.style.maxWidth = '300px';
    extensionDiv.style.maxHeight = '80vh';
    extensionDiv.style.overflowY = 'auto';
    extensionDiv.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';

    questionInput = document.createElement('input');
    questionInput.type = 'text';
    questionInput.placeholder = 'Ask a question';
    questionInput.style.width = '100%';
    questionInput.style.marginBottom = '10px';
    questionInput.style.padding = '5px';
    questionInput.style.backgroundColor = '#444444';
    questionInput.style.color = '#FFFFFF';
    questionInput.style.border = '1px solid #555555';
    questionInput.addEventListener('focus', () => {
        updateStatus("");
    });
    questionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            askButton.click();
        }
    });

    askButton = document.createElement('button');
    askButton.textContent = 'Ask';
    askButton.style.width = '100%';
    askButton.style.marginBottom = '10px';
    askButton.style.padding = '5px';
    askButton.style.backgroundColor = '#4CAF50';
    askButton.style.color = '#FFFFFF';
    askButton.style.border = 'none';
    askButton.style.cursor = 'pointer';
    askButton.onclick = () => ask(questionInput.value);

    statusDiv = document.createElement('div');
    statusDiv.style.marginBottom = '10px';
    statusDiv.style.fontStyle = 'italic';
    statusDiv.style.color = '#CCCCCC';

    responseDiv = document.createElement('div');
    responseDiv.style.marginBottom = '10px';
    responseDiv.style.whiteSpace = 'pre-wrap';
    responseDiv.style.fontFamily = 'Arial, sans-serif';
    responseDiv.style.backgroundColor = '#444444';
    responseDiv.style.padding = '10px';
    responseDiv.style.borderRadius = '5px';

    buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'space-between';
    buttonContainer.style.marginBottom = '10px';

    copyButton = document.createElement('button');
    copyButton.textContent = 'Copy';
    copyButton.style.flex = '1';
    copyButton.style.marginRight = '5px';
    copyButton.style.padding = '5px';
    copyButton.style.backgroundColor = '#2196F3';
    copyButton.style.color = '#FFFFFF';
    copyButton.style.border = 'none';
    copyButton.style.cursor = 'pointer';
    copyButton.style.display = 'none';
    copyButton.onclick = copyResponseText;

    clearButton = document.createElement('button');
    clearButton.textContent = 'Clear';
    clearButton.style.flex = '1';
    clearButton.style.marginLeft = '5px';
    clearButton.style.padding = '5px';
    clearButton.style.backgroundColor = '#f44336';
    clearButton.style.color = '#FFFFFF';
    clearButton.style.border = 'none';
    clearButton.style.cursor = 'pointer';
    clearButton.style.display = 'none';
    clearButton.onclick = () => {
        responseDiv.textContent = '';
        updateStatus('');
        updateButtonsVisibility();
    };

    buttonContainer.appendChild(copyButton);
    buttonContainer.appendChild(clearButton);

    extensionDiv.appendChild(questionInput);
    extensionDiv.appendChild(askButton);
    extensionDiv.appendChild(statusDiv);
    extensionDiv.appendChild(responseDiv);
    extensionDiv.appendChild(buttonContainer);

    document.body.appendChild(extensionDiv);
}

function updateButtonsVisibility() {
    const hasContent = responseDiv.textContent.trim() !== '';
    copyButton.style.display = hasContent ? 'block' : 'none';
    clearButton.style.display = hasContent ? 'block' : 'none';
    buttonContainer.style.display = hasContent ? 'flex' : 'none';
}

function copyResponseText() {
    const textToCopy = responseDiv.textContent;
    navigator.clipboard.writeText(textToCopy).then(() => {
        updateStatus("Response copied to clipboard");
        setTimeout(() => updateStatus(""), 2000);
    }, (err) => {
        console.error('Bot: Could not copy text: ', err);
        updateStatus("Failed to copy response");
    });
}

function updateStatus(message) {
    statusDiv.textContent = message;
}

function displayResponse(response) {
    responseDiv.textContent = '';
    if (response && response.response) {
        const parts = response.response.split(/(\*\*.*?\*\*|\*.*?\*)/);
        parts.forEach(part => {
            if (part.startsWith('**') && part.endsWith('**')) {
                const strong = document.createElement('strong');
                strong.textContent = part.slice(2, -2);
                strong.style.color = '#FFD700';
                responseDiv.appendChild(strong);
            } else if (part.startsWith('*') && part.endsWith('*')) {
                const em = document.createElement('em');
                em.textContent = part.slice(1, -1);
                em.style.color = '#90EE90';
                responseDiv.appendChild(em);
            } else {
                const textNode = document.createTextNode(part);
                responseDiv.appendChild(textNode);
            }
        });
    } else {
        responseDiv.textContent = "No valid response received.";
    }
    extensionDiv.style.height = 'auto';
    updateButtonsVisibility();
}

function initialize() {
    createUI();
    startTime = getISTTime();
    intervalId = setInterval(collectCaptionText, 5000);
    window.addEventListener('error', handleError);
    window.addEventListener('beforeunload', downloadCaptionText);
    console.log('Bot: Script initialized and automatically collecting captions');
    updateStatus("Collecting captions");
}

initialize();