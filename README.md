# Coffee Brewing Tracker

A full-stack application for tracking coffee beans, brewing sessions, equipment, and recipes.

## What it does

- **Bean management** – catalog beans with roaster, origin, variety, processing method, roast profile, flavor notes, and more
- **Brew logging** – record brews with dose, water, grind, time, rating, and tasting notes
- **Recipes** – save and reuse brewing recipes per brewer
- **Equipment** – track brewers, grinders, and accessories
- **Roasters** – manage roasters with optional logo uploads
- **Stats** – dashboard and country-map statistics
- **AI features** – parse bean info from label images and brew logs from voice input

## Tech stack

| Layer | Stack |
|---|---|
| **Backend** | .NET 10, ASP.NET Core, EF Core, PostgreSQL, MediatR (CQRS), FluentValidation |
| **Frontend** | React 19, TypeScript, Vite, TanStack Query, Tailwind CSS, shadcn/ui |