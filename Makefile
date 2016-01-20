BROWSERIFY = browserify
UGLIFY = node_modules/.bin/uglifyjs

test:
	node tests/provider-store-tests.js

run:
	wzrd app.js:index.js -- \
		-d

run-plain:
	python -m SimpleHTTPServer

build:
	$(BROWSERIFY) app.js | $(UGLIFY) -c -m -o index.js

pushall:
	git push origin master && git push origin gh-pages
