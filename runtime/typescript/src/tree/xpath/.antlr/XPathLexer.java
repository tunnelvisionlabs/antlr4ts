// Generated from c:\code\antlr4ts\runtime\typescript\src\tree\xpath\XPathLexer.g4 by ANTLR 4.7.1
import org.antlr.v4.runtime.Lexer;
import org.antlr.v4.runtime.CharStream;
import org.antlr.v4.runtime.Token;
import org.antlr.v4.runtime.TokenStream;
import org.antlr.v4.runtime.*;
import org.antlr.v4.runtime.atn.*;
import org.antlr.v4.runtime.dfa.DFA;
import org.antlr.v4.runtime.misc.*;

@SuppressWarnings({"all", "warnings", "unchecked", "unused", "cast"})
public class XPathLexer extends Lexer {
	static { RuntimeMetaData.checkVersion("4.7.1", RuntimeMetaData.VERSION); }

	protected static final DFA[] _decisionToDFA;
	protected static final PredictionContextCache _sharedContextCache =
		new PredictionContextCache();
	public static final int
		TOKEN_REF=1, RULE_REF=2, ANYWHERE=3, ROOT=4, WILDCARD=5, BANG=6, ID=7, 
		STRING=8;
	public static String[] channelNames = {
		"DEFAULT_TOKEN_CHANNEL", "HIDDEN"
	};

	public static String[] modeNames = {
		"DEFAULT_MODE"
	};

	public static final String[] ruleNames = {
		"ANYWHERE", "ROOT", "WILDCARD", "BANG", "ID", "NameChar", "NameStartChar", 
		"STRING"
	};

	private static final String[] _LITERAL_NAMES = {
		null, null, null, "'//'", "'/'", "'*'", "'!'"
	};
	private static final String[] _SYMBOLIC_NAMES = {
		null, "TOKEN_REF", "RULE_REF", "ANYWHERE", "ROOT", "WILDCARD", "BANG", 
		"ID", "STRING"
	};
	public static final Vocabulary VOCABULARY = new VocabularyImpl(_LITERAL_NAMES, _SYMBOLIC_NAMES);

	/**
	 * @deprecated Use {@link #VOCABULARY} instead.
	 */
	@Deprecated
	public static final String[] tokenNames;
	static {
		tokenNames = new String[_SYMBOLIC_NAMES.length];
		for (int i = 0; i < tokenNames.length; i++) {
			tokenNames[i] = VOCABULARY.getLiteralName(i);
			if (tokenNames[i] == null) {
				tokenNames[i] = VOCABULARY.getSymbolicName(i);
			}

			if (tokenNames[i] == null) {
				tokenNames[i] = "<INVALID>";
			}
		}
	}

	@Override
	@Deprecated
	public String[] getTokenNames() {
		return tokenNames;
	}

	@Override

	public Vocabulary getVocabulary() {
		return VOCABULARY;
	}


	public XPathLexer(CharStream input) {
		super(input);
		_interp = new LexerATNSimulator(this,_ATN,_decisionToDFA,_sharedContextCache);
	}

	@Override
	public String getGrammarFileName() { return "XPathLexer.g4"; }

	@Override
	public String[] getRuleNames() { return ruleNames; }

	@Override
	public String getSerializedATN() { return _serializedATN; }

	@Override
	public String[] getChannelNames() { return channelNames; }

	@Override
	public String[] getModeNames() { return modeNames; }

	@Override
	public ATN getATN() { return _ATN; }

	@Override
	public void action(RuleContext _localctx, int ruleIndex, int actionIndex) {
		switch (ruleIndex) {
		case 4:
			ID_action((RuleContext)_localctx, actionIndex);
			break;
		}
	}
	private void ID_action(RuleContext _localctx, int actionIndex) {
		switch (actionIndex) {
		case 0:

			const text = this.text;
			if (text.charAt(0) === text.charAt(0).toUpperCase()) {
				this.type = XPathLexer.TOKEN_REF;
			} else {
				this.type = XPathLexer.RULE_REF;
			}

			break;
		}
	}

