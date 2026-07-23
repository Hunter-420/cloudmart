services/
└── auth-service/
├── src/
│ ├── controllers/ --> receives HTTP request; extract data,  
| | call service, return JSON, no dB code
│ ├── middleware/ --> before controller; logging, error handle
│ ├── models/ --> dB operations
│ ├── routes/ --> maps URL
│ └── services/ --> business logic: validate user, gen JWT
│
├── package.json
├── Dockerfile
├── .env
└── index.js

<br>

working on:

Register user
Login
Verify JWT
Get current user profile
Logout (optional)
Refresh token (later)
