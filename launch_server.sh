cd node
npm install
echo "ENV='PROD'" >> .env
screen -d -m -S node node server.js