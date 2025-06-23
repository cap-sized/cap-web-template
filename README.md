# cap-web-template

Base template to build capsized web apps off of. Handles

- [x] Authentication
- [x] User/Session Management
- [x] Tables
  - [x] Basic table
  - [ ] Basic editable table
  - [ ] Basic paginated table
  - [ ] Basic sortable table
- [ ] Commonly used components
- [ ] Form builder

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev # -- --open (to open the app in a new browser tab)
npm run test
npm run format
npm run check
```

## Dev how tos

### How to support CRUD of a new table

Summary:

1. Add `Raw` datatype to `src/lib/types/db_<general_type>.ts`

- i.e. must be an interface that extends `Raw`
- `Raw` types are directly passed as JSON lines to Clickhouse

2. Add `View` datatype to src/lib/types/db\_<general_type>.ts

- View types can be anything, this is what is returned from any particular view in Clickhouse
- see `FullPlayerView` for example

3. Create a new subdirectory `<general_type>` under `src/routes/admin/` with necessary files

- Reference +page.server.ts and +page.svelte of `persons/`

4. Modify view column accessors to display info correctly

- for now, should only change the cell rendering function if necessary

5. Modify edit column accessors to display info correctly

- for now, should only change the cell update function

## Building

```bash
npm run build
npm run preview
```

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
