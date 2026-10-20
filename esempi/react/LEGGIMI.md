# Demo React: Task Board

L'esempio è un componente React in TSX. Per eseguirlo serve un progetto React con bundler: 

```bash
npm create vite@latest task-board -- --template react-ts
cd task-board
npm install
# sostituisci src/App.tsx e src/style.css (o importa il CSS da un altro percorso)
npm run dev
```

Il CSS dell'esempio si importa con `import './style.css'`, perciò copia entrambi i file nella cartella `src`. L'esempio funziona localmente **senza backend** e conserva lo stato solo finché la pagina è aperta.
