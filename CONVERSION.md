## Conversion progress

The following files are present in the optimized Java release. As the functionality of each file is implemented and
verified by two core contributors to the TypeScript target, it will be checked off. If a file is determined to not be
necessary for the TypeScript target, it will be ~~crossed out~~ and checked off.

Prior to checking off an item here, the source file(s) where the matching functionality is implemented in TypeScript
will need a comment indicating the names of the two contributors who verified that the conversion is complete and the
semantics of the original code have been preserved. When the conversion is complete, this file and the sign-off comments
in individual files can be removed and the antlr4 submodule commit will track the progress made on this code base.

* [x] ANTLRErrorListener.java
* [x] ANTLRErrorStrategy.java
* [x] ~~ANTLRFileStream.java~~ (Intentionally omitted)
* [x] ANTLRInputStream.java
  * [x] ~~ANTLRInputStream.constructor()~~ (Not needed after other APIs omitted)
  * [x] ~~ANTLRInputStream.constructor(char[], number)~~ (No equivalent TypeScript representation)
  * [x] ~~ANTLRInputStream.constructor(Reader)~~ (Intentionally omitted)
  * [x] ~~ANTLRInputStream.constructor(Reader, number)~~ (Intentionally omitted)
  * [x] ~~ANTLRInputStream.constructor(Reader, number, number)~~ (Intentionally omitted)
  * [x] ~~ANTLRInputStream.constructor(InputStream)~~ (Intentionally omitted)
  * [x] ~~ANTLRInputStream.constructor(InputStream, number)~~ (Intentionally omitted)
  * [x] ~~ANTLRInputStream.constructor(InputStream, number, number)~~ (Intentionally omitted)
  * [x] ~~ANTLRInputStream.load(Reader, number, number)~~ (Intentionally omitted)
* [x] BailErrorStrategy.java
* [x] BaseErrorListener.java
* [x] BufferedTokenStream.java
* [x] CharStream.java
* [x] CommonToken.java
* [x] CommonTokenFactory.java
* [x] CommonTokenStream.java
* [x] ConsoleErrorListener.java
* [x] DefaultErrorStrategy.java
* [x] Dependents.java
* [x] DiagnosticErrorListener.java
* [x] FailedPredicateException.java
* [x] InputMismatchException.java
* [x] InterpreterRuleContext.java
* [x] IntStream.java
* [x] Lexer.java
* [x] LexerInterpreter.java
* [x] LexerNoViableAltException.java
* [x] ListTokenSource.java
* [x] NoViableAltException.java
* [x] Parser.java
* [x] ParserErrorListener.java
* [x] ParserInterpreter.java
* [x] ParserRuleContext.java
* [x] ProxyErrorListener.java
* [x] ProxyParserErrorListener.java
* [x] RecognitionException.java
* [x] Recognizer.java
* [x] RuleContext.java
* [x] RuleContextWithAltNum.java
* [x] ~~RuleDependencies.java~~ (Not needed since TypeScript allows multiple decorators on one element)
* [x] RuleDependency.java
* [x] RuleVersion.java
* [x] Token.java
* [x] TokenFactory.java
* [x] TokenSource.java
* [x] TokenStream.java
* [ ] TokenStreamRewriter.java
* [ ] UnbufferedCharStream.java
* [ ] UnbufferedTokenStream.java
* [x] Vocabulary.java
* [x] VocabularyImpl.java
* [x] WritableToken.java
* [x] atn\AbstractPredicateTransition.java
* [x] atn\ActionTransition.java
* [x] atn\AmbiguityInfo.java
* [x] atn\ArrayPredictionContext.java
* [x] atn\ATN.java
  * [x] ~~`ATN.addState(undefined)`~~ (Use `addState(new InvalidState())` instead)
* [x] atn\ATNConfig.java
* [x] atn\ATNConfigSet.java
* [x] atn\ATNDeserializationOptions.java
* [x] atn\ATNDeserializer.java
* [ ] atn\ATNSerializer.java
* [x] atn\ATNSimulator.java
* [x] atn\ATNState.java
  * [x] atn\ATNStateType.ts
* [x] atn\ATNType.java
* [x] atn\AtomTransition.java
* [x] atn\BasicBlockStartState.java
* [x] atn\BasicState.java
* [x] atn\BlockEndState.java
* [x] atn\BlockStartState.java
* [x] atn\ConflictInfo.java
* [x] atn\ContextSensitivityInfo.java
* [x] atn\DecisionEventInfo.java
* [x] atn\DecisionInfo.java
* [x] atn\DecisionState.java
* [x] atn\EmptyPredictionContext.java
* [x] atn\EpsilonTransition.java
* [x] atn\ErrorInfo.java
* [x] atn\LexerAction.java
* [x] atn\LexerActionExecutor.java
* [x] atn\LexerActionType.java
* [x] atn\LexerATNSimulator.java
* [x] atn\LexerChannelAction.java
* [x] atn\LexerCustomAction.java
* [x] atn\LexerIndexedCustomAction.java
* [x] atn\LexerModeAction.java
* [x] atn\LexerMoreAction.java
* [x] atn\LexerPopModeAction.java
* [x] atn\LexerPushModeAction.java
* [x] atn\LexerSkipAction.java
* [x] atn\LexerTypeAction.java
* [x] atn\LL1Analyzer.java
* [x] atn\LookaheadEventInfo.java
* [x] atn\LoopEndState.java
* [x] atn\NotSetTransition.java
* [x] atn\OrderedATNConfigSet.java
* [x] atn\ParseInfo.java
* [x] atn\ParserATNSimulator.java
  * [ ] Ability to pass `undefined` as the `Parser` instance
