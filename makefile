SHELL := /bin/bash
PATH  := node_modules/.bin:$(PATH)
SRC   := src/xaja.es
JS    := dist/xaja.js
MIN   := dist/xaja.min.js
SPEC  := spec/test.es
TESTS := dist/test.spec.js

$(JS): $(SRC)
	@mkdir -p $(@D)
	babel $< -o $@

$(MIN): $(JS)
	@mkdir -p $(@D)
	uglifyjs -cmo $@ $<

$(TESTS): $(SPEC)
	@mkdir -p $(@D)
	babel $< -o $@

install:
	npm install

update:
	npm update

uninstall:
	rm -rf node_modules

clean:
	rm -rf dist

build: $(MIN) $(TESTS)

serve:
	node spec/server.js

.PHONY: install update uninstall clean build serve