	public static final String _serializedATN =
		"\3\u608b\ua72a\u8133\ub9ed\u417c\u3be7\u7786\u5964\2\n\62\b\1\4\2\t\2"+
		"\4\3\t\3\4\4\t\4\4\5\t\5\4\6\t\6\4\7\t\7\4\b\t\b\4\t\t\t\3\2\3\2\3\2\3"+
		"\3\3\3\3\4\3\4\3\5\3\5\3\6\3\6\7\6\37\n\6\f\6\16\6\"\13\6\3\6\3\6\3\7"+
		"\3\7\3\b\3\b\3\t\3\t\7\t,\n\t\f\t\16\t/\13\t\3\t\3\t\3-\2\n\3\5\5\6\7"+
		"\7\t\b\13\t\r\2\17\2\21\n\3\2\2\4\u02b6\2\2\2\n\2\20\2\35\2\62\2;\2C\2"+
		"\\\2a\2a\2c\2|\2\u0081\2\u00a1\2\u00ac\2\u00ac\2\u00af\2\u00af\2\u00b7"+
		"\2\u00b7\2\u00bc\2\u00bc\2\u00c2\2\u00d8\2\u00da\2\u00f8\2\u00fa\2\u02c3"+
		"\2\u02c8\2\u02d3\2\u02e2\2\u02e6\2\u02ee\2\u02ee\2\u02f0\2\u02f0\2\u0302"+
		"\2\u0376\2\u0378\2\u0379\2\u037c\2\u037f\2\u0381\2\u0381\2\u0388\2\u0388"+
		"\2\u038a\2\u038c\2\u038e\2\u038e\2\u0390\2\u03a3\2\u03a5\2\u03f7\2\u03f9"+
		"\2\u0483\2\u0485\2\u0489\2\u048c\2\u0531\2\u0533\2\u0558\2\u055b\2\u055b"+
		"\2\u0563\2\u0589\2\u0593\2\u05bf\2\u05c1\2\u05c1\2\u05c3\2\u05c4\2\u05c6"+
		"\2\u05c7\2\u05c9\2\u05c9\2\u05d2\2\u05ec\2\u05f2\2\u05f4\2\u0602\2\u0607"+
		"\2\u0612\2\u061c\2\u061e\2\u061e\2\u0622\2\u066b\2\u0670\2\u06d5\2\u06d7"+
		"\2\u06df\2\u06e1\2\u06ea\2\u06ec\2\u06fe\2\u0701\2\u0701\2\u0711\2\u074c"+
		"\2\u074f\2\u07b3\2\u07c2\2\u07f7\2\u07fc\2\u07fc\2\u0802\2\u082f\2\u0842"+
		"\2\u085d\2\u08a2\2\u08b6\2\u08b8\2\u08bf\2\u08d6\2\u0965\2\u0968\2\u0971"+
		"\2\u0973\2\u0985\2\u0987\2\u098e\2\u0991\2\u0992\2\u0995\2\u09aa\2\u09ac"+
		"\2\u09b2\2\u09b4\2\u09b4\2\u09b8\2\u09bb\2\u09be\2\u09c6\2\u09c9\2\u09ca"+
		"\2\u09cd\2\u09d0\2\u09d9\2\u09d9\2\u09de\2\u09df\2\u09e1\2\u09e5\2\u09e8"+
		"\2\u09f3\2\u0a03\2\u0a05\2\u0a07\2\u0a0c\2\u0a11\2\u0a12\2\u0a15\2\u0a2a"+
		"\2\u0a2c\2\u0a32\2\u0a34\2\u0a35\2\u0a37\2\u0a38\2\u0a3a\2\u0a3b\2\u0a3e"+
		"\2\u0a3e\2\u0a40\2\u0a44\2\u0a49\2\u0a4a\2\u0a4d\2\u0a4f\2\u0a53\2\u0a53"+
		"\2\u0a5b\2\u0a5e\2\u0a60\2\u0a60\2\u0a68\2\u0a77\2\u0a83\2\u0a85\2\u0a87"+
		"\2\u0a8f\2\u0a91\2\u0a93\2\u0a95\2\u0aaa\2\u0aac\2\u0ab2\2\u0ab4\2\u0ab5"+
		"\2\u0ab7\2\u0abb\2\u0abe\2\u0ac7\2\u0ac9\2\u0acb\2\u0acd\2\u0acf\2\u0ad2"+
		"\2\u0ad2\2\u0ae2\2\u0ae5\2\u0ae8\2\u0af1\2\u0afb\2\u0afb\2\u0b03\2\u0b05"+
		"\2\u0b07\2\u0b0e\2\u0b11\2\u0b12\2\u0b15\2\u0b2a\2\u0b2c\2\u0b32\2\u0b34"+
		"\2\u0b35\2\u0b37\2\u0b3b\2\u0b3e\2\u0b46\2\u0b49\2\u0b4a\2\u0b4d\2\u0b4f"+
		"\2\u0b58\2\u0b59\2\u0b5e\2\u0b5f\2\u0b61\2\u0b65\2\u0b68\2\u0b71\2\u0b73"+
		"\2\u0b73\2\u0b84\2\u0b85\2\u0b87\2\u0b8c\2\u0b90\2\u0b92\2\u0b94\2\u0b97"+
		"\2\u0b9b\2\u0b9c\2\u0b9e\2\u0b9e\2\u0ba0\2\u0ba1\2\u0ba5\2\u0ba6\2\u0baa"+
		"\2\u0bac\2\u0bb0\2\u0bbb\2\u0bc0\2\u0bc4\2\u0bc8\2\u0bca\2\u0bcc\2\u0bcf"+
		"\2\u0bd2\2\u0bd2\2\u0bd9\2\u0bd9\2\u0be8\2\u0bf1\2\u0c02\2\u0c05\2\u0c07"+
		"\2\u0c0e\2\u0c10\2\u0c12\2\u0c14\2\u0c2a\2\u0c2c\2\u0c3b\2\u0c3f\2\u0c46"+
		"\2\u0c48\2\u0c4a\2\u0c4c\2\u0c4f\2\u0c57\2\u0c58\2\u0c5a\2\u0c5c\2\u0c62"+
		"\2\u0c65\2\u0c68\2\u0c71\2\u0c82\2\u0c85\2\u0c87\2\u0c8e\2\u0c90\2\u0c92"+
		"\2\u0c94\2\u0caa\2\u0cac\2\u0cb5\2\u0cb7\2\u0cbb\2\u0cbe\2\u0cc6\2\u0cc8"+
		"\2\u0cca\2\u0ccc\2\u0ccf\2\u0cd7\2\u0cd8\2\u0ce0\2\u0ce0\2\u0ce2\2\u0ce5"+
		"\2\u0ce8\2\u0cf1\2\u0cf3\2\u0cf4\2\u0d03\2\u0d05\2\u0d07\2\u0d0e\2\u0d10"+
		"\2\u0d12\2\u0d14\2\u0d3c\2\u0d3f\2\u0d46\2\u0d48\2\u0d4a\2\u0d4c\2\u0d50"+
		"\2\u0d56\2\u0d59\2\u0d61\2\u0d65\2\u0d68\2\u0d71\2\u0d7c\2\u0d81\2\u0d84"+
		"\2\u0d85\2\u0d87\2\u0d98\2\u0d9c\2\u0db3\2\u0db5\2\u0dbd\2\u0dbf\2\u0dbf"+
		"\2\u0dc2\2\u0dc8\2\u0dcc\2\u0dcc\2\u0dd1\2\u0dd6\2\u0dd8\2\u0dd8\2\u0dda"+
		"\2\u0de1\2\u0de8\2\u0df1\2\u0df4\2\u0df5\2\u0e03\2\u0e3c\2\u0e42\2\u0e50"+
		"\2\u0e52\2\u0e5b\2\u0e83\2\u0e84\2\u0e86\2\u0e86\2\u0e89\2\u0e8a\2\u0e8c"+
		"\2\u0e8c\2\u0e8f\2\u0e8f\2\u0e96\2\u0e99\2\u0e9b\2\u0ea1\2\u0ea3\2\u0ea5"+
		"\2\u0ea7\2\u0ea7\2\u0ea9\2\u0ea9\2\u0eac\2\u0ead\2\u0eaf\2\u0ebb\2\u0ebd"+
		"\2\u0ebf\2\u0ec2\2\u0ec6\2\u0ec8\2\u0ec8\2\u0eca\2\u0ecf\2\u0ed2\2\u0edb"+
		"\2\u0ede\2\u0ee1\2\u0f02\2\u0f02\2\u0f1a\2\u0f1b\2\u0f22\2\u0f2b\2\u0f37"+
		"\2\u0f37\2\u0f39\2\u0f39\2\u0f3b\2\u0f3b\2\u0f40\2\u0f49\2\u0f4b\2\u0f6e"+
		"\2\u0f73\2\u0f86\2\u0f88\2\u0f99\2\u0f9b\2\u0fbe\2\u0fc8\2\u0fc8\2\u1002"+
		"\2\u104b\2\u1052\2\u109f\2\u10a2\2\u10c7\2\u10c9\2\u10c9\2\u10cf\2\u10cf"+
		"\2\u10d2\2\u10fc\2\u10fe\2\u124a\2\u124c\2\u124f\2\u1252\2\u1258\2\u125a"+
		"\2\u125a\2\u125c\2\u125f\2\u1262\2\u128a\2\u128c\2\u128f\2\u1292\2\u12b2"+
		"\2\u12b4\2\u12b7\2\u12ba\2\u12c0\2\u12c2\2\u12c2\2\u12c4\2\u12c7\2\u12ca"+
		"\2\u12d8\2\u12da\2\u1312\2\u1314\2\u1317\2\u131a\2\u135c\2\u135f\2\u1361"+
		"\2\u1382\2\u1391\2\u13a2\2\u13f7\2\u13fa\2\u13ff\2\u1403\2\u166e\2\u1671"+
		"\2\u1681\2\u1683\2\u169c\2\u16a2\2\u16ec\2\u16f0\2\u16fa\2\u1702\2\u170e"+
		"\2\u1710\2\u1716\2\u1722\2\u1736\2\u1742\2\u1755\2\u1762\2\u176e\2\u1770"+
		"\2\u1772\2\u1774\2\u1775\2\u1782\2\u17d5\2\u17d9\2\u17d9\2\u17de\2\u17df"+
		"\2\u17e2\2\u17eb\2\u180d\2\u1810\2\u1812\2\u181b\2\u1822\2\u1879\2\u1882"+
		"\2\u18ac\2\u18b2\2\u18f7\2\u1902\2\u1920\2\u1922\2\u192d\2\u1932\2\u193d"+
		"\2\u1948\2\u196f\2\u1972\2\u1976\2\u1982\2\u19ad\2\u19b2\2\u19cb\2\u19d2"+
		"\2\u19db\2\u1a02\2\u1a1d\2\u1a22\2\u1a60\2\u1a62\2\u1a7e\2\u1a81\2\u1a8b"+
		"\2\u1a92\2\u1a9b\2\u1aa9\2\u1aa9\2\u1ab2\2\u1abf\2\u1b02\2\u1b4d\2\u1b52"+
		"\2\u1b5b\2\u1b6d\2\u1b75\2\u1b82\2\u1bf5\2\u1c02\2\u1c39\2\u1c42\2\u1c4b"+
		"\2\u1c4f\2\u1c7f\2\u1c82\2\u1c8a\2\u1cd2\2\u1cd4\2\u1cd6\2\u1cf8\2\u1cfa"+
		"\2\u1cfb\2\u1d02\2\u1df7\2\u1dfd\2\u1f17\2\u1f1a\2\u1f1f\2\u1f22\2\u1f47"+
		"\2\u1f4a\2\u1f4f\2\u1f52\2\u1f59\2\u1f5b\2\u1f5b\2\u1f5d\2\u1f5d\2\u1f5f"+
		"\2\u1f5f\2\u1f61\2\u1f7f\2\u1f82\2\u1fb6\2\u1fb8\2\u1fbe\2\u1fc0\2\u1fc0"+
		"\2\u1fc4\2\u1fc6\2\u1fc8\2\u1fce\2\u1fd2\2\u1fd5\2\u1fd8\2\u1fdd\2\u1fe2"+
		"\2\u1fee\2\u1ff4\2\u1ff6\2\u1ff8\2\u1ffe\2\u200d\2\u2011\2\u202c\2\u2030"+
		"\2\u2041\2\u2042\2\u2056\2\u2056\2\u2062\2\u2066\2\u2068\2\u2071\2\u2073"+
		"\2\u2073\2\u2081\2\u2081\2\u2092\2\u209e\2\u20d2\2\u20de\2\u20e3\2\u20e3"+
		"\2\u20e7\2\u20f2\2\u2104\2\u2104\2\u2109\2\u2109\2\u210c\2\u2115\2\u2117"+
		"\2\u2117\2\u211b\2\u211f\2\u2126\2\u2126\2\u2128\2\u2128\2\u212a\2\u212a"+
		"\2\u212c\2\u212f\2\u2131\2\u213b\2\u213e\2\u2141\2\u2147\2\u214b\2\u2150"+
		"\2\u2150\2\u2162\2\u218a\2\u2c02\2\u2c30\2\u2c32\2\u2c60\2\u2c62\2\u2ce6"+
		"\2\u2ced\2\u2cf5\2\u2d02\2\u2d27\2\u2d29\2\u2d29\2\u2d2f\2\u2d2f\2\u2d32"+
		"\2\u2d69\2\u2d71\2\u2d71\2\u2d81\2\u2d98\2\u2da2\2\u2da8\2\u2daa\2\u2db0"+
		"\2\u2db2\2\u2db8\2\u2dba\2\u2dc0\2\u2dc2\2\u2dc8\2\u2dca\2\u2dd0\2\u2dd2"+
		"\2\u2dd8\2\u2dda\2\u2de0\2\u2de2\2\u2e01\2\u2e31\2\u2e31\2\u3007\2\u3009"+
		"\2\u3023\2\u3031\2\u3033\2\u3037\2\u303a\2\u303e\2\u3043\2\u3098\2\u309b"+
		"\2\u309c\2\u309f\2\u30a1\2\u30a3\2\u30fc\2\u30fe\2\u3101\2\u3107\2\u312f"+
		"\2\u3133\2\u3190\2\u31a2\2\u31bc\2\u31f2\2\u3201\2\u3402\2\u4db7\2\u4e02"+
		"\2\u9fd7\2\ua002\2\ua48e\2\ua4d2\2\ua4ff\2\ua502\2\ua60e\2\ua612\2\ua62d"+
		"\2\ua642\2\ua671\2\ua676\2\ua67f\2\ua681\2\ua6f3\2\ua719\2\ua721\2\ua724"+
		"\2\ua78a\2\ua78d\2\ua7b0\2\ua7b2\2\ua7b9\2\ua7f9\2\ua829\2\ua842\2\ua875"+
		"\2\ua882\2\ua8c7\2\ua8d2\2\ua8db\2\ua8e2\2\ua8f9\2\ua8fd\2\ua8fd\2\ua8ff"+
		"\2\ua8ff\2\ua902\2\ua92f\2\ua932\2\ua955\2\ua962\2\ua97e\2\ua982\2\ua9c2"+
		"\2\ua9d1\2\ua9db\2\ua9e2\2\uaa00\2\uaa02\2\uaa38\2\uaa42\2\uaa4f\2\uaa52"+
		"\2\uaa5b\2\uaa62\2\uaa78\2\uaa7c\2\uaac4\2\uaadd\2\uaadf\2\uaae2\2\uaaf1"+
		"\2\uaaf4\2\uaaf8\2\uab03\2\uab08\2\uab0b\2\uab10\2\uab13\2\uab18\2\uab22"+
		"\2\uab28\2\uab2a\2\uab30\2\uab32\2\uab5c\2\uab5e\2\uab67\2\uab72\2\uabec"+
		"\2\uabee\2\uabef\2\uabf2\2\uabfb\2\uac02\2\ud7a5\2\ud7b2\2\ud7c8\2\ud7cd"+
		"\2\ud7fd\2\uf902\2\ufa6f\2\ufa72\2\ufadb\2\ufb02\2\ufb08\2\ufb15\2\ufb19"+
		"\2\ufb1f\2\ufb2a\2\ufb2c\2\ufb38\2\ufb3a\2\ufb3e\2\ufb40\2\ufb40\2\ufb42"+
		"\2\ufb43\2\ufb45\2\ufb46\2\ufb48\2\ufbb3\2\ufbd5\2\ufd3f\2\ufd52\2\ufd91"+
		"\2\ufd94\2\ufdc9\2\ufdf2\2\ufdfd\2\ufe02\2\ufe11\2\ufe22\2\ufe31\2\ufe35"+
		"\2\ufe36\2\ufe4f\2\ufe51\2\ufe72\2\ufe76\2\ufe78\2\ufefe\2\uff01\2\uff01"+
		"\2\uff12\2\uff1b\2\uff23\2\uff3c\2\uff41\2\uff41\2\uff43\2\uff5c\2\uff68"+
		"\2\uffc0\2\uffc4\2\uffc9\2\uffcc\2\uffd1\2\uffd4\2\uffd9\2\uffdc\2\uffde"+
		"\2\ufffb\2\ufffd\2\2\3\r\3\17\3(\3*\3<\3>\3?\3A\3O\3R\3_\3\u0082\3\u00fc"+
		"\3\u0142\3\u0176\3\u01ff\3\u01ff\3\u0282\3\u029e\3\u02a2\3\u02d2\3\u02e2"+
		"\3\u02e2\3\u0302\3\u0321\3\u0332\3\u034c\3\u0352\3\u037c\3\u0382\3\u039f"+
		"\3\u03a2\3\u03c5\3\u03ca\3\u03d1\3\u03d3\3\u03d7\3\u0402\3\u049f\3\u04a2"+
		"\3\u04ab\3\u04b2\3\u04d5\3\u04da\3\u04fd\3\u0502\3\u0529\3\u0532\3\u0565"+
		"\3\u0602\3\u0738\3\u0742\3\u0757\3\u0762\3\u0769\3\u0802\3\u0807\3\u080a"+
		"\3\u080a\3\u080c\3\u0837\3\u0839\3\u083a\3\u083e\3\u083e\3\u0841\3\u0857"+
		"\3\u0862\3\u0878\3\u0882\3\u08a0\3\u08e2\3\u08f4\3\u08f6\3\u08f7\3\u0902"+
		"\3\u0917\3\u0922\3\u093b\3\u0982\3\u09b9\3\u09c0\3\u09c1\3\u0a02\3\u0a05"+
		"\3\u0a07\3\u0a08\3\u0a0e\3\u0a15\3\u0a17\3\u0a19\3\u0a1b\3\u0a35\3\u0a3a"+
		"\3\u0a3c\3\u0a41\3\u0a41\3\u0a62\3\u0a7e\3\u0a82\3\u0a9e\3\u0ac2\3\u0ac9"+
		"\3\u0acb\3\u0ae8\3\u0b02\3\u0b37\3\u0b42\3\u0b57\3\u0b62\3\u0b74\3\u0b82"+
		"\3\u0b93\3\u0c02\3\u0c4a\3\u0c82\3\u0cb4\3\u0cc2\3\u0cf4\3\u1002\3\u1048"+
		"\3\u1068\3\u1071\3\u1081\3\u10bc\3\u10bf\3\u10bf\3\u10d2\3\u10ea\3\u10f2"+
		"\3\u10fb\3\u1102\3\u1136\3\u1138\3\u1141\3\u1152\3\u1175\3\u1178\3\u1178"+
		"\3\u1182\3\u11c6\3\u11cc\3\u11ce\3\u11d2\3\u11dc\3\u11de\3\u11de\3\u1202"+
		"\3\u1213\3\u1215\3\u1239\3\u1240\3\u1240\3\u1282\3\u1288\3\u128a\3\u128a"+
		"\3\u128c\3\u128f\3\u1291\3\u129f\3\u12a1\3\u12aa\3\u12b2\3\u12ec\3\u12f2"+
		"\3\u12fb\3\u1302\3\u1305\3\u1307\3\u130e\3\u1311\3\u1312\3\u1315\3\u132a"+
		"\3\u132c\3\u1332\3\u1334\3\u1335\3\u1337\3\u133b\3\u133e\3\u1346\3\u1349"+
		"\3\u134a\3\u134d\3\u134f\3\u1352\3\u1352\3\u1359\3\u1359\3\u135f\3\u1365"+
		"\3\u1368\3\u136e\3\u1372\3\u1376\3\u1402\3\u144c\3\u1452\3\u145b\3\u1482"+
		"\3\u14c7\3\u14c9\3\u14c9\3\u14d2\3\u14db\3\u1582\3\u15b7\3\u15ba\3\u15c2"+
		"\3\u15da\3\u15df\3\u1602\3\u1642\3\u1646\3\u1646\3\u1652\3\u165b\3\u1682"+
		"\3\u16b9\3\u16c2\3\u16cb\3\u1702\3\u171b\3\u171f\3\u172d\3\u1732\3\u173b"+
		"\3\u18a2\3\u18eb\3\u1901\3\u1901\3\u1ac2\3\u1afa\3\u1c02\3\u1c0a\3\u1c0c"+
		"\3\u1c38\3\u1c3a\3\u1c42\3\u1c52\3\u1c5b\3\u1c74\3\u1c91\3\u1c94\3\u1ca9"+
		"\3\u1cab\3\u1cb8\3\u2002\3\u239b\3\u2402\3\u2470\3\u2482\3\u2545\3\u3002"+
		"\3\u3430\3\u4402\3\u4648\3\u6802\3\u6a3a\3\u6a42\3\u6a60\3\u6a62\3\u6a6b"+
		"\3\u6ad2\3\u6aef\3\u6af2\3\u6af6\3\u6b02\3\u6b38\3\u6b42\3\u6b45\3\u6b52"+
		"\3\u6b5b\3\u6b65\3\u6b79\3\u6b7f\3\u6b91\3\u6f02\3\u6f46\3\u6f52\3\u6f80"+
		"\3\u6f91\3\u6fa1\3\u6fe2\3\u6fe2\3\u7002\3\u87ee\3\u8802\3\u8af4\3\ub002"+
		"\3\ub003\3\ubc02\3\ubc6c\3\ubc72\3\ubc7e\3\ubc82\3\ubc8a\3\ubc92\3\ubc9b"+
		"\3\ubc9f\3\ubca0\3\ubca2\3\ubca5\3\ud167\3\ud16b\3\ud16f\3\ud184\3\ud187"+
		"\3\ud18d\3\ud1ac\3\ud1af\3\ud244\3\ud246\3\ud402\3\ud456\3\ud458\3\ud49e"+
		"\3\ud4a0\3\ud4a1\3\ud4a4\3\ud4a4\3\ud4a7\3\ud4a8\3\ud4ab\3\ud4ae\3\ud4b0"+
		"\3\ud4bb\3\ud4bd\3\ud4bd\3\ud4bf\3\ud4c5\3\ud4c7\3\ud507\3\ud509\3\ud50c"+
		"\3\ud50f\3\ud516\3\ud518\3\ud51e\3\ud520\3\ud53b\3\ud53d\3\ud540\3\ud542"+
		"\3\ud546\3\ud548\3\ud548\3\ud54c\3\ud552\3\ud554\3\ud6a7\3\ud6aa\3\ud6c2"+
		"\3\ud6c4\3\ud6dc\3\ud6de\3\ud6fc\3\ud6fe\3\ud716\3\ud718\3\ud736\3\ud738"+
		"\3\ud750\3\ud752\3\ud770\3\ud772\3\ud78a\3\ud78c\3\ud7aa\3\ud7ac\3\ud7c4"+
		"\3\ud7c6\3\ud7cd\3\ud7d0\3\ud801\3\uda02\3\uda38\3\uda3d\3\uda6e\3\uda77"+
		"\3\uda77\3\uda86\3\uda86\3\uda9d\3\udaa1\3\udaa3\3\udab1\3\ue002\3\ue008"+
		"\3\ue00a\3\ue01a\3\ue01d\3\ue023\3\ue025\3\ue026\3\ue028\3\ue02c\3\ue802"+
		"\3\ue8c6\3\ue8d2\3\ue8d8\3\ue902\3\ue94c\3\ue952\3\ue95b\3\uee02\3\uee05"+
		"\3\uee07\3\uee21\3\uee23\3\uee24\3\uee26\3\uee26\3\uee29\3\uee29\3\uee2b"+
		"\3\uee34\3\uee36\3\uee39\3\uee3b\3\uee3b\3\uee3d\3\uee3d\3\uee44\3\uee44"+
		"\3\uee49\3\uee49\3\uee4b\3\uee4b\3\uee4d\3\uee4d\3\uee4f\3\uee51\3\uee53"+
		"\3\uee54\3\uee56\3\uee56\3\uee59\3\uee59\3\uee5b\3\uee5b\3\uee5d\3\uee5d"+
		"\3\uee5f\3\uee5f\3\uee61\3\uee61\3\uee63\3\uee64\3\uee66\3\uee66\3\uee69"+
		"\3\uee6c\3\uee6e\3\uee74\3\uee76\3\uee79\3\uee7b\3\uee7e\3\uee80\3\uee80"+
		"\3\uee82\3\uee8b\3\uee8d\3\uee9d\3\ueea3\3\ueea5\3\ueea7\3\ueeab\3\ueead"+
		"\3\ueebd\3\2\4\ua6d8\4\ua702\4\ub736\4\ub742\4\ub81f\4\ub822\4\ucea3\4"+
		"\uf802\4\ufa1f\4\3\20\3\20\"\20\u0081\20\u0102\20\u01f1\20\u0240\2C\2"+
		"\\\2c\2|\2\u00ac\2\u00ac\2\u00b7\2\u00b7\2\u00bc\2\u00bc\2\u00c2\2\u00d8"+
		"\2\u00da\2\u00f8\2\u00fa\2\u02c3\2\u02c8\2\u02d3\2\u02e2\2\u02e6\2\u02ee"+
		"\2\u02ee\2\u02f0\2\u02f0\2\u0372\2\u0376\2\u0378\2\u0379\2\u037c\2\u037f"+
		"\2\u0381\2\u0381\2\u0388\2\u0388\2\u038a\2\u038c\2\u038e\2\u038e\2\u0390"+
		"\2\u03a3\2\u03a5\2\u03f7\2\u03f9\2\u0483\2\u048c\2\u0531\2\u0533\2\u0558"+
		"\2\u055b\2\u055b\2\u0563\2\u0589\2\u05d2\2\u05ec\2\u05f2\2\u05f4\2\u0622"+
		"\2\u064c\2\u0670\2\u0671\2\u0673\2\u06d5\2\u06d7\2\u06d7\2\u06e7\2\u06e8"+
		"\2\u06f0\2\u06f1\2\u06fc\2\u06fe\2\u0701\2\u0701\2\u0712\2\u0712\2\u0714"+
		"\2\u0731\2\u074f\2\u07a7\2\u07b3\2\u07b3\2\u07cc\2\u07ec\2\u07f6\2\u07f7"+
		"\2\u07fc\2\u07fc\2\u0802\2\u0817\2\u081c\2\u081c\2\u0826\2\u0826\2\u082a"+
		"\2\u082a\2\u0842\2\u085a\2\u08a2\2\u08b6\2\u08b8\2\u08bf\2\u0906\2\u093b"+
		"\2\u093f\2\u093f\2\u0952\2\u0952\2\u095a\2\u0963\2\u0973\2\u0982\2\u0987"+
		"\2\u098e\2\u0991\2\u0992\2\u0995\2\u09aa\2\u09ac\2\u09b2\2\u09b4\2\u09b4"+
		"\2\u09b8\2\u09bb\2\u09bf\2\u09bf\2\u09d0\2\u09d0\2\u09de\2\u09df\2\u09e1"+
		"\2\u09e3\2\u09f2\2\u09f3\2\u0a07\2\u0a0c\2\u0a11\2\u0a12\2\u0a15\2\u0a2a"+
		"\2\u0a2c\2\u0a32\2\u0a34\2\u0a35\2\u0a37\2\u0a38\2\u0a3a\2\u0a3b\2\u0a5b"+
		"\2\u0a5e\2\u0a60\2\u0a60\2\u0a74\2\u0a76\2\u0a87\2\u0a8f\2\u0a91\2\u0a93"+
		"\2\u0a95\2\u0aaa\2\u0aac\2\u0ab2\2\u0ab4\2\u0ab5\2\u0ab7\2\u0abb\2\u0abf"+
		"\2\u0abf\2\u0ad2\2\u0ad2\2\u0ae2\2\u0ae3\2\u0afb\2\u0afb\2\u0b07\2\u0b0e"+
		"\2\u0b11\2\u0b12\2\u0b15\2\u0b2a\2\u0b2c\2\u0b32\2\u0b34\2\u0b35\2\u0b37"+
		"\2\u0b3b\2\u0b3f\2\u0b3f\2\u0b5e\2\u0b5f\2\u0b61\2\u0b63\2\u0b73\2\u0b73"+
		"\2\u0b85\2\u0b85\2\u0b87\2\u0b8c\2\u0b90\2\u0b92\2\u0b94\2\u0b97\2\u0b9b"+
		"\2\u0b9c\2\u0b9e\2\u0b9e\2\u0ba0\2\u0ba1\2\u0ba5\2\u0ba6\2\u0baa\2\u0bac"+
		"\2\u0bb0\2\u0bbb\2\u0bd2\2\u0bd2\2\u0c07\2\u0c0e\2\u0c10\2\u0c12\2\u0c14"+
		"\2\u0c2a\2\u0c2c\2\u0c3b\2\u0c3f\2\u0c3f\2\u0c5a\2\u0c5c\2\u0c62\2\u0c63"+
		"\2\u0c82\2\u0c82\2\u0c87\2\u0c8e\2\u0c90\2\u0c92\2\u0c94\2\u0caa\2\u0cac"+
		"\2\u0cb5\2\u0cb7\2\u0cbb\2\u0cbf\2\u0cbf\2\u0ce0\2\u0ce0\2\u0ce2\2\u0ce3"+
		"\2\u0cf3\2\u0cf4\2\u0d07\2\u0d0e\2\u0d10\2\u0d12\2\u0d14\2\u0d3c\2\u0d3f"+
		"\2\u0d3f\2\u0d50\2\u0d50\2\u0d56\2\u0d58\2\u0d61\2\u0d63\2\u0d7c\2\u0d81"+
		"\2\u0d87\2\u0d98\2\u0d9c\2\u0db3\2\u0db5\2\u0dbd\2\u0dbf\2\u0dbf\2\u0dc2"+
		"\2\u0dc8\2\u0e03\2\u0e32\2\u0e34\2\u0e35\2\u0e42\2\u0e48\2\u0e83\2\u0e84"+
		"\2\u0e86\2\u0e86\2\u0e89\2\u0e8a\2\u0e8c\2\u0e8c\2\u0e8f\2\u0e8f\2\u0e96"+
		"\2\u0e99\2\u0e9b\2\u0ea1\2\u0ea3\2\u0ea5\2\u0ea7\2\u0ea7\2\u0ea9\2\u0ea9"+
		"\2\u0eac\2\u0ead\2\u0eaf\2\u0eb2\2\u0eb4\2\u0eb5\2\u0ebf\2\u0ebf\2\u0ec2"+
		"\2\u0ec6\2\u0ec8\2\u0ec8\2\u0ede\2\u0ee1\2\u0f02\2\u0f02\2\u0f42\2\u0f49"+
		"\2\u0f4b\2\u0f6e\2\u0f8a\2\u0f8e\2\u1002\2\u102c\2\u1041\2\u1041\2\u1052"+
		"\2\u1057\2\u105c\2\u105f\2\u1063\2\u1063\2\u1067\2\u1068\2\u1070\2\u1072"+
		"\2\u1077\2\u1083\2\u1090\2\u1090\2\u10a2\2\u10c7\2\u10c9\2\u10c9\2\u10cf"+
		"\2\u10cf\2\u10d2\2\u10fc\2\u10fe\2\u124a\2\u124c\2\u124f\2\u1252\2\u1258"+
		"\2\u125a\2\u125a\2\u125c\2\u125f\2\u1262\2\u128a\2\u128c\2\u128f\2\u1292"+
		"\2\u12b2\2\u12b4\2\u12b7\2\u12ba\2\u12c0\2\u12c2\2\u12c2\2\u12c4\2\u12c7"+
		"\2\u12ca\2\u12d8\2\u12da\2\u1312\2\u1314\2\u1317\2\u131a\2\u135c\2\u1382"+
		"\2\u1391\2\u13a2\2\u13f7\2\u13fa\2\u13ff\2\u1403\2\u166e\2\u1671\2\u1681"+
		"\2\u1683\2\u169c\2\u16a2\2\u16ec\2\u16f0\2\u16fa\2\u1702\2\u170e\2\u1710"+
		"\2\u1713\2\u1722\2\u1733\2\u1742\2\u1753\2\u1762\2\u176e\2\u1770\2\u1772"+
		"\2\u1782\2\u17b5\2\u17d9\2\u17d9\2\u17de\2\u17de\2\u1822\2\u1879\2\u1882"+
		"\2\u1886\2\u1889\2\u18aa\2\u18ac\2\u18ac\2\u18b2\2\u18f7\2\u1902\2\u1920"+
		"\2\u1952\2\u196f\2\u1972\2\u1976\2\u1982\2\u19ad\2\u19b2\2\u19cb\2\u1a02"+
		"\2\u1a18\2\u1a22\2\u1a56\2\u1aa9\2\u1aa9\2\u1b07\2\u1b35\2\u1b47\2\u1b4d"+
		"\2\u1b85\2\u1ba2\2\u1bb0\2\u1bb1\2\u1bbc\2\u1be7\2\u1c02\2\u1c25\2\u1c4f"+
		"\2\u1c51\2\u1c5c\2\u1c7f\2\u1c82\2\u1c8a\2\u1ceb\2\u1cee\2\u1cf0\2\u1cf3"+
		"\2\u1cf7\2\u1cf8\2\u1d02\2\u1dc1\2\u1e02\2\u1f17\2\u1f1a\2\u1f1f\2\u1f22"+
		"\2\u1f47\2\u1f4a\2\u1f4f\2\u1f52\2\u1f59\2\u1f5b\2\u1f5b\2\u1f5d\2\u1f5d"+
		"\2\u1f5f\2\u1f5f\2\u1f61\2\u1f7f\2\u1f82\2\u1fb6\2\u1fb8\2\u1fbe\2\u1fc0"+
		"\2\u1fc0\2\u1fc4\2\u1fc6\2\u1fc8\2\u1fce\2\u1fd2\2\u1fd5\2\u1fd8\2\u1fdd"+
		"\2\u1fe2\2\u1fee\2\u1ff4\2\u1ff6\2\u1ff8\2\u1ffe\2\u2073\2\u2073\2\u2081"+
		"\2\u2081\2\u2092\2\u209e\2\u2104\2\u2104\2\u2109\2\u2109\2\u210c\2\u2115"+
		"\2\u2117\2\u2117\2\u211b\2\u211f\2\u2126\2\u2126\2\u2128\2\u2128\2\u212a"+
		"\2\u212a\2\u212c\2\u212f\2\u2131\2\u213b\2\u213e\2\u2141\2\u2147\2\u214b"+
		"\2\u2150\2\u2150\2\u2162\2\u218a\2\u2c02\2\u2c30\2\u2c32\2\u2c60\2\u2c62"+
		"\2\u2ce6\2\u2ced\2\u2cf0\2\u2cf4\2\u2cf5\2\u2d02\2\u2d27\2\u2d29\2\u2d29"+
		"\2\u2d2f\2\u2d2f\2\u2d32\2\u2d69\2\u2d71\2\u2d71\2\u2d82\2\u2d98\2\u2da2"+
		"\2\u2da8\2\u2daa\2\u2db0\2\u2db2\2\u2db8\2\u2dba\2\u2dc0\2\u2dc2\2\u2dc8"+
		"\2\u2dca\2\u2dd0\2\u2dd2\2\u2dd8\2\u2dda\2\u2de0\2\u2e31\2\u2e31\2\u3007"+
		"\2\u3009\2\u3023\2\u302b\2\u3033\2\u3037\2\u303a\2\u303e\2\u3043\2\u3098"+
		"\2\u309f\2\u30a1\2\u30a3\2\u30fc\2\u30fe\2\u3101\2\u3107\2\u312f\2\u3133"+
		"\2\u3190\2\u31a2\2\u31bc\2\u31f2\2\u3201\2\u3402\2\u4db7\2\u4e02\2\u9fd7"+
		"\2\ua002\2\ua48e\2\ua4d2\2\ua4ff\2\ua502\2\ua60e\2\ua612\2\ua621\2\ua62c"+
		"\2\ua62d\2\ua642\2\ua670\2\ua681\2\ua69f\2\ua6a2\2\ua6f1\2\ua719\2\ua721"+
		"\2\ua724\2\ua78a\2\ua78d\2\ua7b0\2\ua7b2\2\ua7b9\2\ua7f9\2\ua803\2\ua805"+
		"\2\ua807\2\ua809\2\ua80c\2\ua80e\2\ua824\2\ua842\2\ua875\2\ua884\2\ua8b5"+
		"\2\ua8f4\2\ua8f9\2\ua8fd\2\ua8fd\2\ua8ff\2\ua8ff\2\ua90c\2\ua927\2\ua932"+
		"\2\ua948\2\ua962\2\ua97e\2\ua986\2\ua9b4\2\ua9d1\2\ua9d1\2\ua9e2\2\ua9e6"+
		"\2\ua9e8\2\ua9f1\2\ua9fc\2\uaa00\2\uaa02\2\uaa2a\2\uaa42\2\uaa44\2\uaa46"+
		"\2\uaa4d\2\uaa62\2\uaa78\2\uaa7c\2\uaa7c\2\uaa80\2\uaab1\2\uaab3\2\uaab3"+
		"\2\uaab7\2\uaab8\2\uaabb\2\uaabf\2\uaac2\2\uaac2\2\uaac4\2\uaac4\2\uaadd"+
		"\2\uaadf\2\uaae2\2\uaaec\2\uaaf4\2\uaaf6\2\uab03\2\uab08\2\uab0b\2\uab10"+
		"\2\uab13\2\uab18\2\uab22\2\uab28\2\uab2a\2\uab30\2\uab32\2\uab5c\2\uab5e"+
		"\2\uab67\2\uab72\2\uabe4\2\uac02\2\ud7a5\2\ud7b2\2\ud7c8\2\ud7cd\2\ud7fd"+
		"\2\uf902\2\ufa6f\2\ufa72\2\ufadb\2\ufb02\2\ufb08\2\ufb15\2\ufb19\2\ufb1f"+
		"\2\ufb1f\2\ufb21\2\ufb2a\2\ufb2c\2\ufb38\2\ufb3a\2\ufb3e\2\ufb40\2\ufb40"+
		"\2\ufb42\2\ufb43\2\ufb45\2\ufb46\2\ufb48\2\ufbb3\2\ufbd5\2\ufd3f\2\ufd52"+
		"\2\ufd91\2\ufd94\2\ufdc9\2\ufdf2\2\ufdfd\2\ufe72\2\ufe76\2\ufe78\2\ufefe"+
		"\2\uff23\2\uff3c\2\uff43\2\uff5c\2\uff68\2\uffc0\2\uffc4\2\uffc9\2\uffcc"+
		"\2\uffd1\2\uffd4\2\uffd9\2\uffdc\2\uffde\2\2\3\r\3\17\3(\3*\3<\3>\3?\3"+
		"A\3O\3R\3_\3\u0082\3\u00fc\3\u0142\3\u0176\3\u0282\3\u029e\3\u02a2\3\u02d2"+
		"\3\u0302\3\u0321\3\u0332\3\u034c\3\u0352\3\u0377\3\u0382\3\u039f\3\u03a2"+
		"\3\u03c5\3\u03ca\3\u03d1\3\u03d3\3\u03d7\3\u0402\3\u049f\3\u04b2\3\u04d5"+
		"\3\u04da\3\u04fd\3\u0502\3\u0529\3\u0532\3\u0565\3\u0602\3\u0738\3\u0742"+
		"\3\u0757\3\u0762\3\u0769\3\u0802\3\u0807\3\u080a\3\u080a\3\u080c\3\u0837"+
		"\3\u0839\3\u083a\3\u083e\3\u083e\3\u0841\3\u0857\3\u0862\3\u0878\3\u0882"+
		"\3\u08a0\3\u08e2\3\u08f4\3\u08f6\3\u08f7\3\u0902\3\u0917\3\u0922\3\u093b"+
		"\3\u0982\3\u09b9\3\u09c0\3\u09c1\3\u0a02\3\u0a02\3\u0a12\3\u0a15\3\u0a17"+
		"\3\u0a19\3\u0a1b\3\u0a35\3\u0a62\3\u0a7e\3\u0a82\3\u0a9e\3\u0ac2\3\u0ac9"+
		"\3\u0acb\3\u0ae6\3\u0b02\3\u0b37\3\u0b42\3\u0b57\3\u0b62\3\u0b74\3\u0b82"+
		"\3\u0b93\3\u0c02\3\u0c4a\3\u0c82\3\u0cb4\3\u0cc2\3\u0cf4\3\u1005\3\u1039"+
		"\3\u1085\3\u10b1\3\u10d2\3\u10ea\3\u1105\3\u1128\3\u1152\3\u1174\3\u1178"+
		"\3\u1178\3\u1185\3\u11b4\3\u11c3\3\u11c6\3\u11dc\3\u11dc\3\u11de\3\u11de"+
		"\3\u1202\3\u1213\3\u1215\3\u122d\3\u1282\3\u1288\3\u128a\3\u128a\3\u128c"+
		"\3\u128f\3\u1291\3\u129f\3\u12a1\3\u12aa\3\u12b2\3\u12e0\3\u1307\3\u130e"+
		"\3\u1311\3\u1312\3\u1315\3\u132a\3\u132c\3\u1332\3\u1334\3\u1335\3\u1337"+
		"\3\u133b\3\u133f\3\u133f\3\u1352\3\u1352\3\u135f\3\u1363\3\u1402\3\u1436"+
		"\3\u1449\3\u144c\3\u1482\3\u14b1\3\u14c6\3\u14c7\3\u14c9\3\u14c9\3\u1582"+
		"\3\u15b0\3\u15da\3\u15dd\3\u1602\3\u1631\3\u1646\3\u1646\3\u1682\3\u16ac"+
		"\3\u1702\3\u171b\3\u18a2\3\u18e1\3\u1901\3\u1901\3\u1ac2\3\u1afa\3\u1c02"+
		"\3\u1c0a\3\u1c0c\3\u1c30\3\u1c42\3\u1c42\3\u1c74\3\u1c91\3\u2002\3\u239b"+
		"\3\u2402\3\u2470\3\u2482\3\u2545\3\u3002\3\u3430\3\u4402\3\u4648\3\u6802"+
		"\3\u6a3a\3\u6a42\3\u6a60\3\u6ad2\3\u6aef\3\u6b02\3\u6b31\3\u6b42\3\u6b45"+
		"\3\u6b65\3\u6b79\3\u6b7f\3\u6b91\3\u6f02\3\u6f46\3\u6f52\3\u6f52\3\u6f95"+
		"\3\u6fa1\3\u6fe2\3\u6fe2\3\u7002\3\u87ee\3\u8802\3\u8af4\3\ub002\3\ub003"+
		"\3\ubc02\3\ubc6c\3\ubc72\3\ubc7e\3\ubc82\3\ubc8a\3\ubc92\3\ubc9b\3\ud402"+
		"\3\ud456\3\ud458\3\ud49e\3\ud4a0\3\ud4a1\3\ud4a4\3\ud4a4\3\ud4a7\3\ud4a8"+
		"\3\ud4ab\3\ud4ae\3\ud4b0\3\ud4bb\3\ud4bd\3\ud4bd\3\ud4bf\3\ud4c5\3\ud4c7"+
		"\3\ud507\3\ud509\3\ud50c\3\ud50f\3\ud516\3\ud518\3\ud51e\3\ud520\3\ud53b"+
		"\3\ud53d\3\ud540\3\ud542\3\ud546\3\ud548\3\ud548\3\ud54c\3\ud552\3\ud554"+
		"\3\ud6a7\3\ud6aa\3\ud6c2\3\ud6c4\3\ud6dc\3\ud6de\3\ud6fc\3\ud6fe\3\ud716"+
		"\3\ud718\3\ud736\3\ud738\3\ud750\3\ud752\3\ud770\3\ud772\3\ud78a\3\ud78c"+
		"\3\ud7aa\3\ud7ac\3\ud7c4\3\ud7c6\3\ud7cd\3\ue802\3\ue8c6\3\ue902\3\ue945"+
		"\3\uee02\3\uee05\3\uee07\3\uee21\3\uee23\3\uee24\3\uee26\3\uee26\3\uee29"+
		"\3\uee29\3\uee2b\3\uee34\3\uee36\3\uee39\3\uee3b\3\uee3b\3\uee3d\3\uee3d"+
		"\3\uee44\3\uee44\3\uee49\3\uee49\3\uee4b\3\uee4b\3\uee4d\3\uee4d\3\uee4f"+
		"\3\uee51\3\uee53\3\uee54\3\uee56\3\uee56\3\uee59\3\uee59\3\uee5b\3\uee5b"+
		"\3\uee5d\3\uee5d\3\uee5f\3\uee5f\3\uee61\3\uee61\3\uee63\3\uee64\3\uee66"+
		"\3\uee66\3\uee69\3\uee6c\3\uee6e\3\uee74\3\uee76\3\uee79\3\uee7b\3\uee7e"+
		"\3\uee80\3\uee80\3\uee82\3\uee8b\3\uee8d\3\uee9d\3\ueea3\3\ueea5\3\ueea7"+
		"\3\ueeab\3\ueead\3\ueebd\3\2\4\ua6d8\4\ua702\4\ub736\4\ub742\4\ub81f\4"+
		"\ub822\4\ucea3\4\uf802\4\ufa1f\4\61\2\3\3\2\2\2\2\5\3\2\2\2\2\7\3\2\2"+
		"\2\2\t\3\2\2\2\2\13\3\2\2\2\2\21\3\2\2\2\3\23\3\2\2\2\5\26\3\2\2\2\7\30"+
		"\3\2\2\2\t\32\3\2\2\2\13\34\3\2\2\2\r%\3\2\2\2\17\'\3\2\2\2\21)\3\2\2"+
		"\2\23\24\7\61\2\2\24\25\7\61\2\2\25\4\3\2\2\2\26\27\7\61\2\2\27\6\3\2"+
		"\2\2\30\31\7,\2\2\31\b\3\2\2\2\32\33\7#\2\2\33\n\3\2\2\2\34 \5\17\b\2"+
		"\35\37\5\r\7\2\36\35\3\2\2\2\37\"\3\2\2\2 \36\3\2\2\2 !\3\2\2\2!#\3\2"+
		"\2\2\" \3\2\2\2#$\b\6\2\2$\f\3\2\2\2%&\t\2\2\2&\16\3\2\2\2\'(\t\3\2\2"+
		"(\20\3\2\2\2)-\7)\2\2*,\13\2\2\2+*\3\2\2\2,/\3\2\2\2-.\3\2\2\2-+\3\2\2"+
		"\2.\60\3\2\2\2/-\3\2\2\2\60\61\7)\2\2\61\22\3\2\2\2\5\2 -\3\3\6\2";
	public static final ATN _ATN =
		new ATNDeserializer().deserialize(_serializedATN.toCharArray());
	static {
		_decisionToDFA = new DFA[_ATN.getNumberOfDecisions()];
		for (int i = 0; i < _ATN.getNumberOfDecisions(); i++) {
			_decisionToDFA[i] = new DFA(_ATN.getDecisionState(i), i);
		}
	}
}