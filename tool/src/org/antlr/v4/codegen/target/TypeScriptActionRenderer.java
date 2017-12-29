package org.antlr.v4.codegen.target;

import java.util.regex.Pattern;
import java.util.Locale;
import org.stringtemplate.v4.AttributeRenderer;

public class TypeScriptActionRenderer implements AttributeRenderer {
    static Pattern charCast = Pattern.compile("\\(char\\)");

    @Override
    public String toString(Object o, String formatString, Locale locale) {
        String result = o.toString();
        result = charCast.matcher(result).replaceAll("<number>");
        System.out.println("Action " + o + " now " + result);
        return result;
    }
}



