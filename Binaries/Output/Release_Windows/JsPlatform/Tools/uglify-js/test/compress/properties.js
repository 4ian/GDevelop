keep_properties: {
    options = {
        properties: false
    };
    input: {
        a["foo"] = "bar";
    }
    expect: {
        a["foo"] = "bar";
    }
}

dot_properties: {
    options = {
        properties: true
    };
    input: {
        a["foo"] = "bar";
        a["if"] = "if";
        a["*"] = "asterisk";
        a["\u0EB3"] = "unicode";
        a[""] = "whitespace";
        a["1_1"] = "foo";
    }
    expect: {
        a.foo = "bar";
        a["if"] = "if";
        a["*"] = "asterisk";
        a["\u0EB3"] = "unicode";
        a[""] = "whitespace";
        a["1_1"] = "foo";
    }
}

dot_properties_es5: {
    options = {
        properties: true,
        screw_ie8: true
    };
    input: {
        a["foo"] = "bar";
        a["if"] = "if";
        a["*"] = "asterisk";
        a["\u0EB3"] = "unicode";
        a[""] = "whitespace";
    }
    expect: {
        a.foo = "bar";
        a.if = "if";
        a["*"] = "asterisk";
        a["\u0EB3"] = "unicode";
        a[""] = "whitespace";
    }
}

evaluate_length: {
    options = {
        properties: true,
        unsafe: true,
        evaluate: true
    };
    input: {
        a = "foo".length;
        a = ("foo" + "bar")["len" + "gth"];
        a = b.length;
        a = ("foo" + b).length;
    }
    expect: {
        a = 3;
        a = 6;
        a = b.length;
        a = ("foo" + b).length;
    }
}
