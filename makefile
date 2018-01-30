SHELL := /bin/bash
PATH  := node_modules/.bin:$(PATH)
SRC   := src/xaja.mjs
JS    := dist/xaja.js
MIN   := dist/xaja.min.js

$(JS): $(SRC)
	@mkdir -p $(@D)
	babel $< -o $@

$(MIN): $(JS)
	@mkdir -p $(@D)
	minify $< > $@

install:
	npm install

update:
	npm update

uninstall:
	rm -rf node_modules

clean:
	rm -rf dist

all: $(MIN)

serve:
	node spec/server.js

.PHONY: install update uninstall clean build serve
