import argparse
import random


# Load a list from a local file
def load_list_from_file(file_path):
    try:
        with open(file_path, "r") as file:
            items = [line.strip() for line in file if line.strip()]
        # print(f"Loaded {len(items)} items from {file_path}")
        return items
    except FileNotFoundError:
        print(f"Error: {file_path} not found.")
        return []


# Get a random item from a list
def get_random_item(lst):
    return random.choice(lst)


# Generate a random symbol
def random_symbol():
    symbols = "!@#$%^&*()/.,-_]["
    return get_random_item(symbols)


# Generate a random number
def random_number():
    return str(random.randint(0, 9))


# Choose a random separator based on type
def random_separator(separator_type):
    if separator_type == "number":
        return random_number()
    elif separator_type == "symbol":
        return get_random_item([random_number(), random_symbol()])
    else:
        return separator_type


# Add a random suffix to intentionally misspell a word
def add_random_suffix(word, suffixes):
    if len(word) >= 3 and suffixes:
        return word + get_random_item(suffixes)
    return word


# Generate the password based on user settings
def generate_password(
    word_list,
    suffix_list,
    word_count=5,
    separator_type="symbol",
    capitalize=True,
    full_words=True,
):
    if not word_list:
        print("Error: Word list is empty.")
        return ""

    # Filter out words with fewer than 3 characters
    valid_words = [word for word in word_list if len(word) >= 3]

    if len(valid_words) < word_count:
        print("Error: Not enough valid words to generate the password.")
        return ""

    words = []
    for _ in range(word_count):
        word = get_random_item(valid_words)
        if not full_words:
            word = word[:4]
        words.append(word)

    # Intentionally misspell one word only if full_words is True
    if full_words and suffix_list:
        index_to_misspell = random.randint(0, len(words) - 1)
        words[index_to_misspell] = add_random_suffix(
            words[index_to_misspell], suffix_list
        )

    # Capitalize one word if required
    if capitalize:
        index_to_capitalize = random.randint(0, len(words) - 1)
        words[index_to_capitalize] = words[index_to_capitalize].upper()

    # Construct the password with separators
    password_parts = []
    for i in range(len(words)):
        password_parts.append(words[i])
        if i < len(words) - 1:
            password_parts.append(random_separator(separator_type))

    password = "".join(password_parts)

    print(f"Generated Password: {password}")
    return password


def main():
    # Set up argument parser
    parser = argparse.ArgumentParser(
        description="Generate a secure password using a list of words."
    )

    parser.add_argument(
        "-w",
        "--words",
        type=int,
        default=5,
        help="Specify the number of words in the password (default: 5).",
    )

    parser.add_argument(
        "-s",
        "--separator",
        type=str,
        default="symbol",
        choices=["symbol", "-", " ", ".", ",", "_", "number"],
        help='Choose the type of separator between words. Options are: "symbol", "-", " ", ".", ",", "_", "number" (default: "symbol").',
    )

    parser.add_argument(
        "-c",
        "--capitalize",
        action="store_false",
        default=True,
        help="Do not capitalize any of the words in the password.",
    )

    parser.add_argument(
        "-f",
        "--full-words",
        action="store_false",
        default=True,
        help="Use truncated words instead of full words.",
    )

    args = parser.parse_args()

    # Print settings for debugging purposes
    # print(f"Settings: {args}")

    # Load the word list from 'wordlist.txt'
    word_list = load_list_from_file("wordlist.txt")

    # Load the suffix list from 'suffix.txt'
    suffix_list = load_list_from_file("suffix.txt")

    # Generate a password with the given settings
    generate_password(
        word_list=word_list,
        suffix_list=suffix_list,
        word_count=args.words,
        separator_type=args.separator,
        capitalize=args.capitalize,
        full_words=args.full_words,
    )


if __name__ == "__main__":
    main()
