To locally start the webserver, you can use:
```
./run.sh
```
or type out the actual command:
```
python3 -m http.server 8000
```
You must start a webserver at a mimimum in order to load the `*.txt` files.

If you don't want to use the web interface, there's an optional python version that operates in a similar fashion:
```
python3 passgen.py
```

It is strongly encouraged that you use your own dictionary file (`wordlist.txt`), and not any publicly available one.  I'm providing a few only as examples.

See it in action (but please don't solely use this, create your own `wordlist.txt` and `suffix.txt` files.): https://password-gen-vnub.onrender.com/

Inspired by:
- 1password's "memorable" password generator
- [Word Based Password Generator](http://www.egansoft.com/password/index.php) by Nicholas Egan
- xkcd #936, [Password Strength](https://xkcd.com/936/)