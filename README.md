# Expense Tracker

A small, accessible expense tracker built with vanilla HTML, CSS and JavaScript.

## Features
- Track income and expenses
- Persistent storage in `localStorage`
- Accessible HTML structure and keyboard focus styles
- Responsive layout and dark mode toggle
- Delete transactions with confirmation

## Development
Clone the repo and open it in your editor. You can preview the app using any static server. Example using `npx`:

```bash
git clone https://github.com/Ello858/expense-tracker
cd expense-tracker
npx http-server . -p 8080
# then open http://localhost:8080
```

Or use the Live Server extension in VSCode.

## Notes
- Currency formatting uses the browser locale and defaults to USD.
- Transactions are stored in `localStorage` under a versioned key.

If you'd like, I can add automated tests or a small build pipeline next.
