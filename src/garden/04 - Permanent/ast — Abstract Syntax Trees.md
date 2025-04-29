
> [!quote] Wiki
>An abstract syntax tree (AST) is a data structure used in computer science to represent the structure of a program or code snippet. It is a tree representation of the abstract syntactic structure of text (often source code) written in a formal language. Each node of the tree denotes a construct occurring in the text. It is sometimes called just a syntax tree. 

### What is an Abstract Syntax Tree?

An abstract syntax tree is a tree representation of the abstract syntactic structure of source code written in a #programming-language.  It is called #abstract because it doesn't represent all the explicit details of real syntax (for example: semi colons, indents, parentheses etc..), but instead focuses on the structural and #semantic elements and their relationships, that underpin the responsibilities of the code #chunk(s).

- A tree representation of the abstract syntactic structure of source code
- Each node of the tree denotes a construct in the source code
- The syntax is "abstract" in the sense that it doesn't represent every detail that appears in the real syntax

##### Example:
```python
print(ast.dump(tree))
# Module(body=[Assign(targets=[Name(id='x', ctx=Store())], value=Constant(value=42))])
```


---

An #abstractsyntaxtree is like the difference between a detailed engineering blueprint of a house (showing every minor detail of measurements and arrangements of appliances and door ways etc..) versus a simplified floor plan of just rooms and provides a general relationship.  

ASTs are created __during__ compilation or interpretation. Regardless of writing in a #compiled language (like Go) or an #interpreted (like Python).  When code is processed - whether being compiled to machine code, translated to bytecode or directly interpreted - it typically involves #syntactic-analysis (A.K.A #parse-tree-construction, #ast-generation, #tree-building)

For popular modern languages, there truly are no exceptions to the #AST pattern. The AST stage is universally present for several crucial reasons.  Where each differs is typically in:
- the specific node types and structure of the AST vary significantly between languages.. the AST for Python code looks quite different from the AST for equivalent Go code
- the exposure (higher level languages often expose their ASTs through public APIs, while others keep them internal)
- the duration... some languages the AST parsing is #ephemeral (created and discarded), others cache the tree for later use
- and richness.. some ASTs retain far more source information like comments and whitespaces etc..

### Compiled Languages (Go, C++, Rust)
- Go's #compiler (gc) creates an AST from your source code
- This AST undergoes type checking and optimization
- The AST is then converted to an intermediate representation and finally to machine code
- This happens during the compilation phase, before your program runs

### Interpreted Languages (Python, JavaScript)
- Python's #interpreter creates an AST when it processes your .py files
- The AST is converted to #bytecode (.pyc files)
- The bytecode is then executed by the Python virtual machine
- This happens each time the program runs (though bytecode may be cached)

### JIT-Compiled Languages (Java, C#)
- Java first compiles source to bytecode (involving an AST)
- The #JVM then creates another #intermediate-representation (i.e.: #control-flow-graph) from bytecode when needed for JIT compilation
- Parts of the code that run frequently get #compiled to #machine-code
