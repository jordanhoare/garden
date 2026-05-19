Since context vars are specific to the current context, using .get() ensures we retrieve the value relevant to the current execution context, which can differ across threads or async tasks
