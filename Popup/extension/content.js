// Add a div to act as the popup
const popup = document.createElement('div');
popup.id = 'hoverPopup';
popup.style.position = 'absolute';
popup.style.border = '1px solid #ccc';
popup.style.backgroundColor = '#f9f9f9';
popup.style.borderRadius = '8px';
popup.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)';
popup.style.padding = '10px';
popup.style.display = 'none'; // Start hidden
document.body.appendChild(popup);

// Add chat boxes for selected text and response
const selectedTextBox = document.createElement('div');
selectedTextBox.id = 'selectedTextBox';
selectedTextBox.style.backgroundColor = '#e0f7fa';
selectedTextBox.style.border = '1px solid #00796b';
selectedTextBox.style.borderRadius = '4px';
selectedTextBox.style.padding = '5px';
selectedTextBox.style.marginBottom = '10px';
selectedTextBox.style.fontSize = '14px';
selectedTextBox.style.maxWidth = '300px';
selectedTextBox.style.overflowWrap = 'break-word';
popup.appendChild(selectedTextBox);

const responseTextBox = document.createElement('div');
responseTextBox.id = 'responseTextBox';
responseTextBox.style.backgroundColor = '#e8f5e9';
responseTextBox.style.border = '1px solid #388e3c';
responseTextBox.style.borderRadius = '4px';
responseTextBox.style.padding = '5px';
responseTextBox.style.fontSize = '14px';
responseTextBox.style.maxWidth = '300px';
responseTextBox.style.overflowWrap = 'break-word';
popup.appendChild(responseTextBox);

// Function to send the selected text to the backend
async function sendToBackend(selectedText) {
    try {
        const wordResponse = await fetch(`https://localhost:7272/api/popup/getWord/${encodeURIComponent(selectedText)}`);
        if (!wordResponse.ok) {
            throw new Error(`Failed to get word: ${wordResponse.statusText}`);
        }
        const wordData = await wordResponse.json();
        console.log(wordData.Message);

        const explanationResponse = await fetch(`https://localhost:7272/api/popup/sendToOpenAI`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(selectedText)
        });
        if (!explanationResponse.ok) {
            throw new Error(`Failed to get explanation: ${explanationResponse.statusText}`);
        }
        const explanationData = await explanationResponse.json();
        return explanationData.Message;
    } catch (error) {
        console.error('Error fetching data:', error);
        return 'Error fetching data';
    }
}

// Function to display the popup
function showPopup(event) {
    popup.style.display = 'block';
    popup.style.left = `${event.pageX + 10}px`;
    popup.style.top = `${event.pageY + 10}px`;
}

// Function to hide the popup
function hidePopup() {
    popup.style.display = 'none';
}

// Track text selection
document.addEventListener('mouseup', async function (event) {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText) {
        try {
            selectedTextBox.innerText = `Selected Text: "${selectedText}"`;

            const explanation = await sendToBackend(selectedText);
            responseTextBox.innerText = `Explanation: ${explanation}`;

            showPopup(event);

            // Track selection changes to hide the popup when text is deselected
            const onSelectionChange = function () {
                if (window.getSelection().toString().trim() === "") {
                    hidePopup();
                    document.removeEventListener('selectionchange', onSelectionChange);
                }
            };
            document.addEventListener('selectionchange', onSelectionChange);
        } catch (error) {
            console.error('Error:', error);
            responseTextBox.innerText = 'Error fetching explanation';
            showPopup(event);
        }
    } else {
        hidePopup();
    }
});

// Hide the popup when clicking outside of the popup
document.addEventListener('click', function (event) {
    if (!popup.contains(event.target) && window.getSelection().toString().trim() === "") {
        hidePopup();
    }
});
