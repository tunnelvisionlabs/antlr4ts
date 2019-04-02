### Incremental parsing

#### Basics

We'll start by explaining how incremental parsing works for LL, then how we store that data. We are not going to talk about incremental _lexing_.

Let's start with LL(1) and ignore semantic predicates and other things. Fundamentally, the problem of incremental parsing is one of knowing what can change about how a given parser rule processes the tokens (and the resulting output parse tree) given a set of new/deleted/changed tokens. For LL(1), this turns out to be very easy. Given LL(1) can only look ahead one token, the only token changes that can even matter to a given parser rule (and the output parse tree) are changes to whatever the tokens the rule looked at last time, plus 1 token forward. If no tokens have changed in that [startToken, stopToken+1] bound, the rule cannot be affected (assuming it gets run). The referenced paper explains this in detail and shows how to make it work for LR parsers. Terrence also explains variants of the above in a few github issues where people have asked about incremental parsing.

ANTLR already tracks the token bounds of rules in the parse tree (startIndex/stopIndex). Thus, for LL(1) you don't even need extra information to do incremental parsing, you could simply use what exists.

#### Making it work for LL(1)

So how do we effect this incremental parsing for LL(1) in practice?

For our purposes, we need the list of token changes and the previous parse tree. We guard each parser rule with a check as to whether any of the changed tokens were in the bounds of the rule (including possible lookahead) during the last parse. If so, we re-run the rule and take its output. If not, we reuse the context the parse tree has from last time (later we'll cover fixing up the token data). We seek the token index to the stopIndex the rule had last time. This happens all the way down the rule tree as we parse top-down.

#### Making it work for LL(k)

Making the above work for LL(k) is just changing the 1 we add to the bounds, as it's still just a constant number. You can just add k to the bounds instead of 1.

#### Making it work for LL(\*)

LL(\*) unfortunately adds a little bit of trickiness because the lookahead can be infinite. To make this work correctly, we need to know how far the parser _actually did_ look the last time we ran it. To account for this, we need to adjust how the token stream works a little bit. Thankfully ANTLR is well modularized, and all lookahead/lookbehind goes through the token streams through a well defined interface. So we create an IncrementalTokenStream class, and keep the information we need there. The information we need is to have a stack of min/max token bounds in the token stream[1]. When the parser enters a rule it pushes the current token index as the min/max onto the minmax stack. The token stream updates the min/max bounds of the top of the minmax stack whenever lookahead/lookbehind is called. When the parser exits a rule, it pops the minmax stack,and sets the min/max information on the rule context. If there is a parent rule context, it unions the child interval into the parent (so that the parent ends up with a token range spanning the entire set of children). This accounts for the _actual_ lookahead or lookbehind performed during a parse.

[1] You can track it more exactly than this but it is highly unlikely to ever be worth it. The main issue this affects is changes to hidden tokens, which will cause reparsing even though the parser can't see them.

#### Adaptive parsing, SLL, etc

None of these change anything because they also go through the proper lookahead/lookbehind interfaces. At worst, they look at too much context and we reparse a little more than we should.

#### Predicates

Predicates that do lookahead or lookbehind are covered by the LL(\*) method with no additional work.  
Past that, hopefully the bounds are somewhat obvious: Predicates that are idempotent and don't depend on context forward of a given rule/lookahead, work fine.
Others cannot be supported (and their failure can't easily be detected).

#### Actions, parse listeners, etc

Parse listeners attached directly to Parsers will not see rules that are skipped. This is fixable (but unclear if it is worth it). Actions that occur during skipped rules will not occur.
Once the tree is generated it is no different than any other tree.

#### Tree fixup

ANTLR tracks start/end position, line info, source stream info, in tokens, so when the parse tree pieces are reused, all of that may be wrong because they point to old tokens. The text in the parse tree will actually be right (by definition, otherwise the incremental parser is broken). Currently, we pass through the tree and replace old tokens to point to new ones. This is because updating the old token offsets/source/inputstream/etc turns out to be quite difficult (ANTLR is designed for the tokens to be immutable). The downside is that we have to retrieve the new tokens from the new lexer.
Tree fixup is actually the most expensive part of the parser data right now, and for those who only care about text being correct, it is a waste of time.

#### Outstanding issues

- The (rule, startindex) map stuff can be avoided if we really want (though it's tricky and involves trying to walk the old parse tree as we build the new one).
- The way the incremental grammar option is parsed/used in the stg file should obviously be moved to antlr4 core.
- There is code that could be cleaned up if we included an IntervalMap datastructure (or at least a NonOverlappingIntervalList. IntervalSet does not do what we need). To ensure i did not add dependencies, i didn't do this, but it will likely be worth it in the future.
- We currently eagerly fixup the old parse tree in IncrementalParserData, etc. We may want to be lazier and just do it in the parser when the context gets reused instead.
- Currently recursion rule contexts will not be reused (the code is still being debugged)

#### References

"Efficient and Flexible Incremental Parsing" by Tim Wagner and Susan Graham
