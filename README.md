# Contacter - A social media application - Back End part

This project is a social media application (PWA application made with react js and tailwindcss as a front end and powered by an express server and a mongoodb database) [Visite the app](https://contacter-app.netlify.app).\

Note 1 : this project is only for learning and practicing purposes.\
Note 2 : the images you upload the app will disappear after some times, because they are stored temporarliy in the heroku server

## Available Features

Create an account.\
Log in into your account.\
Log out from the account.\
Create a post (image or video or text or all).\
Like or comment a post in real time.\
Home Page to see friend's published posts.
Profile page with all the statistics: personal information, friends lists, posts you published.\
Add friend, Delete request and Confirm friend requests in real time.\
Friend's suggestion.\
Real time notifications when a friend accept your request, liked or commented on your post.\
Real time chats with friends, including video calls image and videos and text messages.\
Both member of the conversation can have nicknames.\
You can add a background image to any conversation you have.\
Friend search feature.\
Delete Post feature.\
Create post and preview it before publishing it.\
Edit profile feature.\
Dark mode is supported

### Used packages (Back End)

bcryptjs.\
cors.\
dotenv.\
express.\
express-fileupload.\
joi.\
jsonwebtoken.\
mongoose.\
socket.io.\
uuid.\
nodemon.\

### After cloning this project

Create a .env file in the root of your app and add :\
PORT=(server port)\
HOST=(backend host)\
TOKEN=(random jwt secret )\
DBURI=(mongoodb url)\
CLIENT=(react app url)\
[Front End Repo](https://github.com/AkliYalaoui/contacter-ui).
