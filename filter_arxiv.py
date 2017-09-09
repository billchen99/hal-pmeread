import urllib
import feedparser


#save the base URL for the arxiv API
base_url = 'http://export.arxiv.org/api/query?';

feedparser._FeedParserMixin.namespaces['http://a9.com/-/spec/opensearch/1.1/'] = 'opensearch'
feedparser._FeedParserMixin.namespaces['http://arxiv.org/schemas/atom'] = 'arxiv'

def get_info(search_query, max_results = 5, start = 0):
    summary_arr = []
    search_query = all + search_query

    query = 'search_query=%s&start=%i&max_results=%i' % (search_query,
                                                         start,
                                                         max_results)
    response = urllib.urlopen(base_url+query).read()
    feed = feedparser.parse(response)

    for entry in feed.entries:
        summary = entry.summary
        summary_arr.append(summary)

    return summary_arr;


#sample use of the function
print get_info("all:proton", max_results = 1);
