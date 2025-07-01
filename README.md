This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# 📄 App Documentation

## ✅ Changing the API Key

1. **Get your OpenAI API key** from [openai.com](https://platform.openai.com/account/api-keys) and ensure you have credit.
2. **Navigate to your project directory** on your VPS:
   ```bash
   cd /path/to/your/project
   ```
3. **Edit the `.env` file** to update the API key:
   ```bash
   nano .env
   ```
   Change the value of `OPENAI_API_KEY` to your new key.

4. **Restart the app** (if using PM2 for process management):
   ```bash
   pm2 status
   pm2 stop <instance_number>
   pm2 delete <instance_number>
   npm run build
   pm2 start npm --name "your-app-name" -- start
   ```

---

## 🤖 Creating a Custom Chatbot and Embedding into Any Web App

1. **Open your browser and go to:**
   ```
   http://<your-server-ip>:3000/playground
   ```
2. **Enter the access code** (found in `.env` as `NEXT_PUBLIC_ACCESS_CODE`).
3. **Click "Create Chatbot"** and fill in the configuration (name, prompt, model, etc.). Optionally, upload context files for RAG.
4. **Click "Create"** to save your chatbot.
5. **Copy the embed script:**
   ```html
   <script src="http://<your-server-ip>:3000/embed.js"
           data-chatbot-id="YOUR_CHATBOT_ID"
           data-host-url="http://<your-server-ip>:3000">
   </script>
   ```
   - Replace `YOUR_CHATBOT_ID` with the ID of your created chatbot.

### 🔗 To embed the chatbot:

- **On any HTML website:** Paste the script above inside `<head>` or just before `</body>`.
- **In WordPress:** Use a plugin like "Insert Headers and Footers" or add to the Theme Editor.
- **In Webflow, Wix, Shopify:** Use the Custom Code section in site/page settings, paste before `</body>`.
- **In Odoo:** Go to Website → Edit → Custom Code, and paste the script.

---

## 🛠️ Accessing the PostgreSQL Database

1. **Open the database shell:**
   ```bash
   sudo -u postgres psql -U <db_user> -d <db_name>
   ```
   - Use credentials from `.env` (`PGUSER`, `PGDATABASE`, etc.).

2. **Connect to the chatbot-specific database:**
   ```sql
   \c neondb
   ```

3. **View available tables:**
   ```sql
   \dt
   ```

4. **View contents of the Customer table:**
   ```sql
   SELECT * FROM "Customer";
   ```

5. **View contents of the Thread table:**
   ```sql
   SELECT * FROM "Thread";
   ```

---

## ⚙️ Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key.
- `NEXT_PUBLIC_ACCESS_CODE`: Access code for the playground.
- `DATABASE_URL`: PostgreSQL connection string.
- (See `.env` for all variables.)

---

## 🚀 Deployment & Management

- **Development:**  
  ```bash
  npm run dev
  ```
- **Production build:**  
  ```bash
  npm run build
  npm start
  ```
- **With PM2:**  
  ```bash
  pm2 start npm --name "your-app-name" -- start
  ```

---

## 🧩 Features

- Create, manage, and delete chatbots via the `/playground` UI.
- Upload context files for RAG (Retrieval-Augmented Generation).
- Embed chatbots in any website with a simple script.
- All chatbot and thread data is stored in PostgreSQL (see `prisma/schema.prisma` for schema).

---

## 🔒 Security

- Access to the playground is protected by an access code (`NEXT_PUBLIC_ACCESS_CODE`).
- API keys and database credentials are stored in `.env` and should be kept secure.