---
date: <% tp.file.creation_date("YYYY-MM-DD HH:mm") %>
previous entry: '[[<% tp.date.now("YYYY-MM-DD", -1, tp.file.title, "YYYY-MM-DD") %>]]'
next entry: '[[<% tp.date.now("YYYY-MM-DD", 1, tp.file.title, "YYYY-MM-DD") %>]]'
tags:
  - showerthoughts
  - journal
summary: <% tp.system.prompt("Enter a brief summary for today's entry", "") %>
---

```dataviewjs
const today = dv.date('{{date:YYYY-MM-DD}}')
const lifespan = { year: 80 }
const birthday = DateTime.fromObject({
  year: 1996,
  month: 11,
  day: 12
});
const deathday = birthday.plus(lifespan)
function progress(type) {
  let value;
  switch(type) {
    case "lifespan":
      value = (today.year - birthday.year) / lifespan.year * 100;
      break;
  }
  return `<span style="font-weight: 600; font-size: 1em; margin-right: 15px;">Memento Mori</span><progress value="${parseInt(value)}" max="100" style="vertical-align: middle;"></progress> &nbsp;&nbsp; ${parseInt(value)}%`
}
dv.span(progress("lifespan"))
```



---

[[<% tp.date.now("YYYY-MM-DD", -1, tp.file.title, "YYYY-MM-DD") %>]] | [[200 Journal/_journal|Journal]] | [[<% tp.date.now("YYYY-MM-DD", 1, tp.file.title, "YYYY-MM-DD") %>]]
```

--- created: {{date:YYYY-MM-DD}} {{time:HH:mm}} tags: journal, showerthoughts summary: <!-- Brief summary of today's entry --> ---

[[<% tp.date.now("YYYY-MM-DD", -1, tp.file.title, "YYYY-MM-DD") %>|<< Previous]]  |  [[200 Journal/_journal|Journal]]  |  [[<% tp.date.now("YYYY-MM-DD", 1, tp.file.title, "YYYY-MM-DD") %>|Next >>]]


```dataviewjs
const today = dv.date('{{date:YYYY-MM-DD}}')
const lifespan = { year: 80 }
const birthday = DateTime.fromObject({
  year: 1996,
  month: 11,
  day: 12
});
const deathday = birthday.plus(lifespan)

function progress(type) {
  let value;
  switch(type) {
    case "lifespan":
      value = (today.year - birthday.year) / lifespan.year * 100;
      break;
  }
  return `<span style="font-weight: 600; font-size: 1em; margin-right: 15px;">Memento Mori</span><progress value="${parseInt(value)}" max="100" style="vertical-align: middle;"></progress> &nbsp;&nbsp; ${parseInt(value)}%`
}
dv.span(progress("lifespan"))
```


---

<div data-timeline="{{date:DDD}}"></div>
> [!quote] 
> 

