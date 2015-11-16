wikiblocks-search
=====================

WikiBlocks is a Chrome Extension designed to augment Wikipedia pages related to a science, technology, engineering, or math concepts. The extension performs a search for relevant [blocks](http://bl.ocks.org) based on the title, See also, categories, and other information contained in the article when a user navigates to a Wikipedia article.

Check out the [chrome extension](https://github.com/wikiblocks/wikiblocks-chrome) for more information about the client-side applications of this project.

An example of the type of concepts that the extension will find good results for is [L-system](https://en.wikipedia.org/wiki/L-system), or Lindenmayer systems. Such a topic can be illustrated by specific visual representations, such as programatically drawn Hilbert Curves.

This repository contains code related to the server(s) which facilitate searching for blocks that might help users visualize STEM concepts discussed in a Wikipedi article. The database that the server queries grows as both as new users and their examples are discovered, as well as when client-side interactions promt other servers to associate with a gist new tags and new categories.

The responsibilities of the code contained in this respository include:

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
* [Load Testing](#load-testing)

---

#About

This project was initially conceived by Brooks Mershon for the course **Introduction to Database Systems (CS 316)** taken at Duke University during the Fall of 2015.

#Testing

TODO: include unit tests related to the search pipeline and tokenization process.

#Deployment

Currently, Elastic Beanstalk seems to work. ngninx provides gateway from wikiblocks<version>.elasticbeanstalk.com to the Express.js app listening on port 3000.

Elastic Beanstalk appears to monitor the node process (http server) and restart if something goes wrong.

This server communicates with a PostgreSQL Amazon RDS instance.

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

To test with a longer timeout , use `-s <seconds>`.

For example:

```bash
ab -p test/data/test_1.json -T application/json -c 185 -n 10000 -s 5000 http://wikiblocksalpha.elasticbeanstalk.com/search
```