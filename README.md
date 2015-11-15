wikiblocks-search
=====================

WikiBlocks is a Chrome Extension designed to augment Wikipedia pages related to a science, technology, engineering, or math concepts. The extension performs a search for relevant [blocks](http://bl.ocks.org) based on the title, See also, categories, and other information contained in the article when a user navigates to a Wikipedia article.

An example the sort of article that the extension will find good results for is [L-system](https://en.wikipedia.org/wiki/L-system).

This repository contains code related to the server(s) which facilitate searching for gists in our ever-growing database. This code constitutes the "backend" for the WikiBlocks chrome extension, which includes:

- management of postgres connections and client-pooling
- modest natural language processing related to extraction of tokens from "hooks": "Prim's Algorithm" becomes ["prim", "algorithm"]
- functions for the search-pipeline
  - iterative search
  - ranking and sorting results
- unit testing
- server load-testing
- deployment-specific information


---

* [About](#about)
* [Deployment](#deployment)
* [Testing](#testing)
* [Load Testing](#Load-Testing)

---


#About

This project was initially conceived by Brooks Mershon for the course **Introduction to Database Systems (CS 316)** taken at Duke University during the Fall of 2015.

#Testing

TODO: include unit tests related to the search pipeline and tokenization process.


#Deployment

Currently, all testing (including load-testing) is being done on local machines, or local machines that have been exposed through localtunnel to the outside world.

There are several choices under consideration for deployment of an express.js server:

- **EC2 instance managed with Vagrant**
- Elastic Beanstalk
- Heroku


#Load-Testing

To send a batch of 5,000 requests for the sort of page object typically sent from the Chrome Extension:

```js
{
  "title": "Prim's algorithm",
  "aliases": [
    "Prim's algorithm"
  ],
  "see_also": [
    "Dijkstra's algorithm",
    "shortest path problem"
  ],
  "categories": [
    "Graph algorithms",
    "Spanning tree"
  ]
}
```

Use the following ApacheBenchmark command:

```bash
ab -p test/data/test_1.json -T application/json -c 100 -n 5000 <address>/<endpoint>
```

If you are testing locally with localhost or even localtunnel to expose your localhost to the outside world, you might use something like:

`http://127.0.0.1:8081/search` as a POST endpoint.
*OR*
`http://cf1fcac0.ngrok.io/search`

To test with a longer timeout , use `-s <seconds>`:

```bash
ab -p test/data/test_1.json -T application/json -c 100 -n 5000 -s 5000 http://cf1fcac0.ngrok.io/search
```


