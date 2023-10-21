const {Tokenizer} = require('./tokenizer');

class Parser {
    constructor() {
        this._string = '';
        this._Tokenizer = new Tokenizer();
    }

    parse(string) {
        this._string = string;
        this._Tokenizer.init(string);

        this._lookahead = this._Tokenizer.getNextToken();

        return this.program();
    }

    // main entry point
    program() {
        return {
            type: 'Program',
            body: this.StatementList()
        };
    }

    StatementList(stopLookAhead = null) {
        const statmentList = [this.Statement()];

        // to avoid left recursion
        while(this._lookahead != null && this._lookahead.type !== stopLookAhead) {
            statmentList.push(this.Statement())
        }

        return statmentList;
    }

    Statement() {
        switch (this._lookahead.type) {
            case '{':
                return  this.BlockStatement();
            default :
                return this.ExpressionStatement();
        }
    }

    BlockStatement() {
        this._eat('{');
        const body = this._lookahead.type !== '}' ? this.StatementList('}') : [];

        this._eat('}');

        return {
            type: 'BlockStatement',
            body
        };
    }

    ExpressionStatement() {
        const expression = this.Expression();
        this._eat(';');
        return {
            type: 'ExpressionStatement',
            expression
        }
    }

    Expression() {
        return this.Literal();
    }

    Literal() {
        switch(this._lookahead.type) {
            case 'NUMBER':
                return this.NumericLiteral();
            case 'STRING':
                return this.StringLiteral();
        }
        throw new SyntaxError(
            `Unexpected literal production  `
        )
    }

    NumericLiteral() {
        const token = this._eat('NUMBER');
        return {
            type: 'NumericLiteral',
            value: Number(token.value)
        };
    }

    StringLiteral() {
        const token = this._eat('STRING');

        return {
            type: 'StringLiteral',
            value: token.value.slice(1, -1) // slicing the quotes
        };
    }

    _eat(tokenType) {
        const token = this._lookahead;

        if(token == null) {
            throw new SyntaxError(
                `Unexpected end of input, expected: "${tokenType}"` 
            );
        }

        if(token.type !== tokenType) {
            throw new SyntaxError(
                `Unexpected token: "${token.value}", expected: "${tokenType}"`
            )
        }

        this._lookahead = this._Tokenizer.getNextToken();

        return token;
    }

}

module.exports = {
    Parser
};