cd node
npm install
echo "ENV='PROD'" >> .env
/usr/bin/screen -d -m -S node node server.js