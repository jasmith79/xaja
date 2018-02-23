SHELL := /bin/bash
PATH  := node_modules/.bin:$(PATH)
SRC   := src/xaja.js
JS    := dist/xaja.js
ES5   := dist/xaja.es5.js
MIN   := dist/xaja.min.js
MIN5  := dist/xaja.es5.min.js

$(JS): $(SRC)
	@mkdir -p $(@D)
	cat $< | sed "s#\.\./node_modules#../../../node_modules#" > $@

$(MIN): $(JS)
	@mkdir -p $(@D)
	cat $< | minify > $@

$(ES5): $(JS)
	@mkdir -p $(@D)
	babel $< -o $@

$(MIN5): $(ES5)
	@mkdir -p $(@D)
	cat $< | minify > $@

install:
	npm install

update:
	npm update

uninstall:
	rm -rf node_modules

clean:
	rm -rf dist

all: $(MIN) $(MIN5)

serve:
	node spec/server.js

.PHONY: install update uninstall clean build serve
