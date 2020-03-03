---
title: "New Website"
categories:
  - General
tags:
  - website
  - jekyll
---

After several months of putting it off, I have finally retired my old website
and replaced it with a shiny new one. And it was about time. I created the old
website when I started my PhD at the Max Planck Institute for Software Systems,
which was in September 2012. Having in mind how fast things change on the
Internet, a face-lift after more than seven years seemed to be long overdue.

Not that I was unhappy with the old website. I liked it a lot! I was proud of
its minimalist design, gray headings combined with light-blue
hyperlinks&mdash;a
combination of colors I find aesthetically very pleasing&mdash;and its minimal
content contained within a single page. I thought it looked elegant, and I was
not alone: at least ten people both at the MPI-SWS and Penn liked it enough to
use it as a template for their own personal web pages.

{% capture old_website %}
![Screenshot of the old website]({{ "/assets/images/old-website.png" | relative_url }})
{% endcapture %}

<figure>
  {{ old_website | markdownify | remove: "<p>" | remove: "</p>" }}
  <figcaption>Screenshot of the old website</figcaption>
</figure>

Nevertheless, the website had its shortcomings. For one,
it wasn't mobile-friendly. At the time it was created,
smartphones were not so ubiquitous, and I was completely unaware
of concepts like mobile-first design. But one can certainly live with their
page being rendered poorly on mobile. More importantly, I've always wanted
to have a blog, and integrating one with the old website would have required
effort which over the years I was less and less inclined to expend.

The new website has a blog (you're reading the first post! :open_mouth:),
and it looks great on screens big and small. It is statically generated
using [Jekyll](https://jekyllrb.com/), and it is
hosted on [GitHub Pages](https://pages.github.com/). I decided to go with
a statically generated site because I feel it's a solution perfectly suited
for a personal website with a blog: it is simple, secure, and there's no
overhead of running a server with a database. Out of several static generators,
I chose Jekyll mainly because of its maturity, large user base, well-written
documentation, and shareable themes. As a bonus, Jekyll is natively supported
by GitHub Pages, so publishing a blog post is as simple as writing a
Markdown-formatted file and pushing it to my GitHub repository.

Choosing a theme for the website was not so simple. I went through
hundreds of Jekyll themes available
online in search for a clean, elegant design; a theme that would be well-suited
for an academic that needs to put forward a short summary of their research
and a list of publications. At the end I chose [Minimal Mistakes](https://mademistakes.com/work/minimal-mistakes-jekyll-theme/),
a theme created by [Michael Rose](https://mademistakes.com/). There is also a
theme called [Academicpages](https://github.com/academicpages/academicpages.github.io),
which is based on Minimal Mistakes and geared towards academics, but I felt
it was a bit too extreme in trying to make every aspect (publications, talks,
  teaching materials) data-driven and generated from data files.
Maybe I'll regret this decision once my number of publications reaches 100. :thinking:

A paragraph about comments

What am I going to blog about?
