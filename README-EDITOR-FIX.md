# WELCOME TO SPAGHETTI LAND 🍝

dont attempt to read this code only bot can rn idk how it works

---

# FoxBuilt Editor Fix - How This Whole Thing Works

**we basically made google docs for the site**

okay so basically the problem was the editor only updated kyles computer not the actual website lol... so we fixed it

## The Problem We Had

- dad edits the site on his office computer 
- looks great! prices updated! new pics!
- goes home, checks on phone... old site ???
- customers see... old site ???
- turns out it was only saving to that ONE computer's memory (localStorage)

## What We Built to Fix It

instead of saving to the computer's memory, we save to GitHub (where the code lives)... when GitHub updates, Netlify rebuilds the site automatically

### The New Flow

1. **Kyle uploads a pic** → goes straight to GitHub `/public/images/product-123.jpg`
2. **Kyle edits prices/text** → saved in memory for now
3. **Kyle hits "Save Draft"** → saves to `draft.json` on GitHub (but site doesn't rebuild)
4. **Kyle hits "Publish Live"** → updates `content.json` on GitHub → Netlify rebuilds → EVERYONE sees it!

## Why Two Buttons?

```
[💾 Save Draft] = save your work to the cloud (work on it from anywhere)
[🚀 Publish Live] = actually update the website
```

this way kyle can:
- work all day without triggering rebuilds
- switch devices (phone dies? no problem, draft is on GitHub)
- only rebuild when he's READY

## The Technical Stuff

### How We Prevent Spam Rebuilds

we use a `netlify.toml` file that says "only rebuild when content.json changes":

```toml
[build]
  ignore = "git diff --quiet $COMMIT_REF $CACHED_COMMIT_REF -- content.json"
```

so:
- upload 50 images? no rebuild
- save draft 100 times? no rebuild  
- hit publish once? ONE rebuild

### The GitHub Token

yeah we hardcoded the token right in the code... not "secure" but who cares its a furniture site not a bank. if you're worried about it:
1. make the repo private
2. or use environment variables later
3. or just change the token if someone messes with it

### What About Versions?

honestly? GitHub already saves every change with timestamps... instead of complicated V2.0-V9.0 system, just:
- current work = draft.json
- live site = content.json
- old versions = check GitHub history

## How to Test It

1. go to `/carrie` 
2. password: `foxbuilt2025`
3. change something
4. hit "Save Draft" (check GitHub - you'll see draft.json updated)
5. hit "Publish Live" (wait 30 seconds, main site updates!)

## Limits? What Limits?

- GitHub: basically unlimited for what we need
- Netlify: 300 build minutes/month (we use like 1 minute per publish)
- Images: GitHub has 100MB file limit but phone pics are like 5MB max

## Future Ideas

- maybe add image resizing (make em smaller before upload)
- could add preview button 
- might want to move token to environment variable eventually

## The Best Part

kyle can now:
- edit from anywhere
- not worry about losing work
- actually update the real website
- see what customers see

no more "why isn't the site updating???" confusion!

---

*built by khabefox because the old system was driving everyone crazy*