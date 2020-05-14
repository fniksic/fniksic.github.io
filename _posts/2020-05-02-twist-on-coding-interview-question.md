---
title: "A Twist on a Coding Interview Question"
categories:
  - Coding Interview
tags:
  - amortized time complexity
  - combinatorics
---

With my postdoctoral appointment at the University of Pennsylvania coming to
an end this summer, I'm in the process of finding a new job. And even though
this wasn't my first choice when I started the postdoc a year and a half ago,
I ended up applying for software engineering positions at big tech
companies. What this means is that I'm facing a scary obstacle&mdash;the
notorious coding interviews.

To increase my chance of success, or at least to comfort myself that I'm
actually doing something to prepare for these interviews, I acquired the
obligatory book, [Cracking the Coding Interview](http://www.crackingthecodinginterview.com/). As I was reading the chapter
about the big O notation, one of the sample problems caught my attention.
The problem is to analyze the time complexity of the following code that
prints out all strings of length $$k$$ consisting of the lower-case
letters a&ndash;z in increasing order. (Hopefully I'm not doing a serious
copyright infringement by showing the code here).

~~~ java
void printSortedStrings(int k) {
  printSortedStrings(k, "");
}

void printSortedStrings(int k, String prefix) {
  if (k == 0) {
    if (IsInOrder(prefix)) {
      System.out.println(prefix);
    }
  } else {
    for (char c = 'a'; c <= 'z'; c++) {
      printSortedStrings(k - 1, prefix + c);
    }
  }
}

boolean IsInOrder(String s) {
  boolean isInOrder = true;
  for (int i = 1; i < s.length(); i++) {
    int prev = s.charAt(i - 1);
    int curr = s.charAt(i);
    if (prev > curr) {
      isInOrder = false;
    }
  }
  return isInOrder;
}
~~~

If we write $$n$$ for the number of letters in the alphabet, then
the time complexity is clearly $$O(k n^k)$$: the code generates all $$n^k$$
possible strings, and for each of them calls the function `IsInOrder`,
which runs in time $$O(k)$$.

The bit about this problem that's interesting to me is
that the function `IsInOrder` can be
trivially improved by exiting the for loop (and the function)
as soon as we find that the string is not in order:

~~~ java
boolean IsInOrder(String s) {
  for (int i = 1; i < s.length(); i++) {
    int prev = s.charAt(i - 1);
    int curr = s.charAt(i);
    if (prev > curr) {
      return false;
    }
  }
  return true;
}
~~~

But what is the effect of this improvement on the overall run time of the
code? Clearly we gain something, but does it improve the asymptotic time
complexity?

To answer this question, we need to analyze the _amortized_ run time
of the improved `IsInOrder`.
That is, instead of analyzing a call to `IsInOrder` in isolation and deriving
a pessimistic bound of $$O(k)$$, let's consider how much time it takes to
execute all calls to `IsInOrder` and note that for some strings the
function will exit much sooner than for the other. In particular, the
function will go through the first step of the loop (`i=1`) for all strings,
but it will go through the second step (`i=2`) only for strings with the
first two positions in order, and it will go through the last step (`i=k-1`)
only for strings with the first $$k-1$$ positions in order.

How many strings are there with the first $$j$$ positions in order, for
$$1\leq j \leq k$$? Calculating this requires knowing a bit of combinatorics.
Without going into details, the number of such strings is

$$n^{k-j} {n+j-1 \choose j}$$

Hence, the total run time of the code can be expressed as

$$T(n, k) := \sum_{1\leq j<k} n^{k-j} {n+j-1 \choose j}$$

and by factoring out $$n^k$$, we get the amortized run time of `IsInOrder`
expressed as

$$S(n, k) := \sum_{1\leq j<k} n^{-j} {n+j-1 \choose j}$$

The sum may look scary at first, but there's a way to deal with it.
We can note experimentally that for a fixed value of $$n$$, say $$n=26$$,
the sum seems to converge to a constant as we increase $$k$$. Check it out
on [Wolfram Alpha](https://www.wolframalpha.com/input/?i=N%5BSum%5B26%5E%7B-j%7D+Binomial%5B26%2Bj-1%2C+j%5D%2C+%7Bj%2C+1%2C+100%7D%5D%2C+5%5D)!
As you change the upper bound of the sum from 100 to 1,000 and more, the
value stays fixed at 1.7725. Now go ahead and check the value of [$$\sqrt{\pi}$$](https://www.wolframalpha.com/input/?i=N[Sqrt[Pi]%2C+5]).
It is 1.7725 as well! Have we experimentally stumbled on a surprising
identity $$\lim_{k\to\infty} S(26,k)=\sqrt{\pi}$$? Well... no. This
turns out to be just a coincidence. I've deliberately rounded both
numbers to 5 digits. As soon as you increase the rounding to 6 digits,
you'll see a difference.

Anyway, although $$S(26, k)$$ doesn't converge to $$\sqrt{\pi}$$,
it does seem to converge to a constant. To show this for arbitrary $$n$$,
since $$S(n,k)$$ increases as we increase $$k$$, it suffices to show that
$$S(n,k)$$ is upper-bounded by a constant. And to show the latter,
we can somewhat counterintuitively relax the sum by adding infinitely many additional terms.

$$
\begin{align*}
  S(n,k) &\leq \sum_{j\geq 1} n^{-j} {n+j-1 \choose j} \\
  S(n,k) + 1 &\leq \sum_{j\geq 0} n^{-j} {n+j-1 \choose j}
\end{align*}
$$

By the [ratio test](https://en.wikipedia.org/wiki/Ratio_test), the
latter series
converges for $$n>1$$. And to find out what it converges to, we can
use the identity

$${n+j-1 \choose j} = (-1)^j {-n \choose j}$$

to recognize the series as a [binomial series](https://en.wikipedia.org/wiki/Binomial_series).

$$
\begin{align*}
  \sum_{j\geq 0} n^{-j} {n+j-1 \choose j}
  &= \sum_{j\geq 0} (-1/n)^{j} {-n \choose j} \\
  &= (1-1/n)^{-n}
\end{align*}
$$

Plugging the result back to the above "relaxation," we get

$$S(n,k) \leq (1-1/n)^{-n} - 1$$

The expression $$(1-1/n)^{-n}$$ is interesting. For $$n=2$$,
it evaluates to 4, and it decreases as we increase $$n$$
(in fact, it converges to $$e$$).
Hence, $$S(n, k)\leq 3$$, which means that instead of $$O(k)$$, the
improved function `IsInOrder` runs in __constant__ amortized time.
Let's try to appreciate what this means: no matter how long the strings
are, on average the loop in the improved `IsInOrder` takes at most 3 steps.
Even better, on average, the loop takes at most $$(1-1/n)^{-n} - 1$$
steps, which is 1.7725 (almost $$\sqrt{\pi}$$) for the English alphabet ($$n=26$$).
And overall, instead of $$O(kn^k)$$, the run time of the improved code is
$$O(n^k)$$.

{% include mathjax %}
