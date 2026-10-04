# ApexPlanet Internship Tasks

A collection of web development projects created for the ApexPlanet internship by Arjun Jaiswal.

**Live site:** [arjunpjaiswal.github.io/ApexPlanetInternshipTasks](https://arjunpjaiswal.github.io/ApexPlanetInternshipTasks/)

## Projects

| Task | Project | Live page |
| --- | --- | --- |
| 1 | Placement Prep Hub | [Open Task 1](https://arjunpjaiswal.github.io/ApexPlanetInternshipTasks/task1/) |
| 2 | Placement Prep Tracker | [Open Task 2](https://arjunpjaiswal.github.io/ApexPlanetInternshipTasks/task2/) |
| 3 | Interactive Prep Dashboard | [Open Task 3](https://arjunpjaiswal.github.io/ApexPlanetInternshipTasks/task3/) |
| 4 | Portfolio | [Open Task 4](https://arjunpjaiswal.github.io/ApexPlanetInternshipTasks/task4/) |
| 5 | Portfolio Capstone | [Open Task 5](https://arjunpjaiswal.github.io/ApexPlanetInternshipTasks/task5/) |

## Repository Layout

- `index.html` is the task directory page served at the site root.
- `task1/` through `task4/` contain the first four published projects.
- `task5/` contains the built Task 5 site published by GitHub Pages.
- `task5-src/` contains the editable Task 5 source, npm files, and build script.

GitHub Pages publishes from the `main` branch at the repository root.

## Rebuild Task 5

From PowerShell:

```powershell
Set-Location task5-src
npm ci
npm run build
Copy-Item -Path dist\* -Destination ..\task5 -Recurse -Force
```

Commit and push the updated `task5/` output to publish the rebuild.
