---
title: Journal
---
> [!quote] Jack London
> Keep a notebook. Travel with it, eat with it, sleep with it. Slap into it every stray thought that flutters up in your brain. Cheap paper is less perishable than gray matter, and lead pencil markings endure longer than memory.

# Journal

This is where I capture daily reflections, shower thoughts, and evolving ideas that haven't yet crystallized into formal notes.

## Purpose

My journal entries serve as:

- A capture system for fleeting thoughts
- A space for philosophical exploration or venting
- A record of my evolving thinking process

## Recent Entries
```dataviewjs
dv.table(["Date", "Summary"],
  dv.pages("\"200 Journal\"")
    .where(p => !p.file.name.includes("_journal"))  // Exclude the _journal file
    .sort(p => p.file.cday, 'desc')
    .limit(5)
    .map(p => [
      p.file.link,
      p.file.frontmatter.summary || "No summary available"
    ])
)
```
