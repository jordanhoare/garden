
> [!quote] [contextvars — Context Variables — Python 3.13.3 documentation](https://docs.python.org/3/library/contextvars.html#contextvars.copy_context)
>This module provides APIs to manage, store, and access context-local state. The [`ContextVar`](https://docs.python.org/3/library/contextvars.html#contextvars.ContextVar "contextvars.ContextVar") class is used to declare and work with _Context Variables_. The [`copy_context()`](https://docs.python.org/3/library/contextvars.html#contextvars.copy_context "contextvars.copy_context") function and the [`Context`](https://docs.python.org/3/library/contextvars.html#contextvars.Context "contextvars.Context") class should be used to manage the current context in asynchronous frameworks.

#Context-managers that have state should use #Context-Variables instead of [`threading.local()`](https://docs.python.org/3/library/threading.html#threading.local "threading.local") to prevent their state from bleeding to other code unexpectedly, when used in concurrent code.





