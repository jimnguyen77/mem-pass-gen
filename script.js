let wordList = [];
let suffixList = [];

// Load a list from a local file
async function loadList(filePath) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`Failed to fetch ${filePath}`);
    const text = await response.text();
    return text.split("\n").map(item => item.trim()).filter(item => item.length > 2);
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error);
    return [];
  }
}

// Initialize word and suffix lists
async function initializeLists() {
  [wordList, suffixList] = await Promise.all([
    loadList("wordlist.txt"),
    loadList("suffix.txt")
  ]);
}

initializeLists();

function updateWordCount(value) {
  document.getElementById("wordCountDisplay").innerText = value;
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomSymbol() {
  const symbols = "!@#$%^&*()/.,-_][:=+~><}{?";
  return getRandomItem(symbols.split(""));
}

function randomNumber() {
  return Math.floor(Math.random() * 10).toString();
}

function randomSeparator(separatorType, includeNumber, includeSymbol) {
  if (separatorType === "number") {
    return randomNumber();
  } else if (separatorType === "symbol") {
    if (!includeNumber && !includeSymbol) {
      return Math.random() < 0.5 ? randomNumber() : randomSymbol();
    }
    return !includeNumber ? randomNumber() : !includeSymbol ? randomSymbol() : Math.random() < 0.5 ? randomNumber() : randomSymbol();
  }
  return separatorType;
}

function addRandomSuffix(word) {
  if (!suffixList.length) {
    console.error("Suffix list is empty.");
    return word;
  }
  return word + getRandomItem(suffixList);
}

function generatePassword() {
  const wordCount = parseInt(document.getElementById("wordCount").value);
  const separatorType = document.getElementById("separator").value;
  const capitalize = document.getElementById("capitalize").checked;
  const fullWords = document.getElementById("fullWords").checked;

  document.getElementById('copiedMessage').style.display = 'none';

  const words = Array.from({ length: wordCount }, () => {
    let word = getRandomItem(wordList);
    return fullWords ? word : word.slice(0, 4);
  });

  if (fullWords && words.length > 0) {
    const indexToMisspell = Math.floor(Math.random() * words.length);
    words[indexToMisspell] = addRandomSuffix(words[indexToMisspell]);
  }

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

      if (!isNaN(separator)) includeNumber = true;
      else includeSymbol = true;

      passwordPartsHtml.push(`<span class='${isNaN(separator) ? "symbol" : "number"}'>${separator}</span>`);
      passwordPartsText.push(separator);
    }
  }

   if (separatorType === "symbol" && (!includeNumber || !includeSymbol)) {
     const lastSeparatorIndexHtml =
       passwordPartsHtml.length - (words.length - passwordPartsText.length);
     const lastSeparatorIndexText =
       passwordPartsText.length - (words.length - passwordPartsText.length);

     const missingSeparator =
       !includeNumber ? randomNumber() : randomSymbol();

     passwordPartsHtml[lastSeparatorIndexHtml] =
       `<span class='${isNaN(missingSeparator) ? "symbol" : "number"}'>${missingSeparator}</span>`;
     passwordPartsText[lastSeparatorIndexText] =
       missingSeparator;
   }

   const passwordHtml = passwordPartsHtml.join("");
   const passwordText = passwordPartsText.join("");

   document.getElementById('password').innerHTML = passwordHtml;

   document.getElementById('characterCount').innerText = passwordText.length;
   document.getElementById('characterCountDisplay').style.display = 'inline';

   const copyButton = document.getElementById("copyButton");
   copyButton.style.display = "inline-block";

   copyButton.onclick =
     () => {
       if (navigator.clipboard?.writeText) {
         navigator.clipboard.writeText(passwordText).then(() => showCopiedMessage()).catch(err => fallbackCopyTextToClipboard(passwordText));
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
   setTimeout(() => copiedMessage.style.display = 'none',2000); // Hide after2 seconds
}