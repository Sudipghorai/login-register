All API Endpoints

`Register`
POST
http://localhost:3005/api/auth/register

`Login`
`Step:1`
POST
http://localhost:3005/api/auth/login

`Step:2`
POST
http://localhost:3005/api/auth/send-otp

`Step:3`
POST
http://localhost:3005/api/auth/verify-otp

`Forgot password`
`Step:1`
POST
http://localhost:3005/api/auth/forgot-password

`Step:2`
POST
http://localhost:3005/api/auth/verify-reset-otp

`Step:3`
POST
http://localhost:3005/api/auth/reset-password

`Get all users`
GET
http://localhost:3005/api/users/

`Upload image`
POST
http://localhost:3005/api/users/upload-image

`Edit image`
PUT
http://localhost:3005/api/users/edit

`Delete image`
DELETE
http://localhost:3005/api/users/delete-image