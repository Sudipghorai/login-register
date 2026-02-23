All API Endpoints

`Register`
POST
http://localhost:3005/api/auth/register

`Login`
POST
http://localhost:3005/api/auth/login
POST
http://localhost:3005/api/auth/send-otp
POST
http://localhost:3005/api/auth/verify-otp

`Forgot password`
POST
http://localhost:3005/api/auth/forgot-password
POST
http://localhost:3005/api/auth/verify-reset-otp
POST
http://localhost:3005/api/auth/reset-password

`Get all users`
GET
http://localhost:3005/api/users/

`Bearer token`:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjMsImVtYWlsIjoic3VkaXBnaG9yYWk3N0BnbWFpbC5jb20iLCJpYXQiOjE3NzE4Mjg1OTgsImV4cCI6MTc3MTkxNDk5OH0.WfoR6q3tv8eeWkhIdihnBPUBIDf8i1PsjalyA8KCAs4

`Image properties`
POST
http://localhost:3005/api/users/upload-image
PUT
http://localhost:3005/api/users/edit
DELETE
http://localhost:3005/api/users/delete-image