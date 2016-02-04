# godoc

An [Atom](https://atom.io) package for the Go language that shows documentation
for identifiers in source code.

![Screenshot](https://www.dropbox.com/s/0f9o08p4j7yod58/godoc.PNG?raw=1)

## Prerequisites

This package uses the [`gogetdoc`](https://github.com/zmb3/gogetdoc) tool to
find documentation.  This tool **requires Go 1.6**, which is currently available
by building tip or installing the 1.6 release candidate from https://golang.org/dl/.

Once you've installed Go 1.6, simply `go get github.com/zmb3/gogetdoc` and make
sure `$GOPATH/bin` is on your `$PATH`.

## Usage

Place the cursor over the identifier to get documentation for, and press <kbd>Alt</kbd> + <kbd>D</kbd>.

To close the documentation window, press <kbd>esc</kbd>
