#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sat Sep  9 19:45:50 2017

@author: bill
"""

import urllib
import feedparser
import json
# Base api query url
base_url = 'http://export.arxiv.org/api/query?';
#jdata['paper'].update({'Author':'Bill'})
#print (jdata)
# Search parameters
search_query = 'q-bio' # search for electron in all fields
start = 0                     # retreive the first 5 results
max_results = 20

query = 'search_query=%s&start=%i&max_results=%i' % (search_query,
                                                     start,
                                                     max_results)

# Opensearch metadata such as totalResults, startIndex,
# and itemsPerPage live in the opensearch namespase.
# Some entry metadata lives in the arXiv namespace.
# This is a hack to expose both of these namespaces in
# feedparser v4.1
feedparser._FeedParserMixin.namespaces['http://a9.com/-/spec/opensearch/1.1/'] = 'opensearch'
feedparser._FeedParserMixin.namespaces['http://arxiv.org/schemas/atom'] = 'arxiv'
# perform a GET request using the base_url and query
response = urllib.urlopen(base_url+query).read()

# parse the response using feedparser
feed = feedparser.parse(response)

#initialize empty json set
jdata = {'paper': []}

# print out feed information
print 'Feed title: %s' % feed.feed.title
print 'Feed last updated: %s' % feed.feed.updated

# print opensearch metadata
print 'totalResults for this query: %s' % feed.feed.opensearch_totalresults
print 'itemsPerPage for this query: %s' % feed.feed.opensearch_itemsperpage
print 'startIndex for this query: %s'   % feed.feed.opensearch_startindex
# Run through each entry, and print out information
for entry in feed.entries:
    #intialize entry
    ent={}
    ent.update({'arxiv-id': entry.id.split('/abs/')[-1]})
    ent.update({'Published': entry.published})
    ent.update({'Title': entry.title.replace("\n" , "")})
    
    # feedparser v5.0.1 correctly handles multiple authors, print them all
    try:
        print 'Authors:  %s' % ', '.join(author.name for author in entry.authors)
        ent.update({"Authors" : author.name for author in entry.authors})
    except AttributeError:
        pass
    
    # Lets get all the categories
    all_categories = [t['term'] for t in entry.tags]
    print 'All Categories: %s' % (', ').join(all_categories)
    ent.update({'All_Categories' : [all_categories]})
    
    #abstract
    ent.update({'Abstract': entry.summary.replace("\n", " ")})
    
    #push into list of papers
    jdata['paper'].append(ent)
    
print(jdata)

#save output file
with open('outJSONdata.json', 'w') as outfile:  
    json.dump(jdata, outfile)

