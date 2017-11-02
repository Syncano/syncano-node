# YAML Syntax

Syncano and Sockets configuration is defined through `YAML` syntax. Although JSON format is more popular, especially in the JS world, we chose to go with YAML because it's easier to read and write by humans. Indentation can be a part of the syntax so there's a lesser need for additional markup specific syntax characters.

> YAML is a [recursive acronym](https://en.wikipedia.org/wiki/Recursive_acronym) which stands for YAML Ain't markup language.

## Syntax Basics

### Dictionary
Dictionaries are represented by a `key: value` form. Keys are separated from values by a `:  ` (colon + space character). Indentation and newlines separate the key-value pairs:

```yaml
person:
  name: John Smith
  age: 33
```

### List
List items are lines beginning at the same indentation level starting with a `-  ` (dash + space):

```yaml
- Casablanca
- North by Northwest
- The Man Who Wasn't There
```

### Multiline strings
Values can span multiple lines. It’s used to make what would otherwise be a very long line easier to read and edit. Spanning multiple lines using a `|` will include the newlines:

```yaml
include_newlines: |
  There once was a short man from Ealing
  Who got on a bus to Darjeeling
     It said on the door
     "Please don't spit on the floor"
  So he carefully spat on the ceiling
```

Using '>' will ignore newlines:

```yaml
ignore_newlines: >
  Line below
  Will actually be above
  and this one also won't be a new one
```

In either case, the indentation will be ignored.

## Additional Resources

That should be enough to get you going with writing and editing Syncano Socket config files. In case you'd like to learn more, here are some useful resources and tools:

|URL|Description|
|---|---|
|http://www.yamllint.com/|YAML Syntax validator
|https://en.wikipedia.org/wiki/YAML|Wikipedia has some good examples of syntax and usage|
|https://github.com/search?utf8=%E2%9C%93&q=syncano-socket|A Github search for Syncano Sockets should give an idea about what can be done with config files.|
