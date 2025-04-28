
### Todoist
```todoist
filter: "today | overdue"
autorefresh: 120
```

### Memento Mori
```dataviewjs
const today = dv.date('2025-04-25')
const endOfYear = {
year: today.year,
month: 12,
day: 31
}

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
value = (today.year - birthday.year) / lifespan.year * 80;
break;
}

return `<progress value="${parseInt(value)}" max="100"></progress> &nbsp;&nbsp; ${parseInt(value)} %`

}

dv.span(`${progress("lifespan")}
`)
```

### Habits
- [ ] Writing
- [ ] Reading
- [ ] Meditation
- [ ] Exercise

### Daily Questions

Yesterday, did I do my best to...

- Grow spiritually/intellectually? #dailyquestions/spiritual:
- Love my partner? #dailyquestions/relationship :
- Create something? #dailyquestions/create:
- Exercise? #dailyquestions/exercise:

