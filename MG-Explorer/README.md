# MG-Explorer 

## Context

This project was initially created and developed by one of M.Winckler's student for a thesis
on the incremental search for information. It's now used to increase the comprehension of coauthors work.

In our case, we collect data about authors and co-authors from **dlpb** (https://dblp.uni-trier.de/)
and from **HAL RDF** (https://hal.archives-ouvertes.fr/).

## Run the project

You need to open via your localhost or your Webstorm the file `inf-UFRGS-MGExplorer.html`.

Or you can run the command `npm install -g http-server` in your terminal, at the root
of the project.

Then, you just need to run `http-server`, it will display you three addresses, choose one
and add `/inf-UFRGS-MGExplorer.html` in the url.


## Content

Five visualization techniques are developped in MG-Explorer :

- Node Edge, which represents the network of coauthors and their link depending on the file data ;
- Iris, which you can access by right-clicking on a node in the previous technique (it will be the same for the next ones).
This technique is about all the co-authors of one author (preselected) and their work shared with him. You'll visualize
for every author, how many publications, journals, books and proceedings they have written with him.
- Cluster Vis, is almost the same but it's about the cluster of the author selected before hand and the clusters existing 
inside this cluster. It also shows for each member of the cluster, its number of publications, journals, books and proceedings.
- Glyph Matrix is a two-entries table of selected author's cluster where when two authors have done work together there is
something at the intersection of their name. If you place your mouse over it, it will show you the quantity of work, again
by publications, journals, books and proceedings.
- Papers' List, only accessible if you select "Open Data HAL" in the select element of your page. As its name
says so, it's about displaying the list of an author's work, or the collaboration of two authors (if you click on the bar in
Iris, or on a edge in Node Edge), or the collaboration of a cluster (if you click on an author in Cluster Vis).

