let wordList = [];
let suffixList = [];

// Load word list from a local file
async function loadWordList() {
  try {
    const response = await fetch("wordlist.txt");
    if (!response.ok) {
      throw new Error("Failed to fetch word list");
    }
    const text = await response.text();
    wordList = text
      .split("\n")
      .map((word) => word.trim())
      .filter((word) => word.length > 2); // Ensure words are at least 3 characters
  } catch (error) {
    console.error("Error loading word list:", error);
  }
}

// Load suffix list from a local file
async function loadSuffixList() {
  try {
    const response = await fetch("suffix.txt");
    if (!response.ok) {
      throw new Error("Failed to fetch suffix list");
    }
    const text = await response.text();
    suffixList = text
      .split("\n")
      .map((suffix) => suffix.trim())
      .filter((suffix) => suffix.length > 0); // Ensure non-empty suffixes
  } catch (error) {
    console.error("Error loading suffix list:", error);
  }
}

loadWordList();
loadSuffixList();

function updateWordCount(value) {
  document.getElementById("wordCountDisplay").innerText = value;
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomSymbol() {
  const symbols = "!@#$%^&*()/.,-_][";
  return getRandomItem(symbols.split(""));
}

function randomNumber() {
  return Math.floor(Math.random() * 10);
}

function randomSeparator(separatorType, includeNumber, includeSymbol) {
  if (separatorType === "number") {
    return randomNumber().toString();
  } else if (separatorType === "symbol") {
    // Ensure at least one number and one symbol
    if (!includeNumber && !includeSymbol) {
      return Math.random() < 0.5 ? randomNumber().toString() : randomSymbol();
    } else if (!includeNumber) {
      return randomNumber().toString();
    } else if (!includeSymbol) {
      return randomSymbol();
    } else {
      return Math.random() < 0.5 ? randomNumber().toString() : randomSymbol();
    }
  } else {
    return separatorType;
  }
}

function addRandomSuffix(word) {
  if (suffixList.length === 0) {
    console.error("Suffix list is empty.");
    return word;
  }

  const randomSuffix = getRandomItem(suffixList);
  return word + randomSuffix;
}

function generatePassword() {
  const wordCount = parseInt(document.getElementById("wordCount").value);
  const separatorType = document.getElementById("separator").value;
  const capitalize = document.getElementById("capitalize").checked;
  const fullWords = document.getElementById("fullWords").checked;
  
  document.getElementById('copiedMessage').style.display = 'none';

  let words = [];
  for (let i = 0; i < wordCount; i++) {
    let word = getRandomItem(wordList);

    // Truncate the word if fullWords is false
    if (!fullWords) {
      word = word.slice(0, 4);
    }

    words.push(word);
  }

  // Intentionally misspell one word by adding a random suffix, only if fullWords is true
  if (fullWords && words.length > 0) {
    const indexToMisspell = Math.floor(Math.random() * words.length);
    words[indexToMisspell] = addRandomSuffix(words[indexToMisspell]);
  }

  // Capitalize one word if required
  if (capitalize && words.length > 0) {
    const indexToCapitalize = Math.floor(Math.random() * words.length);
    words[indexToCapitalize] = words[indexToCapitalize].toUpperCase();
  }

  let passwordPartsHtml = [];
  let passwordPartsText = [];

  let includeNumber = false;
  let includeSymbol = false;

  for (let i = 0; i < words.length; i++) {
    passwordPartsHtml.push(words[i]);
    passwordPartsText.push(words[i]);

    if (i < words.length - 1) {
      const separator = randomSeparator(separatorType, includeNumber, includeSymbol);

      // Update flags based on separator type
      if (!isNaN(separator)) includeNumber = true;
      else includeSymbol = true;

      passwordPartsHtml.push(
        `<span class='${
          isNaN(separator) ? "symbol" : "number"
        }'>${separator}</span>`
      );
      passwordPartsText.push(separator);
    }
  }

   // Ensure at least one number and one symbol are included
   if (separatorType === "symbol" && (!includeNumber || !includeSymbol)) {
     const lastSeparatorIndexHtml =
       passwordPartsHtml.length - (words.length - passwordPartsText.length);
     const lastSeparatorIndexText =
       passwordPartsText.length - (words.length - passwordPartsText.length);

     const missingSeparator =
       !includeNumber ? randomNumber().toString() : randomSymbol();

     passwordPartsHtml[lastSeparatorIndexHtml] =
       `<span class='${
         isNaN(missingSeparator) ? "symbol" : "number"
       }'>${missingSeparator}</span>`;
     passwordPartsText[lastSeparatorIndexText] =
       missingSeparator;
   }

   const passwordHtml = passwordPartsHtml.join("");
   const passwordText = passwordPartsText.join("");

   document.getElementById('password').innerHTML = passwordHtml;

   const characterCount = document.getElementById('characterCount');
   characterCount.innerText = passwordText.length;

   const characterCountDisplay =
     document.getElementById('characterCountDisplay');
   characterCountDisplay.style.display = 'inline';

   // Show the copy button after generating the password
   const copyButton =
     document.getElementById("copyButton");
   copyButton.style.display =
     "inline-block";

   // Add event listener for copy button
   copyButton.onclick =
     () => {
       if (navigator.clipboard?.writeText) {
         navigator.clipboard.writeText(passwordText).then(() => {
           showCopiedMessage();
         }).catch((err) => {
           console.error('Failed to copy text: ', err);
           fallbackCopyTextToClipboard(passwordText);
         });
       } else {
         fallbackCopyTextToClipboard(passwordText);
       }
     };
}

// Fallback function for copying text using execCommand
function fallbackCopyTextToClipboard(text) {
   const textarea =
     document.createElement('textarea');
   textarea.value =
     text;
   textarea.style.position =
     'fixed'; // Prevent scrolling to bottom of page in MS Edge.
   document.body.appendChild(textarea);
   textarea.focus();
   textarea.select();
   try {
     document.execCommand('copy');
     showCopiedMessage();
   } catch (err) {
     console.error('Fallback: Oops, unable to copy', err);
   }
   document.body.removeChild(textarea);
}

function showCopiedMessage() {
   const copiedMessage =
     document.getElementById('copiedMessage');
   copiedMessage.style.display =
     'inline';
   setTimeout(() => {
     copiedMessage.style.display =
       'none';
   },2000); // Hide after2 seconds
}