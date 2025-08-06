To update the code to the latest version on Raspberry Pi, run - /home/teja/update_flickfinder.sh
That .sh file contains the code below

#!/bin/bash
cd /home/teja/FlickFinder || exit

# Backup vite.config.js before resetting
cp flickfinder/vite.config.js /tmp/vite.config.js.bak

# Pull latest changes but keep .env files
git fetch origin main
git reset --hard origin/main
git clean -fd \
  -e .env \
  -e .env.local \
  -e .env.development \
  -e .env.production \
  -e vite.config.js

# Restore vite.config.js
cp /tmp/vite.config.js.bak flickfinder/vite.config.js

# Install dependencies
npm install

# Restart the app
pm2 restart flickfinder

----------------------------------------------------------------------------------------------------------------------

Add REACTPORT="https://flickfinder.tejachevuru.in/" , to the .env in the backend.
Add VITE_API_URL = https://apiflick.tejachevuru.in/api , to the .env in the flickfinder.

----------------------------------------------------------------------------------------------------------------------

Add the bottom code in the vite.config file in the flickfinder

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['flickfinder.tejachevuru.in', 'localhost']
  }
});

----------------------------------------------------------------------------------------------------------------------

Make sure the vite version is vite@4.5.0
to check - npm list -g vite
If not - vite@4.5.0 then uninstall vite and install vite@4.5.0 by below commands -
npm uninstall vite
npm install vite@4.5.0

To check if Vite is supported run - npx vite
If it shows "Illegal instruction" try reinstalling vite again.

----------------------------------------------------------------------------------------------------------------------

To run the code, go to the root directory and run - npm start 