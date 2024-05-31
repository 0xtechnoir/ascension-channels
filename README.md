## Project Awakening System Contract Suite
This repository contains the client-only dapp framework for Project Awakening game interfacing, supported blockchain functionality via Viem, and blockchain based data state management. Built with Typescript, Material UI, Tailwind CSS, and Vite.

### Dependencies
- node.js (v16+)
- pnpm  (after installing node: ```npm install --global pnpm```)
- OneKey or EVE Vault wallet connected to ```https://devnet-data-sync.nursery.reitnorf.com```

### Deployment Process
1. To create a project called _my-eve-dapp_, run this command:

```
npx create-eve-dapp --type base my-eve-dapp
```

2. Then open the newly cloned repository

```
cd my-eve-dapp
```

3. Install packages

```
pnpm install
```

4. Run the app by starting the development server

```
pnpm run dev
```

5. View the live app at ```http://localhost:3000```

### Use
Further documentation on the Smart Deployable Base dApp is available at the [Project Awakening Docs](https://docs.projectawakening.io/developing/Dapp/quick-start).