* [x] atn\PlusBlockStartState.java
* [x] atn\PlusLoopbackState.java
* [x] atn\PrecedencePredicateTransition.java
* [x] atn\PredicateEvalInfo.java
* [x] atn\PredicateTransition.java
* [x] atn\PredictionContext.java
  * [x] PredictionContext.fromRuleContext
  * [x] ~~PredictionContext.toString~~ (Doesn't actually exist in the Java target)
  * [x] PredictionContext.toStrings
* [x] atn\PredictionContextCache.java
* [x] atn\PredictionMode.java
* [x] atn\ProfilingATNSimulator.java
* [x] atn\RangeTransition.java
* [x] atn\RuleStartState.java
* [x] atn\RuleStopState.java
* [x] atn\RuleTransition.java
* [x] atn\SemanticContext.java
* [x] atn\SetTransition.java
* [x] atn\SimulatorState.java
* [x] atn\SingletonPredictionContext.java
* [x] atn\StarBlockStartState.java
* [x] atn\StarLoopbackState.java
* [x] atn\StarLoopEntryState.java
* [x] atn\TokensStartState.java
* [x] atn\Transition.java
  * [x] atn\TransitionType.ts
  * [ ] Transition.serializationTypes?
* [x] atn\WildcardTransition.java
* [x] dfa\AbstractEdgeMap.java
* [x] dfa\AcceptStateInfo.java
* [x] dfa\ArrayEdgeMap.java
* [x] dfa\DFA.java
* [x] dfa\DFASerializer.java
* [x] dfa\DFAState.java
* [x] dfa\EdgeMap.java
* [x] dfa\EmptyEdgeMap.java
* [x] dfa\LexerDFASerializer.java
* [x] dfa\SingletonEdgeMap.java
* [x] dfa\SparseEdgeMap.java
* [x] ~~misc\AbstractEqualityComparator.java~~ (Unnecessary in TypeScript)
* [x] misc\Args.java
* [x] misc\Array2DHashSet.java
* [ ] misc\DoubleKeyMap.java
* [x] misc\EqualityComparator.java
* [ ] misc\FlexibleHashMap.java
* [x] ~~misc\Func0.java~~ (Unnecessary in TypeScript)
* [x] ~~misc\Func1.java~~ (Unnecessary in TypeScript)
* [x] misc\IntegerList.java
* [x] misc\IntegerStack.java
* [x] misc\Interval.java
* [x] misc\IntervalSet.java
* [x] misc\IntSet.java
* [ ] misc\LogManager.java
* [x] misc\MultiMap.java
* [x] misc\MurmurHash.java
* [x] misc\NotNull.java
* [x] misc\Nullable.java
* [ ] misc\NullUsageProcessor.java
* [x] misc\ObjectEqualityComparator.java
* [ ] misc\OrderedHashSet.java
* [x] misc\ParseCancellationException.java
* [x] ~~misc\Predicate.java~~ (Unnecessary in TypeScript)
* [ ] misc\RuleDependencyChecker.java
* [ ] misc\RuleDependencyProcessor.java
* [x] ~~misc\TestRig.java~~ (Deprecated prior to TypeScript port)
* [x] ~~misc\Tuple.java~~ (Unnecessary in TypeScript)
* [x] ~~misc\Tuple2.java~~ (Unnecessary in TypeScript)
* [x] ~~misc\Tuple3.java~~ (Unnecessary in TypeScript)
* [x] misc\Utils.java (Partial, rather language specific)
* [x] tree\AbstractParseTreeVisitor.java
* [x] ~~tree\ErrorNode.java~~ (No separate interface in TypeScript)
* [x] tree\ErrorNodeImpl.java (Moved to ErrorNode)
* [x] tree\ParseTree.java
* [x] tree\ParseTreeListener.java
* [x] tree\ParseTreeProperty.java
* [x] tree\ParseTreeVisitor.java
* [x] tree\ParseTreeWalker.java
* [x] tree\RuleNode.java
* [x] tree\SyntaxTree.java
* [x] ~~tree\TerminalNode.java~~ (No separate interface in TypeScript)
* [x] tree\TerminalNodeImpl.java (Moved to TerminalNode)
* [x] tree\Tree.java
* [x] tree\Trees.java
* [x] tree\pattern\Chunk.java
* [x] tree\pattern\ParseTreeMatch.java
* [x] tree\pattern\ParseTreePattern.java
* [x] tree\pattern\ParseTreePatternMatcher.java
* [x] tree\pattern\RuleTagToken.java
* [x] tree\pattern\TagChunk.java
* [x] tree\pattern\TextChunk.java
* [x] tree\pattern\TokenTagToken.java
* [x] tree\xpath\XPath.java
* [x] tree\xpath\XPathElement.java
* [x] tree\xpath\XPathLexer.g4
* [x] tree\xpath\XPathLexerErrorListener.java
* [x] tree\xpath\XPathRuleAnywhereElement.java
* [x] tree\xpath\XPathRuleElement.java
* [x] tree\xpath\XPathTokenAnywhereElement.java
* [x] tree\xpath\XPathTokenElement.java
* [x] tree\xpath\XPathWildcardAnywhereElement.java
* [x] tree\xpath\XPathWildcardElement.java
