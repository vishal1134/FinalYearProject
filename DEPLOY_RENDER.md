# Render Deployment Guide

This project is prepared for a two-service Render deployment:

- `land-registry-backend` as a Docker-based web service
- `land-registry-frontend` as a static site

The blueprint file is at [render.yaml](/c:/Users/janan/Spring/FinalYearProject/render.yaml:1).

## 1. Push the repo

Push the cleaned repository to GitHub.

## 2. Create MongoDB Atlas

Create a MongoDB Atlas cluster and copy the connection string.

Example:

```text
mongodb+srv://<username>:<password>@<cluster>/<db>?retryWrites=true&w=majority
```

Use that value for `MONGODB_URI`.

## 3. Create services in Render

In Render:

1. Click `New`.
2. Choose `Blueprint`.
3. Connect this repository.
4. Render will detect `render.yaml`.

This creates:

- `land-registry-backend`
- `land-registry-frontend`

## 4. Fill required environment variables

For the backend:

- `MONGODB_URI` = your MongoDB Atlas URI
- `CORS_ALLOWED_ORIGINS` = your frontend URL after Render creates it
- `FABRIC_ENABLED` = `false` for the first deployment

Example file:

- [env.render.example](/c:/Users/janan/Spring/FinalYearProject/Land-Registry-Backend/env.render.example:1)

For the frontend:

- `VITE_API_BASE_URL` = `https://<your-backend-service>.onrender.com/api`

Example file:

- [env.render.example](/c:/Users/janan/Spring/FinalYearProject/Land-Registry-Frontend/env.render.example:1)

`JWT_SECRET` is generated automatically by Render from the blueprint.

The backend uses [Dockerfile](/c:/Users/janan/Spring/FinalYearProject/Land-Registry-Backend/Dockerfile:1) because Render's current native runtimes do not include Java.

## 5. First deploy order

1. Let the backend deploy.
2. Copy the backend public URL.
3. Set `VITE_API_BASE_URL` in the frontend.
4. Let the frontend deploy.
5. Copy the frontend public URL.
6. Set `CORS_ALLOWED_ORIGINS` in the backend.
7. Redeploy the backend.

## 6. Verify the deployed app

Check:

- frontend loads
- login/register works
- backend connects to MongoDB Atlas
- frontend API requests no longer point to localhost

## 7. Hyperledger Fabric

Do not enable Fabric on Render first.

Start with:

```text
FABRIC_ENABLED=false
```

After the app works on Render, connect the backend to a separately hosted Fabric network by setting:

- `FABRIC_ENABLED=true`
- `FABRIC_CHANNEL_NAME`
- `FABRIC_CHAINCODE_NAME`
- `FABRIC_MSP_ID`
- `FABRIC_PEER_ENDPOINT`
- `FABRIC_PEER_HOST_ALIAS`
- `FABRIC_CERTIFICATE_PATH`
- `FABRIC_PRIVATE_KEY_PATH`
- `FABRIC_TLS_CERT_PATH`

For production-like deployment, Fabric should live outside this Render app stack.
